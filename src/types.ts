/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  MEMBER = "MEMBER",
  GROUP_ADMIN = "GROUP_ADMIN",
  PLATFORM_ADMIN = "PLATFORM_ADMIN"
}

export enum KYCStatus {
  UNVERIFIED = "UNVERIFIED",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED"
}

export enum GroupStatus {
  FORMING = "FORMING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  DISSOLVED = "DISSOLVED"
}

export enum ContributionFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  BIWEEKLY = "BIWEEKLY",
  MONTHLY = "MONTHLY"
}

export enum PayoutOrder {
  FIXED = "FIXED",
  RANDOM = "RANDOM",
  BIDDING = "BIDDING",
  VOTING = "VOTING"
}

export enum ContributionStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  LATE = "LATE",
  MISSED = "MISSED",
  WAIVED = "WAIVED"
}

export enum PayoutStatus {
  SCHEDULED = "SCHEDULED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  DISPUTED = "DISPUTED"
}

export enum TransactionType {
  CONTRIBUTION = "CONTRIBUTION",
  PAYOUT = "PAYOUT",
  PENALTY = "PENALTY",
  PLATFORM_FEE = "PLATFORM_FEE",
  REFUND = "REFUND",
  TOP_UP = "TOP_UP",
  WITHDRAWAL = "WITHDRAWAL"
}

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED"
}

export enum DisputeStatus {
  OPEN = "OPEN",
  UNDER_REVIEW = "UNDER_REVIEW",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED"
}

export enum PlanTier {
  FREE = "FREE",
  BASIC = "BASIC",
  PRO = "PRO",
  COOPERATIVE = "COOPERATIVE"
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRole;
  kycStatus: KYCStatus;
  isActive: boolean;
  timezone: string;
  planTier: PlanTier;
  walletBalance: number;
  currency: string;
  trustScore: number;
  joinedAt: string;
}

export interface SavingsGroup {
  id: string;
  name: string;
  description: string;
  adminId: string;
  status: GroupStatus;
  contributionAmount: number;
  currency: string;
  frequency: ContributionFrequency;
  payoutOrder: PayoutOrder;
  maxMembers: number;
  currentRound: number;
  totalRounds: number;
  startDate?: string;
  nextContributionDate?: string;
  nextPayoutDate?: string;
  inviteCode: string;
  isPrivate: boolean;
  penaltyRate: number; // e.g., 0.05 index for 5%
  gracePeriodHours: number;
  rules?: string;
  coverImageUrl?: string;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  payoutPosition?: number;
  isActive: boolean;
  hasReceivedPayout: boolean;
  trustScore: number;
  totalContributed: number;
  totalMissed: number;
  totalLate: number;
  joinedAt: string;
}

export interface Round {
  id: string;
  groupId: string;
  roundNumber: number;
  payoutMemberId: string; // member id who gets paid this round
  startDate: string;
  endDate: string;
  isComplete: boolean;
  totalCollected: number;
  expectedAmount: number;
}

export interface Contribution {
  id: string;
  groupId: string;
  memberId: string;
  userId: string;
  roundId: string;
  amount: number;
  penaltyAmount: number;
  status: ContributionStatus;
  dueDate: string;
  paidAt?: string;
  paymentChannel?: string;
}

export interface Payout {
  id: string;
  groupId: string;
  memberId: string;
  userId: string;
  roundId: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: PayoutStatus;
  scheduledFor: string;
  processedAt?: string;
  bankName?: string;
  accountNumber?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  groupId?: string;
  groupName?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  reference: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  groupId: string;
  groupName: string;
  raisedById: string;
  raisedByName: string;
  status: DisputeStatus;
  category: "missed_payout" | "wrong_amount" | "member_misconduct" | "other";
  description: string;
  evidenceUrl?: string;
  resolution?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  sender: "user" | "advisor";
  text: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: "CONTRIBUTION_PAID" | "PAYOUT_SENT" | "ROUND_ADVANCED" | "GROUP_CREATED" | "GROUP_STARTED" | "TRUST_RECALCULATED" | "KYC_ENCRYPTED";
  details: string;
  operator: string;
  groupId?: string;
  groupName?: string;
  roundNumber?: number;
  reference?: string;
}

