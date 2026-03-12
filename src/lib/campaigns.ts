import { getCampaignBySlug as getMockCampaignBySlug, mockCampaigns } from "@/data/mock-campaigns";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Campaign, CampaignReward, DashboardCampaign, UserRole } from "@/types/domain";

type CampaignRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  goal_amount: number;
  currency: string;
  status: Campaign["status"];
  ends_at: string;
  talents: { name: string } | { name: string }[] | null;
  campaign_rewards?: RewardRow[] | null;
  orders?: OrderRow[] | null;
};

type RewardRow = {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number | null;
  requires_shipping: boolean;
  is_active?: boolean;
  sort_order?: number;
};

type OrderRow = {
  amount_total: number;
  status: string;
};

function getTalentName(talents: CampaignRow["talents"]) {
  if (!talents) {
    return "所属タレント";
  }

  return Array.isArray(talents) ? talents[0]?.name ?? "所属タレント" : talents.name;
}

function getRaisedAmount(orders: OrderRow[] | null | undefined) {
  return (orders ?? [])
    .filter((order) => order.status === "paid")
    .reduce((sum, order) => sum + order.amount_total, 0);
}

function normalizeDate(value: string) {
  return value.slice(0, 10);
}

function mapReward(row: RewardRow): CampaignReward {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    quantity: row.quantity,
    requiresShipping: row.requires_shipping,
  };
}

function mapCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    slug: row.slug,
    talentName: getTalentName(row.talents),
    title: row.title,
    summary: row.summary,
    description: row.description,
    raisedAmount: getRaisedAmount(row.orders),
    goalAmount: row.goal_amount,
    endDate: normalizeDate(row.ends_at),
    status: row.status,
    rewards: (row.campaign_rewards ?? [])
      .filter((reward) => reward.is_active ?? true)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(mapReward),
  };
}

function mapDashboardCampaign(campaign: Campaign): DashboardCampaign {
  return {
    id: campaign.id,
    slug: campaign.slug,
    title: campaign.title,
    talentName: campaign.talentName,
    goalAmount: campaign.goalAmount,
    raisedAmount: campaign.raisedAmount,
    endDate: campaign.endDate,
    status: campaign.status,
  };
}

function getMockDashboardCampaigns() {
  return mockCampaigns.map(mapDashboardCampaign);
}

export async function getPublicCampaigns() {
  if (!hasSupabaseAdminEnv()) {
    return mockCampaigns;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(
      `
        id,
        slug,
        title,
        summary,
        description,
        goal_amount,
        currency,
        status,
        ends_at,
        talents(name),
        campaign_rewards(id, title, description, price, quantity, requires_shipping, is_active, sort_order),
        orders(amount_total, status)
      `,
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return mockCampaigns;
  }

  return (data as CampaignRow[]).map(mapCampaign);
}

export async function getPublicCampaignBySlug(slug: string) {
  if (!hasSupabaseAdminEnv()) {
    return getMockCampaignBySlug(slug);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(
      `
        id,
        slug,
        title,
        summary,
        description,
        goal_amount,
        currency,
        status,
        ends_at,
        talents(name),
        campaign_rewards(id, title, description, price, quantity, requires_shipping, is_active, sort_order),
        orders(amount_total, status)
      `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return getMockCampaignBySlug(slug);
  }

  return mapCampaign(data as CampaignRow);
}

export async function getDashboardCampaigns(userId: string, role: UserRole) {
  if (!hasSupabaseAdminEnv()) {
    return getMockDashboardCampaigns();
  }

  if (role === "supporter") {
    return [];
  }

  const supabase = createSupabaseAdminClient();

  let talentIds: string[] | null = null;

  if (role === "talent") {
    const { data: talents } = await supabase
      .from("talents")
      .select("id")
      .eq("profile_id", userId);

    talentIds = (talents ?? []).map((talent) => talent.id);

    if (talentIds.length === 0) {
      return [];
    }
  }

  let query = supabase.from("campaigns").select(
    `
      id,
      slug,
      title,
      summary,
      description,
      goal_amount,
      currency,
      status,
      ends_at,
      talents(name),
      campaign_rewards(id, title, description, price, quantity, requires_shipping, is_active, sort_order),
      orders(amount_total, status)
    `,
  );

  if (talentIds) {
    query = query.in("talent_id", talentIds);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as CampaignRow[]).map(mapCampaign).map(mapDashboardCampaign);
}
