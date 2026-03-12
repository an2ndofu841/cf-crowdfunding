export type UserRole = "super_admin" | "staff" | "talent" | "supporter";

export type CampaignStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "closed"
  | "archived";

export type CampaignReward = {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity?: number | null;
  requiresShipping: boolean;
};

export type Campaign = {
  id: string;
  slug: string;
  talentName: string;
  title: string;
  summary: string;
  description: string;
  raisedAmount: number;
  goalAmount: number;
  endDate: string;
  status: CampaignStatus;
  rewards: CampaignReward[];
};

export type DashboardCampaign = {
  id: string;
  slug: string;
  title: string;
  talentName: string;
  goalAmount: number;
  raisedAmount: number;
  endDate: string;
  status: CampaignStatus;
};

export type SupportAddress = {
  country: string;
  postalCode: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
};

export type SupportCheckoutInput = {
  campaignSlug: string;
  rewardId: string;
  supporterName: string;
  supporterNickname: string;
  supporterEmail: string;
  supporterPhone?: string;
  address?: SupportAddress;
};
