import { NextResponse } from "next/server";
import { z } from "zod";

import { getPublicCampaignBySlug } from "@/lib/campaigns";
import { publicEnv, hasSupabaseAdminEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const addressSchema = z.object({
  country: z.string().trim().min(1),
  postalCode: z.string().trim().min(1),
  state: z.string().trim().min(1),
  city: z.string().trim().min(1),
  addressLine1: z.string().trim().min(1),
  addressLine2: z.string().trim().optional(),
});

const checkoutRequestSchema = z.object({
  campaignSlug: z.string().min(1),
  rewardId: z.string().min(1),
  supporterName: z.string().trim().min(1),
  supporterNickname: z.string().trim().min(1),
  supporterEmail: z.email(),
  supporterPhone: z.string().trim().optional(),
  address: addressSchema.optional(),
});

export async function POST(request: Request) {
  try {
    const body = checkoutRequestSchema.parse(await request.json());
    const campaign = await getPublicCampaignBySlug(body.campaignSlug);

    if (!campaign) {
      return NextResponse.json(
        { error: "対象の案件が見つかりません。" },
        { status: 404 },
      );
    }

    const reward = campaign.rewards.find((item) => item.id === body.rewardId);

    if (!reward) {
      return NextResponse.json(
        { error: "対象のリターンが見つかりません。" },
        { status: 404 },
      );
    }

    if (reward.requiresShipping && !body.address) {
      return NextResponse.json(
        { error: "配送が必要な返礼品のため、住所入力が必要です。" },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    let orderId: string | undefined;

    if (hasSupabaseAdminEnv()) {
      const supabase = createSupabaseAdminClient();
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          campaign_id: campaign.id,
          supporter_email: body.supporterEmail,
          supporter_name: body.supporterName,
          supporter_nickname: body.supporterNickname,
          supporter_phone: body.supporterPhone || null,
          amount_total: reward.price,
          currency: "JPY",
          status: "pending",
        })
        .select("id")
        .single();

      if (orderError) {
        return NextResponse.json(
          { error: "注文情報の仮登録に失敗しました。" },
          { status: 500 },
        );
      }

      orderId = order.id;

      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: orderId,
        reward_id: reward.id,
        quantity: 1,
        unit_amount: reward.price,
        line_amount: reward.price,
      });

      if (itemError) {
        return NextResponse.json(
          { error: "注文明細の作成に失敗しました。" },
          { status: 500 },
        );
      }

      if (reward.requiresShipping && body.address) {
        const { error: shippingError } = await supabase
          .from("shipping_addresses")
          .insert({
            order_id: orderId,
            country: body.address.country,
            postal_code: body.address.postalCode,
            state: body.address.state,
            city: body.address.city,
            address_line1: body.address.addressLine1,
            address_line2: body.address.addressLine2 || null,
            recipient_name: body.supporterName,
          });

        if (shippingError) {
          return NextResponse.json(
            { error: "配送先情報の保存に失敗しました。" },
            { status: 500 },
          );
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${siteUrl}/support/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/support/cancel`,
      billing_address_collection: "auto",
      customer_email: body.supporterEmail,
      line_items: [
        {
          price_data: {
            currency: "jpy",
            unit_amount: reward.price,
            product_data: {
              name: `${campaign.talentName} - ${reward.title}`,
              description: reward.description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: orderId ?? "",
        campaignId: campaign.id,
        campaignSlug: campaign.slug,
        rewardId: reward.id,
        talentName: campaign.talentName,
        supporterName: body.supporterName,
        supporterNickname: body.supporterNickname,
        supporterEmail: body.supporterEmail,
        supporterPhone: body.supporterPhone || "",
        shippingCountry: body.address?.country || "",
        shippingPostalCode: body.address?.postalCode || "",
        shippingState: body.address?.state || "",
        shippingCity: body.address?.city || "",
        shippingAddressLine1: body.address?.addressLine1 || "",
        shippingAddressLine2: body.address?.addressLine2 || "",
      },
    });

    if (hasSupabaseAdminEnv() && orderId) {
      const supabase = createSupabaseAdminClient();

      await supabase
        .from("orders")
        .update({
          stripe_checkout_session_id: session.id,
        })
        .eq("id", orderId);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "決済セッションの作成に失敗しました。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
