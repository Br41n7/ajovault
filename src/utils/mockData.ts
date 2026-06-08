/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  SavingsGroup,
  GroupMember,
  Round,
  Contribution,
  Payout,
  Transaction,
  Dispute,
  UserRole,
  KYCStatus,
  GroupStatus,
  ContributionFrequency,
  PayoutOrder,
  ContributionStatus,
  PayoutStatus,
  TransactionType,
  TransactionStatus,
  DisputeStatus,
  PlanTier,
  AuditLog
} from "../types";

export const BANK_LIST = [
  { code: "011", name: "First Bank of Nigeria" },
  { code: "058", name: "Guaranty Trust Bank (GTBank)" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "057", name: "Zenith Bank" },
  { code: "044", name: "Access Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "101", name: "Providus Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "50211", name: "Kuda Microfinance Bank" },
  { code: "50515", name: "Moniepoint MFB" },
  { code: "50823", name: "OPay Microfinance Bank" }
];

export const INITIAL_USER: User = {
  id: "user-1",
  email: "iyanuolalegan@gmail.com",
  phone: "2348123456789",
  firstName: "Iyanu",
  lastName: "Legan",
  displayName: "Iyanu L.",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  role: UserRole.GROUP_ADMIN,
  kycStatus: KYCStatus.PENDING,
  isActive: true,
  timezone: "Africa/Lagos",
  planTier: PlanTier.FREE,
  walletBalance: 42500,
  currency: "NGN",
  trustScore: 98,
  joinedAt: "2026-01-15T10:00:00Z"
};

export const INITIAL_PEOPLE = [
  { id: "user-1", name: "Iyanu Legan", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" },
  { id: "user-2", name: "Chinedu Okafor", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" },
  { id: "user-3", name: "Fatima Bello", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" },
  { id: "user-4", name: "Olumide Adebayo", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200" },
  { id: "user-5", name: "Yusuf Danjuma", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200" },
  { id: "user-6", name: "Theresa Nwachukwu", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" },
  { id: "user-7", name: "Amina Yusuf", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200" },
  { id: "user-8", name: "Babajide Soyinka", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200" }
];

export const INITIAL_GROUPS: SavingsGroup[] = [
  {
    id: "group-1",
    name: "Lagos FinTech Builders",
    description: "Rotational savings circle for software developers and builders in Lagos. Ensuring trust and consistent monthly capital injection.",
    adminId: "user-1",
    status: GroupStatus.ACTIVE,
    contributionAmount: 50000,
    currency: "NGN",
    frequency: ContributionFrequency.MONTHLY,
    payoutOrder: PayoutOrder.FIXED,
    maxMembers: 6,
    currentRound: 3,
    totalRounds: 6,
    startDate: "2026-04-01T00:00:00Z",
    nextContributionDate: "2026-07-01T23:59:59Z",
    nextPayoutDate: "2026-07-05T12:00:00Z",
    inviteCode: "FINTECH-LGS-X8Y",
    isPrivate: false,
    penaltyRate: 0.05,
    gracePeriodHours: 48,
    coverImageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
    createdAt: "2026-03-10T11:42:00Z"
  },
  {
    id: "group-2",
    name: "Abuja Cooperative Adashe",
    description: "An authentic Northern-Nigeria style Adashe circle for mutual enterprise growth and asset finance.",
    adminId: "user-3", // Fatima Bello
    status: GroupStatus.FORMING,
    contributionAmount: 100000,
    currency: "NGN",
    frequency: ContributionFrequency.MONTHLY,
    payoutOrder: PayoutOrder.RANDOM,
    maxMembers: 8,
    currentRound: 0,
    totalRounds: 8,
    inviteCode: "ABUJA-COOP-BZE",
    isPrivate: false,
    penaltyRate: 0.10,
    gracePeriodHours: 24,
    coverImageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    createdAt: "2026-06-01T08:15:00Z"
  }
];

export const INITIAL_MEMBERS: GroupMember[] = [
  // Members for group 1 (6 members, locked)
  { id: "gm-1-1", groupId: "group-1", userId: "user-1", displayName: "Iyanu L.", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", payoutPosition: 1, isActive: true, hasReceivedPayout: true, trustScore: 98, totalContributed: 150000, totalMissed: 0, totalLate: 0, joinedAt: "2026-03-12T14:30:00Z" },
  { id: "gm-1-2", groupId: "group-1", userId: "user-2", displayName: "Chinedu O.", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200", payoutPosition: 2, isActive: true, hasReceivedPayout: true, trustScore: 95, totalContributed: 150000, totalMissed: 0, totalLate: 1, joinedAt: "2026-03-13T09:20:00Z" },
  { id: "gm-1-3", groupId: "group-1", userId: "user-3", displayName: "Fatima B.", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", payoutPosition: 3, isActive: true, hasReceivedPayout: false, trustScore: 100, totalContributed: 100000, totalMissed: 0, totalLate: 0, joinedAt: "2026-03-13T10:15:00Z" },
  { id: "gm-1-4", groupId: "group-1", userId: "user-4", displayName: "Olumide A.", avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200", payoutPosition: 4, isActive: true, hasReceivedPayout: false, trustScore: 78, totalContributed: 100000, totalMissed: 1, totalLate: 2, joinedAt: "2026-03-15T11:00:00Z" },
  { id: "gm-1-5", groupId: "group-1", userId: "user-5", displayName: "Yusuf D.", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200", payoutPosition: 5, isActive: true, hasReceivedPayout: false, trustScore: 94, totalContributed: 100000, totalMissed: 0, totalLate: 0, joinedAt: "2026-03-15T15:20:00Z" },
  { id: "gm-1-6", groupId: "group-1", userId: "user-6", displayName: "Theresa N.", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", payoutPosition: 6, isActive: true, hasReceivedPayout: false, trustScore: 90, totalContributed: 100000, totalMissed: 0, totalLate: 1, joinedAt: "2026-03-16T10:05:00Z" },

  // Members for group 2 (Forming, currently has 4 members)
  { id: "gm-2-1", groupId: "group-2", userId: "user-3", displayName: "Fatima B.", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", isActive: true, hasReceivedPayout: false, trustScore: 100, totalContributed: 0, totalMissed: 0, totalLate: 0, joinedAt: "2026-06-01T08:15:00Z" },
  { id: "gm-2-2", groupId: "group-2", userId: "user-7", displayName: "Amina Y.", avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200", isActive: true, hasReceivedPayout: false, trustScore: 99, totalContributed: 0, totalMissed: 0, totalLate: 0, joinedAt: "2026-06-03T11:45:00Z" },
  { id: "gm-2-3", groupId: "group-2", userId: "user-8", displayName: "Babajide S.", avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200", isActive: true, hasReceivedPayout: false, trustScore: 94, totalContributed: 0, totalMissed: 0, totalLate: 0, joinedAt: "2026-06-04T16:10:00Z" },
  { id: "gm-2-4", groupId: "group-2", userId: "user-1", displayName: "Iyanu L.", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", isActive: true, hasReceivedPayout: false, trustScore: 98, totalContributed: 0, totalMissed: 0, totalLate: 0, joinedAt: "2026-06-05T09:00:00Z" }
];

export const INITIAL_ROUNDS: Round[] = [
  // Round list for group 1 (Monthly payouts)
  { id: "round-1-1", groupId: "group-1", roundNumber: 1, payoutMemberId: "gm-1-1", startDate: "2026-04-01T00:00:00Z", endDate: "2026-04-30T23:59:59Z", isComplete: true, totalCollected: 300000, expectedAmount: 300000 },
  { id: "round-1-2", groupId: "group-1", roundNumber: 2, payoutMemberId: "gm-1-2", startDate: "2026-05-01T00:00:00Z", endDate: "2026-05-31T23:59:59Z", isComplete: true, totalCollected: 300000, expectedAmount: 300000 },
  { id: "round-1-3", groupId: "group-1", roundNumber: 3, payoutMemberId: "gm-1-3", startDate: "2026-06-01T00:00:00Z", endDate: "2026-06-30T23:59:59Z", isComplete: false, totalCollected: 150000, expectedAmount: 300000 },
  { id: "round-1-4", groupId: "group-1", roundNumber: 4, payoutMemberId: "gm-1-4", startDate: "2026-07-01T00:00:00Z", endDate: "2026-07-31T23:59:59Z", isComplete: false, totalCollected: 0, expectedAmount: 300000 },
  { id: "round-1-5", groupId: "group-1", roundNumber: 5, payoutMemberId: "gm-1-5", startDate: "2026-08-01T00:00:00Z", endDate: "2026-08-31T23:59:59Z", isComplete: false, totalCollected: 0, expectedAmount: 300000 },
  { id: "round-1-6", groupId: "group-1", roundNumber: 6, payoutMemberId: "gm-1-6", startDate: "2026-09-01T00:00:00Z", endDate: "2026-09-30T23:59:59Z", isComplete: false, totalCollected: 0, expectedAmount: 300000 }
];

export const INITIAL_CONTRIBUTIONS: Contribution[] = [
  // Round 1 contributions (All paid)
  { id: "c-1-1-1", groupId: "group-1", memberId: "gm-1-1", userId: "user-1", roundId: "round-1-1", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-04-25T23:59:59Z", paidAt: "2026-04-20T10:00:00Z", paymentChannel: "wallet" },
  { id: "c-1-1-2", groupId: "group-1", memberId: "gm-1-2", userId: "user-2", roundId: "round-1-1", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-04-25T23:59:59Z", paidAt: "2026-04-22T08:15:00Z", paymentChannel: "card" },
  { id: "c-1-1-3", groupId: "group-1", memberId: "gm-1-3", userId: "user-3", roundId: "round-1-1", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-04-25T23:59:59Z", paidAt: "2026-04-23T14:30:00Z", paymentChannel: "bank_transfer" },
  { id: "c-1-1-4", groupId: "group-1", memberId: "gm-1-4", userId: "user-4", roundId: "round-1-1", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-04-25T23:59:59Z", paidAt: "2026-04-24T18:40:00Z", paymentChannel: "card" },
  { id: "c-1-1-5", groupId: "group-1", memberId: "gm-1-5", userId: "user-5", roundId: "round-1-1", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-04-25T23:59:59Z", paidAt: "2026-04-21T11:20:00Z", paymentChannel: "bank_transfer" },
  { id: "c-1-1-6", groupId: "group-1", memberId: "gm-1-6", userId: "user-6", roundId: "round-1-1", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-04-25T23:59:59Z", paidAt: "2026-04-25T11:00:00Z", paymentChannel: "card" },

  // Round 2 contributions (All paid, Chinedu paid late)
  { id: "c-1-2-1", groupId: "group-1", memberId: "gm-1-1", userId: "user-1", roundId: "round-1-2", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-05-25T23:59:59Z", paidAt: "2026-05-21T16:45:00Z", paymentChannel: "wallet" },
  { id: "c-1-2-2", groupId: "group-1", memberId: "gm-1-2", userId: "user-2", roundId: "round-1-2", amount: 50000, penaltyAmount: 2500, status: ContributionStatus.PAID, dueDate: "2026-05-25T23:59:59Z", paidAt: "2026-05-28T09:00:00Z", paymentChannel: "card" },
  { id: "c-1-2-3", groupId: "group-1", memberId: "gm-1-3", userId: "user-3", roundId: "round-1-2", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-05-25T23:59:59Z", paidAt: "2026-05-23T11:20:00Z", paymentChannel: "bank_transfer" },
  { id: "c-1-2-4", groupId: "group-1", memberId: "gm-1-4", userId: "user-4", roundId: "round-1-2", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-05-25T23:59:59Z", paidAt: "2026-05-24T12:00:00Z", paymentChannel: "bank_transfer" },
  { id: "c-1-2-5", groupId: "group-1", memberId: "gm-1-5", userId: "user-5", roundId: "round-1-2", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-05-25T23:59:59Z", paidAt: "2026-05-22T15:30:00Z", paymentChannel: "wallet" },
  { id: "c-1-2-6", groupId: "group-1", memberId: "gm-1-6", userId: "user-6", roundId: "round-1-2", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-05-25T23:59:59Z", paidAt: "2026-05-25T14:15:00Z", paymentChannel: "card" },

  // Round 3 contributions (Active, some paid, some outstanding, Olumide: LATE / MISSED)
  { id: "c-1-3-1", groupId: "group-1", memberId: "gm-1-1", userId: "user-1", roundId: "round-1-3", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-06-25T23:59:59Z", paidAt: "2026-06-18T10:30:00Z", paymentChannel: "wallet" },
  { id: "c-1-3-2", groupId: "group-1", memberId: "gm-1-2", userId: "user-2", roundId: "round-1-3", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-06-25T23:59:59Z", paidAt: "2026-06-20T11:15:00Z", paymentChannel: "card" },
  { id: "c-1-3-3", groupId: "group-1", memberId: "gm-1-3", userId: "user-3", roundId: "round-1-3", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PAID, dueDate: "2026-06-25T23:59:59Z", paidAt: "2026-06-19T14:20:00Z", paymentChannel: "wallet" },
  { id: "c-1-3-4", groupId: "group-1", memberId: "gm-1-4", userId: "user-4", roundId: "round-1-3", amount: 50000, penaltyAmount: 2500, status: ContributionStatus.MISSED, dueDate: "2026-06-24T23:59:59Z" }, // Missed, triggered dispute!
  { id: "c-1-3-5", groupId: "group-1", memberId: "gm-1-5", userId: "user-5", roundId: "round-1-3", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PENDING, dueDate: "2026-06-25T23:59:59Z" },
  { id: "c-1-3-6", groupId: "group-1", memberId: "gm-1-6", userId: "user-6", roundId: "round-1-3", amount: 50000, penaltyAmount: 0, status: ContributionStatus.PENDING, dueDate: "2026-06-25T23:59:59Z" }
];

export const INITIAL_PAYOUTS: Payout[] = [
  { id: "p-1-1", groupId: "group-1", memberId: "gm-1-1", userId: "user-1", roundId: "round-1-1", amount: 300000, platformFee: 4500, netAmount: 295500, status: PayoutStatus.COMPLETED, scheduledFor: "2026-04-30T12:00:00Z", processedAt: "2026-04-30T14:15:00Z", bankName: "Guaranty Trust Bank (GTBank)", accountNumber: "0123456789" },
  { id: "p-1-2", groupId: "group-1", memberId: "gm-1-2", userId: "user-2", roundId: "round-1-2", amount: 300000, platformFee: 4500, netAmount: 295500, status: PayoutStatus.COMPLETED, scheduledFor: "2026-05-31T12:00:00Z", processedAt: "2026-05-31T15:30:00Z", bankName: "Zenith Bank", accountNumber: "5082143525" },
  { id: "p-1-3", groupId: "group-1", memberId: "gm-1-3", userId: "user-3", roundId: "round-1-3", amount: 300000, platformFee: 4500, netAmount: 295500, status: PayoutStatus.SCHEDULED, scheduledFor: "2026-06-30T12:00:00Z" }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t-1", userId: "user-1", username: "Iyanu L.", type: TransactionType.CONTRIBUTION, status: TransactionStatus.SUCCESS, amount: 50000, currency: "NGN", reference: "TX-CONT-10029", createdAt: "2026-04-20T10:00:00Z", groupId: "group-1", groupName: "Lagos FinTech Builders" },
  { id: "t-2", userId: "user-1", username: "Iyanu L.", type: TransactionType.PAYOUT, status: TransactionStatus.SUCCESS, amount: 295500, currency: "NGN", reference: "TX-PAY-10041", createdAt: "2026-04-30T14:15:00Z", groupId: "group-1", groupName: "Lagos FinTech Builders" },
  { id: "t-3", userId: "user-1", username: "Iyanu L.", type: TransactionType.CONTRIBUTION, status: TransactionStatus.SUCCESS, amount: 50000, currency: "NGN", reference: "TX-CONT-20152", createdAt: "2026-05-21T16:45:00Z", groupId: "group-1", groupName: "Lagos FinTech Builders" },
  { id: "t-4", userId: "user-1", username: "Iyanu L.", type: TransactionType.CONTRIBUTION, status: TransactionStatus.SUCCESS, amount: 50000, currency: "NGN", reference: "TX-CONT-30310", createdAt: "2026-06-18T10:30:00Z", groupId: "group-1", groupName: "Lagos FinTech Builders" },
  { id: "t-5", userId: "user-1", username: "Iyanu L.", type: TransactionType.TOP_UP, status: TransactionStatus.SUCCESS, amount: 25000, currency: "NGN", reference: "TX-TOP-99120", createdAt: "2026-06-03T09:12:00Z" }
];

export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: "dis-1",
    groupId: "group-1",
    groupName: "Lagos FinTech Builders",
    raisedById: "gm-1-3",
    raisedByName: "Fatima Bello (Round 3 Payout Recipient)",
    status: DisputeStatus.OPEN,
    category: "missed_payout",
    description: "Olumide Adebayo (Position 4) has missed his Round 3 contribution deadline (June 24). The expected round payout of ₦300,000 is still incomplete, affecting the rotation schedule. Need moderator action.",
    createdAt: "2026-06-25T08:00:00Z"
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-04-20T10:00:00Z",
    action: "CONTRIBUTION_PAID",
    details: "Contribution of ₦50,000 paid for Round 1. Verified by Paystack webhook confirm.",
    operator: "Iyanu Legan",
    groupId: "group-1",
    groupName: "Lagos FinTech Builders",
    roundNumber: 1,
    reference: "TX-CONT-10029"
  },
  {
    id: "log-2",
    timestamp: "2026-04-30T14:15:00Z",
    action: "PAYOUT_SENT",
    details: "Rotational payout of ₦295,500 disbursed to GTBank account 0123456789.",
    operator: "System Automated Run",
    groupId: "group-1",
    groupName: "Lagos FinTech Builders",
    roundNumber: 1,
    reference: "TX-PAY-10041"
  },
  {
    id: "log-3",
    timestamp: "2026-05-01T00:00:00Z",
    action: "ROUND_ADVANCED",
    details: "Cycle advanced from Round 1 to Round 2. All 6 members matched.",
    operator: "System Automated Run",
    groupId: "group-1",
    groupName: "Lagos FinTech Builders",
    roundNumber: 2
  },
  {
    id: "log-4",
    timestamp: "2026-05-21T16:45:00Z",
    action: "CONTRIBUTION_PAID",
    details: "Contribution of ₦50,000 paid for Round 2. Handled via Paystack Webhook event (charge.success).",
    operator: "Iyanu Legan",
    groupId: "group-1",
    groupName: "Lagos FinTech Builders",
    roundNumber: 2,
    reference: "TX-CONT-20152"
  },
  {
    id: "log-5",
    timestamp: "2026-06-18T10:30:00Z",
    action: "CONTRIBUTION_PAID",
    details: "Contribution of ₦50,000 paid for Round 3. Authorized from local wallet reserves.",
    operator: "Iyanu Legan",
    groupId: "group-1",
    groupName: "Lagos FinTech Builders",
    roundNumber: 3,
    reference: "TX-CONT-30310"
  }
];

export interface AjoAppState {
  user: User;
  groups: SavingsGroup[];
  members: GroupMember[];
  rounds: Round[];
  contributions: Contribution[];
  payouts: Payout[];
  transactions: Transaction[];
  disputes: Dispute[];
  auditLogs: AuditLog[];
}

export function loadAppState(): AjoAppState {
  if (typeof window === "undefined") {
    return {
      user: INITIAL_USER,
      groups: INITIAL_GROUPS,
      members: INITIAL_MEMBERS,
      rounds: INITIAL_ROUNDS,
      contributions: INITIAL_CONTRIBUTIONS,
      payouts: INITIAL_PAYOUTS,
      transactions: INITIAL_TRANSACTIONS,
      disputes: INITIAL_DISPUTES,
      auditLogs: INITIAL_AUDIT_LOGS
    };
  }

  const stored = localStorage.getItem("ajovault_state");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (!parsed.auditLogs) {
        parsed.auditLogs = INITIAL_AUDIT_LOGS;
      }
      return parsed;
    } catch (e) {
      console.error("Failed parsing AjoVault local state, rebuilding defaults.", e);
    }
  }

  const defaultState: AjoAppState = {
    user: INITIAL_USER,
    groups: INITIAL_GROUPS,
    members: INITIAL_MEMBERS,
    rounds: INITIAL_ROUNDS,
    contributions: INITIAL_CONTRIBUTIONS,
    payouts: INITIAL_PAYOUTS,
    transactions: INITIAL_TRANSACTIONS,
    disputes: INITIAL_DISPUTES,
    auditLogs: INITIAL_AUDIT_LOGS
  };

  localStorage.setItem("ajovault_state", JSON.stringify(defaultState));
  return defaultState;
}

export function saveAppState(state: AjoAppState) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ajovault_state", JSON.stringify(state));
  }
}
