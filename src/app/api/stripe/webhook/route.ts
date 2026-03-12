import { NextResponse } from "next/server";
import Stripe from "stripe";

import { hasSupabaseAdminEnv, serverEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature || !serverEnv.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret または署名ヘッダーが不足しています。" },
      { status: 400 },
    );
  }

  try {
    const payload = await request.text();
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      serverEnv.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId && hasSupabaseAdminEnv()) {
          const supabase = createSupabaseAdminClient();
          const supporterEmail =
            session.customer_details?.email ?? session.metadata?.supporterEmail;

          await supabase
            .from("orders")
            .update({
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : null,
              supporter_email: supporterEmail,
              supporter_name: session.metadata?.supporterName ?? null,
              supporter_nickname: session.metadata?.supporterNickname ?? null,
              supporter_phone: session.metadata?.supporterPhone || null,
              country:
                session.customer_details?.address?.country ??
                session.metadata?.shippingCountry ??
                null,
              status: "paid",
            })
            .eq("id", orderId);
        }

        console.log("checkout.session.completed", {
          id: session.id,
          orderId,
          campaignId: session.metadata?.campaignId,
          rewardId: session.metadata?.rewardId,
        });
        break;
      }
      case "charge.refunded":
        console.log("charge.refunded", event.data.object.id);
        break;
      default:
        console.log("Unhandled stripe event", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook 処理に失敗しました。";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
