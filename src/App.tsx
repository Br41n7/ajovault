/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import {
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Gift,
  HelpCircle,
  Menu,
  X,
  CreditCard,
  LayoutDashboard,
  Users,
  Wallet,
  ShieldCheck,
  Settings,
  HeartHandshake,
  LogOut
} from "lucide-react";

// Components
import Sidebar from "./components/Sidebar";
import DashboardHome from "./components/DashboardHome";
import GroupDetails from "./components/GroupDetails";
import CreateGroupWizard from "./components/CreateGroupWizard";
import KycFlow from "./components/KycFlow";
import WalletPanel from "./components/WalletPanel";
import GuruCoach from "./components/GuruCoach";
import AdminPanel from "./components/AdminPanel";
import LandingPage from "./components/LandingPage";

// Data and Types
import { loadAppState, saveAppState, AjoAppState, INITIAL_PEOPLE } from "./utils/mockData";
import {
  User,
  UserRole,
  SavingsGroup,
  GroupMember,
  Round,
  Contribution,
  Payout,
  Transaction,
  Dispute,
  GroupStatus,
  ContributionStatus,
  PayoutStatus,
  DisputeStatus,
  PlanTier,
  TransactionType,
  TransactionStatus,
  KYCStatus,
  AuditLog
} from "./types";

export default function App() {
  const [state, setState] = useState<AjoAppState>(loadAppState());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ajovault_logged_in") === "true";
    }
    return false;
  });

  const handleLogin = (user: User) => {
    setState((prev) => ({
      ...prev,
      user
    }));
    setIsLoggedIn(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("ajovault_logged_in", "true");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ajovault_logged_in");
    }
    showToast("Successfully signed out of secure AjoVault workspace.", "info");
  };

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeProcessing, setUpgradeProcessing] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PlanTier>(PlanTier.BASIC);

  // Global success/error notification toasts simulation
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Sync state changes with localStorage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Handle Pay Contribution
  const handlePayContribution = (contributionId: string, totalAmount: number, channel: string) => {
    // Locate target contribution to update circular stats
    const targetC = state.contributions.find((c) => c.id === contributionId);
    if (!targetC) return;

    const updatedContributions = state.contributions.map((c) => {
      if (c.id === contributionId) {
        return {
          ...c,
          status: ContributionStatus.PAID,
          paidAt: new Date().toISOString(),
          paymentChannel: channel,
        };
      }
      return c;
    });

    // Subtract from wallet balance if wallet payment
    let balanceUpdate = state.user.walletBalance;
    if (channel === "wallet") {
      balanceUpdate -= totalAmount;
    }

    // Create secure success ledger reference
    const ref = `TX-CONT-${Math.floor(10000 + Math.random() * 90000)}`;

    // Update member's stats & recalculate trust (missed > late > paid)
    const updatedMembers = state.members.map((m) => {
      if (m.groupId === targetC.groupId && m.userId === targetC.userId) {
        const primaryAmt = (m.totalContributed || 0) + targetC.amount;
        
        // Count statuses for this member inside this group
        const memberContributions = updatedContributions.filter(c => c.memberId === m.id);
        const missedCount = memberContributions.filter(c => c.status === ContributionStatus.MISSED).length;
        const lateCount = memberContributions.filter(c => c.status === ContributionStatus.LATE || c.penaltyAmount > 0).length;
        const paidCount = memberContributions.filter(c => c.status === ContributionStatus.PAID && c.penaltyAmount === 0).length;

        // Trust score reputation infrastructure formula: missed > late > paid
        // Base 100, missed subtracts 15, late subtracts 5, paid-on-time adds 2
        const computedScore = Math.max(10, Math.min(100, 100 - (missedCount * 15) - (lateCount * 5) + (paidCount * 2)));

        return {
          ...m,
          totalContributed: primaryAmt,
          totalMissed: missedCount,
          totalLate: lateCount,
          trustScore: computedScore,
        };
      }
      return m;
    });

    // Update logged in user state trust score to match (average or target)
    const primaryGroupMember = updatedMembers.find(m => m.groupId === targetC.groupId && m.userId === state.user.id);
    const updatedUserTrust = primaryGroupMember ? primaryGroupMember.trustScore : state.user.trustScore;

    const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      userId: state.user.id,
      username: `${state.user.firstName} ${state.user.lastName}`,
      groupId: targetC.groupId,
      groupName: state.groups.find((g) => g.id === targetC.groupId)?.name || "Ajo Circle",
      type: TransactionType.CONTRIBUTION,
      status: TransactionStatus.SUCCESS,
      amount: targetC.amount,
      currency: "NGN",
      reference: ref,
      createdAt: new Date().toISOString(),
    };

    // Auto-update target round collected funds
    const updatedRounds = state.rounds.map((r) => {
      if (r.id === targetC.roundId) {
        return {
          ...r,
          totalCollected: (r.totalCollected || 0) + targetC.amount,
        };
      }
      return r;
    });

    const targetGroup = state.groups.find((g) => g.id === targetC.groupId);

    // Sacred Audit Log write
    const verificationAudit: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "CONTRIBUTION_PAID",
      details: `Participant ${state.user.firstName} ${state.user.lastName} paid contribution of ₦${targetC.amount.toLocaleString()}${targetC.penaltyAmount > 0 ? ` (+₦${targetC.penaltyAmount.toLocaleString()} late penalty)` : ""}. Verified by Paystack Webhook event (charge.success) as source of truth. Trust Score updated to ${updatedUserTrust}%.`,
      operator: `${state.user.firstName} ${state.user.lastName}`,
      groupId: targetC.groupId,
      groupName: targetGroup?.name || "Ajo Circle",
      roundNumber: parseInt(targetC.roundId.split("-").pop() || "1"),
      reference: ref
    };

    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        walletBalance: balanceUpdate,
        trustScore: updatedUserTrust,
      },
      contributions: updatedContributions,
      members: updatedMembers,
      rounds: updatedRounds,
      transactions: [newTransaction, ...prev.transactions],
      auditLogs: [verificationAudit, ...prev.auditLogs]
    }));

    showToast(`₦${totalAmount.toLocaleString()} paid successfully via ${channel.replace("_", " ")}! Webhook status verified.`, "success");
  };

  // Handle Waiving Penalty (Admin Only)
  const handleWaivePenalty = (contributionId: string) => {
    const updated = state.contributions.map((c) => {
      if (c.id === contributionId) {
        return {
          ...c,
          penaltyAmount: 0,
        };
      }
      return c;
    });

    setState((prev) => ({
      ...prev,
      contributions: updated,
    }));

    showToast("Delay penalty fee waived successfully.", "info");
  };

  // Handle Trigger Payout release
  const handleTriggerPayout = (groupId: string, roundId: string) => {
    const targetRound = state.rounds.find((r) => r.id === roundId);
    if (!targetRound) return;

    // Select recipient details
    const recipientMember = state.members.find((m) => m.id === targetRound.payoutMemberId);
    if (!recipientMember) return;

    const groupObj = state.groups.find((g) => g.id === groupId);
    if (!groupObj) return;

    const totalPoolValue = groupObj.contributionAmount * state.members.filter((m) => m.groupId === groupId).length;
    const platformFee = totalPoolValue * 0.015;
    const netPayout = totalPoolValue - platformFee;

    // Mark Payout object as completed
    const updatedPayouts = state.payouts.map((p) => {
      if (p.roundId === roundId) {
        return {
          ...p,
          status: PayoutStatus.COMPLETED,
          processedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    // Mark Round completed
    const updatedRounds = state.rounds.map((r) => {
      if (r.id === roundId) {
        return {
          ...r,
          isComplete: true,
        };
      }
      return r;
    });

    // Mark Member received status
    const updatedMembers = state.members.map((m) => {
      if (m.id === recipientMember.id) {
        return {
          ...m,
          hasReceivedPayout: true,
        };
      }
      return m;
    });

    // Increment group current round or mark complete
    const isLastRound = groupObj.currentRound >= groupObj.totalRounds;
    const updatedGroups = state.groups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          currentRound: isLastRound ? g.currentRound : g.currentRound + 1,
          status: isLastRound ? GroupStatus.COMPLETED : GroupStatus.ACTIVE,
        };
      }
      return g;
    });

    // Create a new payout transaction ledger record
    const ref = `TX-PAY-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      userId: recipientMember.userId,
      username: recipientMember.displayName,
      groupId,
      groupName: groupObj.name,
      type: TransactionType.PAYOUT,
      status: TransactionStatus.SUCCESS,
      amount: netPayout,
      currency: "NGN",
      reference: ref,
      createdAt: new Date().toISOString(),
    };

    // If recipient is current logged in user: award them balances
    let userBalance = state.user.walletBalance;
    if (recipientMember.userId === state.user.id) {
      userBalance += netPayout;
    }

    // If not last round, pre-generate missing contributions for the next active round
    let nextRoundContributions: Contribution[] = [];
    if (!isLastRound) {
      const nextRoundNumber = groupObj.currentRound + 1;
      const nextRoundObj = state.rounds.find((r) => r.groupId === groupId && r.roundNumber === nextRoundNumber);
      if (nextRoundObj) {
        const activeMembers = state.members.filter((m) => m.groupId === groupId);
        nextRoundContributions = activeMembers.map((m, idx) => ({
          id: `c-${groupObj.id}-${nextRoundNumber}-${idx}`,
          groupId: groupObj.id,
          memberId: m.id,
          userId: m.userId,
          roundId: nextRoundObj.id,
          amount: groupObj.contributionAmount,
          penaltyAmount: 0,
          status: ContributionStatus.PENDING,
          dueDate: new Date(Date.now() + 24 * 3600 * 1000 * 30).toISOString(), // 30 days default future dueDate
        }));
      }
    }

    // Create sacred Payout AuditLog
    const payoutAudit: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "PAYOUT_SENT",
      details: `Rotational payout of ₦${netPayout.toLocaleString()} successfully processed and sent to account of ${recipientMember.displayName} (Slot Position #${recipientMember.payoutPosition}). Escrow services fee: ₦${platformFee.toLocaleString()} (1.5% levy rate applied).`,
      operator: "System Automated Run",
      groupId,
      groupName: groupObj.name,
      roundNumber: targetRound.roundNumber,
      reference: ref
    };

    let advanceAudit: AuditLog | null = null;
    if (!isLastRound) {
      advanceAudit = {
        id: `log-${Date.now() + 1}`,
        timestamp: new Date().toISOString(),
        action: "ROUND_ADVANCED",
        details: `Mutual savings circle automatically advanced from Round ${groupObj.currentRound} to Round ${groupObj.currentRound + 1}. Preloaded ${state.members.filter((m) => m.groupId === groupId).length} new round contribution sheets.`,
        operator: "System Automated Run",
        groupId,
        groupName: groupObj.name,
        roundNumber: groupObj.currentRound + 1
      };
    }

    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        walletBalance: userBalance,
      },
      payouts: updatedPayouts,
      rounds: updatedRounds,
      members: updatedMembers,
      groups: updatedGroups,
      transactions: [newTransaction, ...prev.transactions],
      contributions: [...prev.contributions, ...nextRoundContributions],
      auditLogs: advanceAudit ? [payoutAudit, advanceAudit, ...prev.auditLogs] : [payoutAudit, ...prev.auditLogs]
    }));

    showToast(`₦${netPayout.toLocaleString()} dispersed transfer to ${recipientMember.displayName} bank account successfully!`, "success");
  };

  // Add Member (Recruitment)
  const handleAddMember = (groupId: string, userId: string) => {
    const matchedUser = INITIAL_PEOPLE.find((p) => p.id === userId);
    if (!matchedUser) return;

    const newMemberId = `gm-${groupId}-${userId}`;
    const newMember: GroupMember = {
      id: newMemberId,
      groupId,
      userId,
      displayName: matchedUser.name.split(" ")[0] + " " + matchedUser.name.split(" ")[1]?.[0] + ".",
      avatarUrl: matchedUser.avatar,
      isActive: true,
      hasReceivedPayout: false,
      trustScore: 94,
      totalContributed: 0,
      totalMissed: 0,
      totalLate: 0,
      joinedAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));

    showToast(`${matchedUser.name} added to circle slots successfully.`, "info");
  };

  // Launch New Circle Draft Wizard
  const handleLaunchGroup = (newGroupData: Omit<SavingsGroup, "id" | "createdAt" | "currentRound">) => {
    const newGroupId = `group-${Date.now()}`;
    const newGroup: SavingsGroup = {
      ...newGroupData,
      id: newGroupId,
      currentRound: 0,
      createdAt: new Date().toISOString(),
    };

    // Insert admin user as Member 1
    const newMember: GroupMember = {
      id: `gm-${newGroupId}-${state.user.id}`,
      groupId: newGroupId,
      userId: state.user.id,
      displayName: state.user.firstName + " " + state.user.lastName[0] + ".",
      avatarUrl: state.user.avatarUrl,
      isActive: true,
      hasReceivedPayout: false,
      trustScore: state.user.trustScore,
      totalContributed: 0,
      totalMissed: 0,
      totalLate: 0,
      joinedAt: new Date().toISOString(),
    };

    // Generate sacred Group Created entry
    const creationAudit: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "GROUP_CREATED",
      details: `New rotational savings group "${newGroup.name}" launched in FORMING recruitment state. Core limit: ${newGroup.maxMembers} spots. Cycle premium size: ₦${newGroup.contributionAmount.toLocaleString()} rotational rate.`,
      operator: `${state.user.firstName} ${state.user.lastName}`,
      groupId: newGroupId,
      groupName: newGroup.name,
      roundNumber: 0
    };

    setState((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup],
      members: [...prev.members, newMember],
      auditLogs: [creationAudit, ...prev.auditLogs]
    }));

    setActiveTab("groups");
    setSelectedGroupId(newGroupId);
    showToast(`Circle "${newGroup.name}" launched forming phase!`, "success");
  };

  // Reassign participant payout turn index (pre-start)
  const handleUpdateMemberPosition = (memberId: string, position: number) => {
    setState((prev) => {
      const updatedMembers = prev.members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            payoutPosition: position,
          };
        }
        return m;
      });
      return {
        ...prev,
        members: updatedMembers,
      };
    });
    showToast("Rotation slot rank rearranged for client! Setting slot list pre-start.", "info");
  };

  // Lock Slots & Activate Group Starts
  const handleStartGroup = (groupId: string) => {
    const groupMembers = state.members.filter((m) => m.groupId === groupId);
    if (groupMembers.length < 3) return;

    const groupObj = state.groups.find((g) => g.id === groupId);
    if (!groupObj) return;

    // Check if they already have valid unique payout positions assigned (1..N)
    const assignedPositions = groupMembers.map((m) => m.payoutPosition).filter((p) => typeof p === "number" && p > 0);
    const hasUniquePreassigned = assignedPositions.length === groupMembers.length && (new Set(assignedPositions)).size === groupMembers.length;

    let updatedMembers = [...state.members];

    if (hasUniquePreassigned) {
      // Use existing payoutPosition values as drives payout order
      updatedMembers = state.members.map((m) => {
        if (m.groupId === groupId) {
          const matchingOrig = groupMembers.find((gm) => gm.id === m.id);
          return {
            ...m,
            payoutPosition: matchingOrig?.payoutPosition || 1,
          };
        }
        return m;
      });
    } else {
      // Shuffling index slots positions 1..N
      const positions = Array.from({ length: groupMembers.length }, (_, i) => i + 1);
      const shuffledPositions = positions.sort(() => Math.random() - 0.5);

      updatedMembers = state.members.map((m) => {
        if (m.groupId === groupId) {
          const memberIdx = groupMembers.indexOf(m);
          return {
            ...m,
            payoutPosition: shuffledPositions[memberIdx],
          };
        }
        return m;
      });
    }

    const currentGroupMembers = updatedMembers.filter((m) => m.groupId === groupId);

    // Generate All Round items sequentially
    const generatedRounds: Round[] = Array.from({ length: groupMembers.length }, (_, i) => {
      const roundNumber = i + 1;
      const roundId = `round-${groupId}-${roundNumber}`;
      
      // Locate slot matching payoutMember
      const payoutMember = currentGroupMembers.find(
        (m) => m.payoutPosition === roundNumber
      );

      return {
        id: roundId,
        groupId,
        roundNumber,
        payoutMemberId: payoutMember?.id || currentGroupMembers[0].id,
        startDate: new Date(Date.now() + i * 30 * 24 * 3600 * 1000).toISOString(),
        endDate: new Date(Date.now() + (i + 1) * 30 * 24 * 3600 * 1000).toISOString(),
        isComplete: false,
        totalCollected: 0,
        expectedAmount: groupObj.contributionAmount * groupMembers.length,
      };
    });

    // Generate All corresponding default Payout schedules
    const generatedPayouts: Payout[] = generatedRounds.map((r, idx) => {
      const payoutMember = currentGroupMembers.find((m) => m.id === r.payoutMemberId)!;
      const totalPool = groupObj.contributionAmount * groupMembers.length;
      const fee = totalPool * 0.015;

      return {
        id: `payout-${groupId}-${idx + 1}`,
        groupId,
        memberId: payoutMember.id,
        userId: payoutMember.userId,
        roundId: r.id,
        amount: totalPool,
        platformFee: fee,
        netAmount: totalPool - fee,
        status: PayoutStatus.SCHEDULED,
        scheduledFor: r.endDate,
      };
    });

    // Generate Round 1 initial Contributions
    const round1Obj = generatedRounds[0];
    const initialContributions: Contribution[] = currentGroupMembers
      .map((m, idx) => ({
        id: `c-${groupId}-1-${idx}`,
        groupId,
        memberId: m.id,
        userId: m.userId,
        roundId: round1Obj.id,
        amount: groupObj.contributionAmount,
        penaltyAmount: 0,
        status: ContributionStatus.PENDING,
        dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(), // 15 days standard
      }));

    // Update group status to ACTIVE
    const updatedGroups = state.groups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          status: GroupStatus.ACTIVE,
          currentRound: 1,
          startDate: new Date().toISOString(),
          nextContributionDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
          nextPayoutDate: round1Obj.endDate,
        };
      }
      return g;
    });

    // Generate sacred Start AuditLog
    const systemAudit: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "GROUP_STARTED",
      details: `Savings group locked slots and advanced to ACTIVE phase. Activated ${generatedRounds.length} rounds timeline sequentially. Assigned turns: ${currentGroupMembers.map(m => `${m.displayName} (Spot #${m.payoutPosition})`).join(", ")}.`,
      operator: "Group Creator Admin",
      groupId,
      groupName: groupObj.name,
      roundNumber: 1
    };

    setState((prev) => ({
      ...prev,
      groups: updatedGroups,
      members: updatedMembers,
      rounds: [...prev.rounds, ...generatedRounds],
      payouts: [...prev.payouts, ...generatedPayouts],
      contributions: [...prev.contributions, ...initialContributions],
      auditLogs: [systemAudit, ...prev.auditLogs]
    }));

    showToast(`Circle "${groupObj.name}" starts! ${hasUniquePreassigned ? "Assigned" : "Shuffled"} positions locked with ${generatedRounds.length} pre-generated rounds.`, "success");
  };

  // Raise Dispute
  const handleRaiseDispute = (data: {
    groupId: string;
    category: "missed_payout" | "wrong_amount" | "member_misconduct" | "other";
    description: string;
    evidenceUrl?: string;
  }) => {
    const parentGroup = state.groups.find((g) => g.id === data.groupId);
    const newDispute: Dispute = {
      id: `dis-${Math.floor(100 + Math.random() * 900)}`,
      groupId: data.groupId,
      groupName: parentGroup?.name || "Ajo Circle",
      raisedById: state.user.id,
      raisedByName: `${state.user.firstName} ${state.user.lastName}`,
      status: DisputeStatus.OPEN,
      category: data.category,
      description: data.description,
      evidenceUrl: data.evidenceUrl,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      disputes: [newDispute, ...prev.disputes],
    }));

    showToast("Dispute reported securely. Platforms operations teams notified.", "warning");
  };

  // Resolve Dispute (Admin Action)
  const handleResolveDispute = (disputeId: string, resolution: string) => {
    const updated = state.disputes.map((d) => {
      if (d.id === disputeId) {
        return {
          ...d,
          status: DisputeStatus.RESOLVED,
          resolution,
        };
      }
      return d;
    });

    setState((prev) => ({
      ...prev,
      disputes: updated,
    }));

    showToast(`Dispute #${disputeId} resolved successfully.`, "success");
  };

  // Fund Wallet from Outer Gateway
  const handleFundWallet = (amount: number) => {
    const ref = `TX-TOP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      userId: state.user.id,
      username: `${state.user.firstName} ${state.user.lastName}`,
      type: TransactionType.TOP_UP,
      status: TransactionStatus.SUCCESS,
      amount,
      currency: "NGN",
      reference: ref,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        walletBalance: prev.user.walletBalance + amount,
      },
      transactions: [newTransaction, ...prev.transactions],
    }));

    showToast(`₦${amount.toLocaleString()} top-up funded successfully.`, "success");
  };

  // Withdraw Wallet to Bank Account
  const handleWithdrawWallet = (amount: number, bankDetail: { bankName: string; accNumber: string }) => {
    const ref = `TX-WD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      userId: state.user.id,
      username: `${state.user.firstName} ${state.user.lastName}`,
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.SUCCESS,
      amount,
      currency: "NGN",
      reference: ref,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        walletBalance: prev.user.walletBalance - amount,
      },
      transactions: [newTransaction, ...prev.transactions],
    }));

    showToast(`Disbursed ₦${amount.toLocaleString()} cashout safely to ${bankDetail.bankName} account!`, "success");
  };

  // KYC Verification completions hook
  const handleUpdateKycStatus = (status: KYCStatus) => {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        kycStatus: status,
        trustScore: 100, // Boost score on verification
      },
    }));
    showToast("Statutory identity verified successfully! Trust Score boosted.", "success");
  };

  // Adjust User Trust manually (Admin Action)
  const handleUpdateUserTrust = (userId: string, newScore: number) => {
    // If updating current user: update main record
    if (userId === state.user.id) {
      setState((prev) => ({
        ...prev,
        user: { ...prev.user, trustScore: newScore },
      }));
    } else {
      // update matching members inside groups
      const updated = state.members.map((m) => {
        if (m.userId === userId) {
          return { ...m, trustScore: newScore };
        }
        return m;
      });
      setState((prev) => ({
        ...prev,
        members: updated,
      }));
    }
    showToast("Trust score updated inside centralized audit log.", "info");
  };

  // Pause / Resume Group (Admin Action)
  const handleUpdateGroupStatus = (groupId: string, newStatus: GroupStatus) => {
    const updated = state.groups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          status: newStatus,
        };
      }
      return g;
    });

    setState((prev) => ({
      ...prev,
      groups: updated,
    }));

    showToast(`Circle status adjusted to ${newStatus}.`, "info");
  };

  // Simulated upgrade payments
  const handlePurchaseUpgrade = () => {
    setUpgradeProcessing(true);
    setTimeout(() => {
      setUpgradeProcessing(false);
      setUpgradeSuccess(true);
      
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            planTier: selectedTier,
          },
        }));
        setShowUpgradeModal(false);
        setUpgradeSuccess(false);
        showToast(`Congratulations! Upgraded to ${selectedTier} plan level successfully.`, "success");
      }, 1500);
    }, 1800);
  };

  // Simple selector tabs navigate
  const handleTabSelection = (tab: string) => {
    setActiveTab(tab);
    setSelectedGroupId(null);
    setShowMobileMenu(false);
  };

  if (!isLoggedIn) {
    return (
      <>
        {/* Toast simulated */}
        {toast && (
          <div className="fixed top-5 right-5 z-50 bg-[#FAF7F2] p-4 text-xs font-semibold rounded-xl shadow-2xl border border-brand-border flex items-center gap-3 animate-fade-in max-w-sm">
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toast.type === "warning" && <AlertOctagon className="w-5 h-5 text-brand-clay shrink-0" />}
            {toast.type === "info" && <Sparkles className="w-5 h-5 text-brand-gold shrink-0" />}
            <span className="text-brand-forest">{toast.message}</span>
          </div>
        )}
        <LandingPage
          onLogin={handleLogin}
          onShowToast={showToast}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-brand-cream overflow-hidden text-brand-ink relative flex-col lg:flex-row">
      
      {/* Toast simulated */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#FAF7F2] p-4 text-xs font-semibold rounded-xl shadow-2xl border border-brand-border flex items-center gap-3 animate-fade-in max-w-sm">
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {toast.type === "warning" && <AlertOctagon className="w-5 h-5 text-brand-clay shrink-0" />}
          {toast.type === "info" && <Sparkles className="w-5 h-5 text-brand-gold shrink-0" />}
          <span className="text-brand-forest">{toast.message}</span>
        </div>
      )}

      {/* Mobile Top Bar */}
      <header className="lg:hidden h-14 bg-brand-forest text-brand-cream flex items-center justify-between px-4 border-b border-brand-cream/10 z-30 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-brand-clay flex items-center justify-center shadow-md transform rotate-3">
            <HeartHandshake className="w-4 h-4 text-brand-cream" />
          </div>
          <div>
            <h1 className="text-sm font-display font-bold tracking-tight text-brand-cream flex items-center gap-1">
              AjoVault
            </h1>
            <p className="text-[7px] text-brand-gold font-sans uppercase tracking-[0.1em] font-medium leading-none">
              Rotational Trust
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 bg-brand-clay/30 rounded border border-brand-clay/50 text-brand-gold">
            {state.user.planTier} Plan
          </span>
          <button
            onClick={() => setShowMobileMenu(true)}
            className="p-2 text-brand-cream hover:bg-brand-cream/10 rounded-xl transition-colors duration-200 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <Menu className="w-5 h-5 text-brand-gold" />
          </button>
        </div>
      </header>

      {/* Sliding Mobile Menu Drawer Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 lg:hidden flex justify-end">
          {/* Backdrop toggle closer */}
          <div
            onClick={() => setShowMobileMenu(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer sheet container */}
          <div className="w-72 max-w-[85vw] bg-brand-forest text-brand-cream h-full relative z-10 flex flex-col justify-between border-l border-brand-cream/10 p-6 shadow-2xl animate-fade-in relative">
            <div className="space-y-6">
              {/* Drawer Header brand */}
              <div className="flex justify-between items-center border-b border-brand-cream/15 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-brand-clay flex items-center justify-center transform rotate-3">
                    <HeartHandshake className="w-4 h-4 text-brand-cream" />
                  </div>
                  <span className="font-display font-bold text-sm tracking-tight text-brand-cream">
                    AjoVault Drawer
                  </span>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1 text-brand-cream hover:bg-brand-cream/10 rounded-lg cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-brand-gold" />
                </button>
              </div>

              {/* Drawer Extra Links list */}
              <div className="space-y-4">
                <p className="text-[9px] text-brand-cream/50 font-mono tracking-widest uppercase font-bold pl-2">
                  Compliance & Gating
                </p>
                <div className="space-y-1">
                  {([
                    { id: "dashboard", label: "Dashboard Hub", icon: LayoutDashboard },
                    { id: "groups", label: "Active Circles", icon: Users },
                    { id: "wallet", label: "Wallet & Cashout", icon: Wallet },
                    { id: "kyc", label: "Statutory KYC", icon: ShieldCheck },
                    { id: "advisor", label: "Guru AI Coach", icon: HelpCircle },
                    { id: "admin", label: "Platform Admin Panel", icon: Settings },
                  ] as const).map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabSelection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer text-left ${
                          isActive
                            ? "bg-brand-clay text-brand-cream font-bold"
                            : "text-brand-cream/80 hover:bg-brand-cream/10"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-brand-gold shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Premium Action inside Drawer */}
            <div className="border-t border-brand-cream/15 pt-4 bg-black/10 -mx-6 px-6 pb-2">
              <div className="bg-brand-cream/5 rounded-xl p-3 border border-brand-cream/5 space-y-2">
                <span className="text-[10px] text-brand-cream/50 block font-mono">PARTICIPANT PROFILE</span>
                <p className="text-xs font-bold text-brand-gold truncate">{state.user.email}</p>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowUpgradeModal(true);
                  }}
                  className="w-full text-center py-2 bg-brand-clay text-brand-cream text-[11px] font-bold rounded-lg border border-brand-clay cursor-pointer block"
                >
                  UPGRADE MEMBER TIER
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2 bg-black/20 text-brand-cream text-[11px] font-bold rounded-lg border border-brand-cream/10 cursor-pointer block mt-2 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4 text-brand-gold" />
                  SIGN OUT OF VAULT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar sidebar */}
      <Sidebar
        activeTab={selectedGroupId ? "groups" : activeTab}
        setActiveTab={handleTabSelection}
        user={state.user}
        onUpgradeClick={() => setShowUpgradeModal(true)}
        onLogout={handleLogout}
      />

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-brand-forest text-brand-cream border-t border-brand-cream/10 flex items-center justify-around pb-1 z-30 shadow-2xl select-none shrink-0">
        {([
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "groups", label: "Circles", icon: Users },
          { id: "wallet", label: "Wallet", icon: Wallet },
          { id: "kyc", label: "KYC", icon: ShieldCheck },
          { id: "advisor", label: "Guru AI", icon: HelpCircle },
        ] as const).map((item) => {
          const Icon = item.icon;
          const isActive = selectedGroupId ? (item.id === "groups") : (activeTab === item.id);
          return (
            <button
              key={item.id}
              onClick={() => handleTabSelection(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] cursor-pointer transition-all duration-200 ${
                isActive ? "text-brand-gold font-semibold scale-105" : "text-brand-cream/75 hover:text-brand-cream"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Primary viewport panel box */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-10 pb-24 lg:pb-8 space-y-6 bg-brand-cream relative">
        {/* Visual Yoruba Dot Background */}
        <div className="absolute inset-0 adire-grid pointer-events-none opacity-5" />

        {/* Selected group detail overlay takes routing precendences */}
        {selectedGroupId ? (
          <GroupDetails
            group={state.groups.find((g) => g.id === selectedGroupId)!}
            user={state.user}
            members={state.members}
            rounds={state.rounds}
            contributions={state.contributions}
            payouts={state.payouts}
            disputes={state.disputes}
            onBack={() => setSelectedGroupId(null)}
            onStartGroup={handleStartGroup}
            onUpdateMemberPosition={handleUpdateMemberPosition}
            onWaivePenalty={handleWaivePenalty}
            onTriggerPayout={handleTriggerPayout}
            onRaiseDispute={handleRaiseDispute}
            allUsers={INITIAL_PEOPLE}
            onAddMember={handleAddMember}
          />
        ) : (
          <>
            {/* Standard navigation tabs routing */}
            {activeTab === "dashboard" && (
              <DashboardHome
                user={state.user}
                groups={state.groups}
                members={state.members}
                contributions={state.contributions}
                transactions={state.transactions}
                onSelectGroup={(id) => setSelectedGroupId(id)}
                onPayContribution={handlePayContribution}
                onNavigateToWallet={() => setActiveTab("wallet")}
                onNavigateToCreateGroup={() => setActiveTab("create_group_wizard")}
              />
            )}

            {activeTab === "groups" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-brand-border pb-3">
                  <div>
                    <span className="text-xs uppercase font-mono tracking-wider text-brand-muted">Mutuality networks</span>
                    <h2 className="text-xl md:text-2xl font-display font-medium text-brand-forest">Rotational Savings Groups (Ajo/Esusu)</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("create_group_wizard")}
                    className="bg-brand-clay text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    + Launch New Group
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {state.groups.map((group) => {
                    const myMembership = state.members.find(
                      (m) => m.groupId === group.id && m.userId === state.user.id
                    );
                    const countMembers = state.members.filter((m) => m.groupId === group.id).length;
                    
                    return (
                      <div
                        key={group.id}
                        onClick={() => setSelectedGroupId(group.id)}
                        className="bg-white rounded-2xl border border-brand-border hover:border-brand-clay shadow-sm overflow-hidden cursor-pointer hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                      >
                        <div className="h-28 relative bg-brand-forest">
                          {group.coverImageUrl && (
                            <img src={group.coverImageUrl} alt={group.name} className="w-full h-full object-cover mix-blend-overlay opacity-30" />
                          )}
                          <span className="absolute top-3 right-3 text-[9px] font-mono tracking-wider font-semibold bg-brand-forest/70 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/10 uppercase">
                            {group.frequency}
                          </span>
                          <div className="absolute bottom-3 left-4">
                            <h3 className="font-display font-bold text-white text-base truncate max-w-[200px]">{group.name}</h3>
                            <span className="text-[10px] text-brand-gold block font-mono">Invite: {group.inviteCode}</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-4">
                          <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                            {group.description}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-xs border-y border-brand-cream py-3">
                            <div>
                              <span className="text-brand-muted text-[10px] block">Contribution Required</span>
                              <span className="font-bold text-brand-forest">₦{group.contributionAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-brand-muted text-[10px] block">Slots Reserved</span>
                              <span className="font-bold text-brand-clay">{countMembers} of {group.maxMembers} spaces</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[9px] uppercase font-mono tracking-wider text-brand-muted font-bold">Status:</span>
                            <span className={`px-2 py-0.5 text-[9px] font-mono rounded uppercase border ${group.status === GroupStatus.ACTIVE ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-brand-gold/15 text-brand-gold border-brand-gold/25'}`}>
                              {group.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "create_group_wizard" && (
              <CreateGroupWizard
                user={state.user}
                onLaunchGroup={handleLaunchGroup}
                onCancel={() => setActiveTab("dashboard")}
                onUpgradePrompt={() => setShowUpgradeModal(true)}
              />
            )}

            {activeTab === "wallet" && (
              <WalletPanel
                user={state.user}
                transactions={state.transactions}
                onFundWallet={handleFundWallet}
                onWithdrawWallet={handleWithdrawWallet}
              />
            )}

            {activeTab === "kyc" && (
              <KycFlow user={state.user} onUpdateKycStatus={handleUpdateKycStatus} />
            )}

            {activeTab === "advisor" && <GuruCoach />}

            {activeTab === "admin" && (
              <AdminPanel
                disputes={state.disputes}
                groups={state.groups}
                allPeople={INITIAL_PEOPLE}
                onResolveDispute={handleResolveDispute}
                onUpdateUserTrust={handleUpdateUserTrust}
                onUpdateGroupStatus={handleUpdateGroupStatus}
                auditLogs={state.auditLogs}
              />
            )}
          </>
        )}
      </main>

      {/* Upgrade Subscription Plans Modal overlay */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#FAF7F2] w-full max-w-lg rounded-2xl shadow-2xl border border-brand-border overflow-hidden select-none animate-scale-up text-xs">
            
            <div className="bg-brand-forest p-4 text-brand-cream flex items-center justify-between border-b border-brand-border/10">
              <h3 className="font-display text-brand-gold text-base font-semibold">
                Upgrade Rotational Savings Plan Tier
              </h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer font-sans"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {upgradeSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8 animate-scale-up" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-forest font-display">Upgrade Finalized</h4>
                    <p className="text-xs text-brand-muted mt-1">
                      Features unlocked. Thank you for building AjoVault mutual networks!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Grid comparison list */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Basic option */}
                    <button
                      type="button"
                      onClick={() => setSelectedTier(PlanTier.BASIC)}
                      className={`p-4 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                        selectedTier === PlanTier.BASIC
                          ? "border-brand-clay bg-brand-clay/5 text-brand-clay scale-[1.02] shadow-sm"
                          : "border-brand-border bg-white text-brand-muted hover:border-brand-muted"
                      }`}
                    >
                      <div>
                        <span className="font-bold block text-brand-forest">Basic Pro</span>
                        <span className="text-[10px] text-brand-muted block mt-1">Up to 3 Active groups</span>
                      </div>
                      <span className="font-bold text-sm text-brand-clay">₦2,500 / month</span>
                    </button>

                    {/* Premium Pro */}
                    <button
                      type="button"
                      onClick={() => setSelectedTier(PlanTier.PRO)}
                      className={`p-4 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                        selectedTier === PlanTier.PRO
                          ? "border-brand-clay bg-brand-clay/5 text-brand-clay scale-[1.02] shadow-sm"
                          : "border-brand-border bg-white text-brand-muted hover:border-brand-muted"
                      }`}
                    >
                      <div>
                        <span className="font-bold block text-brand-forest">Premium Pro (Bidding)</span>
                        <span className="text-[10px] text-brand-muted block mt-1">Unlimited groups & unlocks Bidding!</span>
                      </div>
                      <span className="font-bold text-sm text-brand-clay">₦7,500 / month</span>
                    </button>
                  </div>

                  <div className="bg-brand-cream border border-brand-border p-3.5 rounded-lg text-[10px] text-brand-muted space-y-1.5 leading-relaxed">
                    <span className="font-bold text-brand-forest block uppercase">PLAN TIER COMPLIANCE TERMS</span>
                    <p>
                      * Free vault users process standard **1.5% platform transaction levies** on rotating disbursements and are confined to 1 active group. Upgrading minimizes co-op rates down to **1.0%** and offers prioritised mediator dispute interventions.
                    </p>
                  </div>

                  <button
                    onClick={handlePurchaseUpgrade}
                    disabled={upgradeProcessing}
                    className="w-full bg-brand-clay hover:bg-brand-clay/90 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-xs shadow flex items-center justify-center gap-2"
                  >
                    {upgradeProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Initiating Paystack Subscription Checkout ...
                      </>
                    ) : (
                      "Subscribe Plan Now"
                    )}
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
