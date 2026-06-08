/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  ShieldAlert,
  Trash2,
  Play,
  CheckCircle2,
  Users,
  Calendar,
  AlertTriangle,
  FileMinus,
  MessageSquare,
  BadgeAlert,
  ShieldCheck,
  Send,
  Sparkles
} from "lucide-react";
import {
  SavingsGroup,
  GroupMember,
  Round,
  Contribution,
  Payout,
  Dispute,
  User,
  GroupStatus,
  ContributionStatus,
  PayoutStatus,
  DisputeStatus
} from "../types";

interface GroupDetailsProps {
  group: SavingsGroup;
  user: User;
  members: GroupMember[];
  rounds: Round[];
  contributions: Contribution[];
  payouts: Payout[];
  disputes: Dispute[];
  onBack: () => void;
  onStartGroup: (groupId: string) => void;
  onUpdateMemberPosition: (memberId: string, position: number) => void;
  onWaivePenalty: (contributionId: string) => void;
  onTriggerPayout: (groupId: string, roundId: string) => void;
  onRaiseDispute: (disputeData: {
    groupId: string;
    category: "missed_payout" | "wrong_amount" | "member_misconduct" | "other";
    description: string;
    evidenceUrl?: string;
  }) => void;
  allUsers: { id: string; name: string; avatar: string }[];
  onAddMember: (groupId: string, userId: string) => void;
}

export default function GroupDetails({
  group,
  user,
  members,
  rounds,
  contributions,
  payouts,
  disputes,
  onBack,
  onStartGroup,
  onUpdateMemberPosition,
  onWaivePenalty,
  onTriggerPayout,
  onRaiseDispute,
  allUsers,
  onAddMember,
}: GroupDetailsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "contributions" | "payouts" | "disputes">("overview");

  // Dispute Raise State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState<"missed_payout" | "wrong_amount" | "member_misconduct" | "other">("missed_payout");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeEvidence, setDisputeEvidence] = useState("");

  // Member Adding State (Forming only)
  const [selectedUserToAdd, setSelectedUserToAdd] = useState("");

  // Computations
  const groupMembers = members.filter((m) => m.groupId === group.id);
  const groupRounds = rounds.filter((r) => r.groupId === group.id);
  const groupContributions = contributions.filter((c) => c.groupId === group.id);
  const groupPayouts = payouts.filter((p) => p.groupId === group.id);
  const groupDisputes = disputes.filter((d) => d.groupId === group.id);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amt);
  };

  const isUserAdmin = group.adminId === user.id;

  // Active round analysis
  const currentActiveRound = groupRounds.find((r) => r.roundNumber === group.currentRound) || groupRounds[0];
  const roundContributions = currentActiveRound
    ? groupContributions.filter((c) => c.roundId === currentActiveRound.id)
    : [];
  const paidContributionsInRound = roundContributions.filter((c) => c.status === ContributionStatus.PAID);
  
  // Calculate gathered funds
  const totalCollectedInRound = currentActiveRound
    ? currentActiveRound.totalCollected
    : 0;
  const expectedRoundTotal = group.contributionAmount * groupMembers.length;
  const roundIsFullyCollected = totalCollectedInRound >= expectedRoundTotal && expectedRoundTotal > 0;

  // Recipient details
  const currentRecipientMember = currentActiveRound
    ? groupMembers.find((m) => m.id === currentActiveRound.payoutMemberId)
    : null;

  const currentPayoutObj = currentActiveRound
    ? groupPayouts.find((p) => p.roundId === currentActiveRound.id)
    : null;

  // Handle dispute submit
  const handleRaiseDisputeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!disputeDescription.trim()) return;

    onRaiseDispute({
      groupId: group.id,
      category: disputeCategory,
      description: disputeDescription,
      evidenceUrl: disputeEvidence || "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=200", // mock invoice screenshot
    });

    setDisputeDescription("");
    setDisputeEvidence("");
    setShowDisputeModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10 select-none">
      {/* Back Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 border border-brand-border hover:bg-brand-cream/80 text-brand-forest rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-xs text-brand-muted uppercase font-mono tracking-widest font-semibold block">
            Mutual Circles
          </span>
          <h2 className="text-xl md:text-2xl font-display font-medium text-brand-forest">
            {group.name}
          </h2>
        </div>
      </div>

      {/* Main Tabs Router */}
      <div className="flex border-b border-brand-border outline-none">
        {(["overview", "members", "contributions", "payouts", "disputes"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? "border-brand-clay text-brand-clay font-bold"
                : "border-transparent text-brand-muted hover:text-brand-forest"
            }`}
          >
            {tab}
            {tab === "disputes" && groupDisputes.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 text-[9px] font-mono bg-red-500 text-white font-bold rounded-full">
                {groupDisputes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TABS CONTAINER */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Round Status */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status overview hero */}
            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 adire-grid w-40 h-full pointer-events-none opacity-5" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-full border ${group.status === GroupStatus.ACTIVE ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-brand-gold/15 text-brand-gold border-brand-gold/25'}`}>
                    {group.status} CIRCLE
                  </span>
                  <p className="text-xs text-brand-muted mt-2 max-w-md">
                    {group.description}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] tracking-wider uppercase font-mono text-brand-muted block">COOPERATIVE FEE</span>
                  <span className="text-sm font-bold text-brand-forest">1.5% at rotation payout</span>
                </div>
              </div>

              {group.status === GroupStatus.FORMING && (
                <div className="p-5 bg-brand-cream border border-brand-border rounded-xl space-y-4">
                  <div className="flex gap-3">
                    <Users className="w-5 h-5 text-brand-clay shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-medium text-brand-forest text-sm">Circle Recruitment Phase</h4>
                      <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                        Currently coordinating members before starting slot distribution. We need **{group.maxMembers}** people. (Current: **{groupMembers.length}** joined).
                      </p>
                    </div>
                  </div>

                  {isUserAdmin ? (
                    <div className="pt-2 border-t border-brand-border flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                      <div className="text-[11px] text-brand-clay font-medium leading-tight">
                        *As administrator, you can start this circle once members are recruited. Rotation positions will be shuffled!
                      </div>
                      <button
                        onClick={() => onStartGroup(group.id)}
                        disabled={groupMembers.length < 3}
                        className="bg-brand-clay hover:bg-brand-clay/90 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed shrink-0"
                      >
                        <Play className="w-4 h-4 fill-white shrink-0" />
                        Lock Slots & Start Circle
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-brand-muted font-medium italic">
                      Waiting for the circle admin to activate and start slot distribution...
                    </div>
                  )}
                </div>
              )}

              {group.status === GroupStatus.ACTIVE && currentActiveRound && (
                <div className="space-y-4 pt-4 border-t border-brand-cream">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-display font-semibold text-brand-forest text-base">
                      Round {group.currentRound} Progress Bar
                    </h3>
                    <span className="text-xs text-brand-muted font-mono">
                      {paidContributionsInRound.length} of {groupMembers.length} paid
                    </span>
                  </div>

                  <div className="relative">
                    <div className="w-full bg-brand-cream h-4 rounded-full overflow-hidden border border-brand-border p-0.5">
                      <div
                        className="bg-brand-clay h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(totalCollectedInRound / expectedRoundTotal) * 100}%`,
                        }}
                      />
                    </div>
                    {/* Centered textual statistics */}
                    <div className="flex justify-between items-center text-[10px] text-brand-muted mt-2 font-mono">
                      <span>Fund Gathered: {formatCurrency(totalCollectedInRound)}</span>
                      <span>Goal: {formatCurrency(expectedRoundTotal)}</span>
                    </div>
                  </div>

                  {/* Countdown or payout release notifier */}
                  {roundIsFullyCollected && currentPayoutObj?.status !== PayoutStatus.COMPLETED ? (
                    <div className="bg-emerald-50 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-emerald-800 text-sm">Full Round Funded!</h4>
                        <p className="text-xs text-emerald-700">
                          100% of mutual contributions gathered. Ready to release payout to recipient.
                        </p>
                      </div>

                      {isUserAdmin ? (
                        <button
                          onClick={() => onTriggerPayout(group.id, currentActiveRound.id)}
                          className="bg-brand-forest text-brand-cream hover:bg-brand-forest/90 font-bold text-xs px-4 py-2.5 rounded-lg border border-brand-forest/10 cursor-pointer shadow-sm animate-pulse-slow"
                        >
                          Send ₦ Payout Transfer
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-800 font-bold animate-pulse">
                          Waiting for admin cashout...
                        </span>
                      )}
                    </div>
                  ) : currentPayoutObj?.status === PayoutStatus.COMPLETED ? (
                    <div className="bg-brand-cream border border-brand-border p-4 rounded-xl flex items-center gap-3 text-brand-forest">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-brand-forest text-sm">Round Complete · Payout Released</h4>
                        <p className="text-xs text-brand-muted">
                          The rotational slice of {formatCurrency(expectedRoundTotal - expectedRoundTotal * 0.015)} net has been payout sent to recipient.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-brand-gold/10 border border-brand-gold/20 p-4 rounded-xl flex items-start gap-3">
                      <Clock className="w-5 h-5 text-brand-gold mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-brand-forest text-sm">Awaiting Remaining Collections</h4>
                        <p className="text-xs text-brand-muted">
                          Once all circle members complete their round contribution, the escrow fund unlocks automatically.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Next Payout Widget Details */}
            {group.status === GroupStatus.ACTIVE && currentActiveRound && (
              <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
                <h3 className="text-base font-display font-semibold text-brand-forest">
                  Active Round Recipient (Target)
                </h3>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 bg-brand-cream/60 p-4 rounded-xl border border-brand-border">
                  <div className="flex items-center gap-4">
                    <img
                      src={currentRecipientMember?.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
                      alt={currentRecipientMember?.displayName}
                      className="w-14 h-14 rounded-full border border-brand-border object-cover"
                    />
                    <div>
                      <span className="text-[10px] tracking-wider uppercase font-mono text-brand-muted">ROUND {group.currentRound} SLICE RECIPIENT</span>
                      <h4 className="font-display font-semibold text-brand-forest text-sm sm:text-base mt-0.5">
                        {currentRecipientMember?.displayName || "Loading Member..."}
                      </h4>
                      <span className="text-xs text-brand-clay font-medium block">
                        Trust reputation Score: {currentRecipientMember?.trustScore}%
                      </span>
                    </div>
                  </div>

                  <div className="border-t sm:border-t-0 sm:border-l border-brand-border pt-4 sm:pt-0 sm:pl-6 text-left sm:text-right">
                    <span className="text-[10px] tracking-wider uppercase font-mono text-brand-muted block">DUE PAYOUT SLICE</span>
                    <span className="text-lg font-extrabold text-brand-forest block">
                      {formatCurrency(expectedRoundTotal)}
                    </span>
                    <span className="text-[10px] text-brand-muted italic mt-0.5 block">
                      {formatCurrency(expectedRoundTotal - expectedRoundTotal * 0.015)} after platform base charge
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Rotational Rules Box & Details Panel */}
          <div className="space-y-6">
            
            {/* Circle settings specs list */}
            <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm space-y-4 text-xs">
              <h3 className="text-sm font-display font-bold text-brand-forest uppercase tracking-wider border-b border-brand-cream pb-2">
                Circle Settings
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted">Amount Per Member:</span>
                  <span className="font-bold text-brand-forest">{formatCurrency(group.contributionAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted">Contribution Frequency:</span>
                  <span className="font-semibold text-brand-forest uppercase font-mono">{group.frequency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted">Payout Selection Model:</span>
                  <span className="font-semibold text-brand-clay uppercase font-mono text-[11px]">{group.payoutOrder}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted">Membership limit:</span>
                  <span className="font-semibold text-brand-forest">{group.maxMembers} Slots max</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted">Grace period time:</span>
                  <span className="font-semibold text-brand-forest">{group.gracePeriodHours} hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted">Late Delay Penalty rate:</span>
                  <span className="font-semibold text-brand-clay">{(group.penaltyRate * 100)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted">Circle Privacy rules:</span>
                  <span className="font-medium text-brand-forest">
                    {group.isPrivate ? "Private Circle (Invite Link)" : "Public Circle (Discoverable)"}
                  </span>
                </div>
              </div>

              {/* Share links */}
              <div className="pt-3 border-t border-brand-cream flex items-center justify-between text-[11px] text-brand-clay font-bold">
                <span>Invite Code: <span className="font-mono text-brand-forest px-1.5 py-0.5 bg-brand-cream rounded select-all">{group.inviteCode}</span></span>
              </div>
            </div>

            {/* Quick Yoruba Wisdom Quotes proportional */}
            <div className="bg-[#121A2C] p-5 rounded-2xl text-brand-cream space-y-2 relative overflow-hidden text-xs">
              <div className="absolute top-0 right-0 adire-accent opacity-5 w-1/3 h-full" />
              <Sparkles className="w-5 h-5 text-brand-gold animate-bounce-slow" />
              <p className="italic text-brand-cream/90 font-display">
                &ldquo;Ẹni tó bá fẹ́ kọ́ ilé ńlá, kò gbọ́dọ̀ kọminu láti gbin irúgbìn trust kankan sínú ilẹ̀ adashe rẹ̀.&rdquo;
              </p>
              <p className="text-[9px] text-brand-gold uppercase tracking-wider font-semibold font-mono text-right">
                — Nigerian Traditional Proverb
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {activeTab === "members" && (
        <div className="space-y-6">
          {group.status === GroupStatus.FORMING && isUserAdmin && (
            <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm space-y-4">
              <h3 className="text-sm font-display font-bold text-brand-forest">Invite / Add Members to Circle</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedUserToAdd}
                  onChange={(e) => setSelectedUserToAdd(e.target.value)}
                  className="w-full sm:flex-1 text-xs px-3 py-2 border border-brand-border rounded-lg bg-brand-cream text-brand-forest"
                >
                  <option value="">Select a platform user to invite...</option>
                  {allUsers
                    .filter((u) => !groupMembers.some((gm) => gm.userId === u.id))
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} (Trust Score: 94%)
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => {
                    if (selectedUserToAdd) {
                      onAddMember(group.id, selectedUserToAdd);
                      setSelectedUserToAdd("");
                    }
                  }}
                  disabled={!selectedUserToAdd || groupMembers.length >= group.maxMembers}
                  className="bg-brand-forest text-brand-cream hover:bg-brand-forest/90 disabled:opacity-50 text-xs px-4 py-2.5 rounded-lg font-bold cursor-pointer transition-colors"
                >
                  Invite to Circle
                </button>
              </div>
              <p className="text-[11px] text-brand-muted">
                *Once the group reaches {group.maxMembers} members, you can lock the positions and start contributions.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[650px]">
              <thead className="bg-brand-cream text-brand-muted text-[10px] font-bold uppercase tracking-wider border-b border-brand-border">
                <tr>
                  <th className="p-4">Slot Position</th>
                  <th className="p-4">Circle Companion</th>
                  <th className="p-4">Reliability Rating</th>
                  <th className="p-4">Paid Mutual Cash</th>
                  <th className="p-4 text-center">Payout state</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream">
                {groupMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-brand-cream/10">
                    {/* Position Slot */}
                    <td className="p-4">
                      {group.status === GroupStatus.FORMING && isUserAdmin ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={member.payoutPosition || ""}
                            onChange={(e) => {
                              const pos = e.target.value === "" ? 0 : parseInt(e.target.value);
                              onUpdateMemberPosition(member.id, pos);
                            }}
                            className="text-xs bg-brand-cream border border-brand-border rounded px-1.5 py-1 text-brand-forest font-bold font-mono outline-none cursor-pointer hover:border-brand-clay"
                          >
                            <option value="">Not Assigned</option>
                            {Array.from({ length: groupMembers.length }, (_, k) => k + 1).map((val) => (
                              <option key={val} value={val}>
                                Spot #{val}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : member.payoutPosition ? (
                        <span className="font-mono font-bold text-brand-clay bg-brand-clay/10 px-2 py-0.5 rounded">
                          Spot #{member.payoutPosition}
                        </span>
                      ) : (
                        <span className="text-brand-muted font-serif text-[11px]">Awaiting Start...</span>
                      )}
                    </td>

                    {/* Member Profile */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
                          alt={member.displayName}
                          className="w-8 h-8 rounded-full border border-brand-border object-cover"
                        />
                        <div>
                          <span className="font-bold text-brand-forest block">
                            {member.displayName} {member.userId === user.id && "(You)"}
                          </span>
                          <span className="text-[10px] text-brand-muted block mt-0.5">
                            Joined {new Date(member.joinedAt).toLocaleDateString("en-NG")}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Trust Scores */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold font-mono ${member.trustScore >= 90 ? "text-emerald-600" : "text-brand-gold"}`}>
                          {member.trustScore}%
                        </span>
                        {member.trustScore >= 90 ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <BadgeAlert className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                        )}
                      </div>
                    </td>

                    {/* Contributions */}
                    <td className="p-4 font-mono text-brand-forest font-bold">
                      {formatCurrency(member.totalContributed)}
                    </td>

                    {/* Payout Received status */}
                    <td className="p-4 text-center">
                      {member.hasReceivedPayout ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 rounded font-mono text-[10px] font-semibold">
                          RECEIVED SLICE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-brand-cream text-brand-muted border border-brand-border rounded font-mono text-[10px]">
                          WAITING ROTATION
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTRIBUTIONS LIST */}
      {activeTab === "contributions" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-brand-border">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-muted font-bold block">
                Circle ledger audit
              </span>
              <h3 className="font-display font-medium text-brand-forest text-sm mt-0.5">
                Outstanding Contributions (Active Round: {group.currentRound})
              </h3>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600/10" /> PAID</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-yellow-600/10" /> PENDING</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-600/10" /> OVERDUE/LATE</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[650px]">
              <thead className="bg-brand-cream text-brand-muted text-[10px] font-bold uppercase tracking-wider border-b border-brand-border">
                <tr>
                  <th className="p-4">Round</th>
                  <th className="p-4">Member</th>
                  <th className="p-4">Due Target</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4 text-center">Status</th>
                  {isUserAdmin && <th className="p-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream">
                {groupContributions
                  .sort((a,b) => b.roundId.localeCompare(a.roundId))
                  .map((c) => {
                    const memberObj = groupMembers.find((m) => m.id === c.memberId);
                    const isOverdue = c.status === ContributionStatus.LATE || c.status === ContributionStatus.MISSED;
                    return (
                      <tr key={c.id} className="hover:bg-brand-cream/10">
                        {/* Round Number */}
                        <td className="p-4">
                          <span className="font-mono bg-brand-cream border border-brand-border px-2 py-0.5 rounded">
                            RND {groupContributions.indexOf(c) % groupMembers.length + 1}
                          </span>
                        </td>

                        {/* Profile */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={memberObj?.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
                              alt={memberObj?.displayName}
                              className="w-6 h-6 rounded-full border border-brand-border object-cover"
                            />
                            <span className="font-semibold text-brand-forest">
                              {memberObj?.displayName}
                            </span>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="p-4 text-brand-muted">
                          {new Date(c.dueDate).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Amount */}
                        <td className="p-4 font-mono font-bold text-brand-forest">
                          {formatCurrency(c.amount + c.penaltyAmount)}
                          {c.penaltyAmount > 0 && (
                            <span className="text-[9px] text-brand-clay block">
                              (+{formatCurrency(c.penaltyAmount)} penalty)
                            </span>
                          )}
                        </td>

                        {/* Status bar badge */}
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full border ${
                            c.status === ContributionStatus.PAID
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                              : isOverdue
                              ? "bg-red-500/5 text-red-500 border-red-500/10 font-bold"
                              : "bg-brand-gold/15 text-brand-gold border-brand-gold/25"
                          }`}>
                            {c.status}
                          </span>
                        </td>

                        {/* Action parameters - Admin Waive Penalty */}
                        {isUserAdmin && (
                          <td className="p-4 text-center">
                            {isOverdue && c.penaltyAmount > 0 ? (
                              <button
                                onClick={() => onWaivePenalty(c.id)}
                                className="text-[10px] bg-brand-clay/10 text-brand-clay font-bold px-2 py-1 hover:bg-brand-clay hover:text-white rounded border border-brand-clay/15 transition-all cursor-pointer"
                              >
                                Waive Fee
                              </button>
                            ) : (
                              <span className="text-xs text-brand-muted font-serif">-</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PAYOUTS LIST */}
      {activeTab === "payouts" && (
        <div className="space-y-6">
          <div className="flex bg-white p-4 rounded-xl border border-brand-border items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-muted block">
                Cash payout scheduler
              </span>
              <h3 className="font-display font-medium text-brand-forest text-sm mt-0.5">
                Rotational Slice Schedule
              </h3>
            </div>
            
            <p className="text-xs text-brand-muted max-w-sm text-right leading-tight">
              Each recipient receives cumulative pool sum after the completion of each savings round.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[650px]">
              <thead className="bg-brand-cream text-brand-muted text-[10px] font-bold uppercase tracking-wider border-b border-brand-border">
                <tr>
                  <th className="p-4">Round</th>
                  <th className="p-4">Target Payout Recipient</th>
                  <th className="p-4">Scheduled Date</th>
                  <th className="p-4">Net Payout (NGN)</th>
                  <th className="p-4 text-center">Payout State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream">
                {groupPayouts.map((p) => {
                  const memberObj = groupMembers.find((m) => m.id === p.memberId);
                  return (
                    <tr key={p.id} className="hover:bg-brand-cream/10">
                      <td className="p-4 font-mono font-bold">Round #{groupPayouts.indexOf(p) + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={memberObj?.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
                            alt={memberObj?.displayName}
                            className="w-6 h-6 rounded-full border border-brand-border object-cover"
                          />
                          <span className="font-semibold text-brand-forest">
                            {memberObj?.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-brand-muted">
                        {new Date(p.scheduledFor).toLocaleDateString("en-NG", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 font-mono font-bold text-brand-forest">
                        {formatCurrency(p.netAmount)}
                        <span className="text-[9px] text-brand-muted block">
                          (after {formatCurrency(p.platformFee)} co-op fee)
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-mono uppercase rounded-full border ${p.status === PayoutStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-brand-gold/15 text-brand-gold border-brand-gold/25'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DISPUTES PANEL */}
      {activeTab === "disputes" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-brand-border">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-brand-clay font-bold block">
                Circle dispute center
              </span>
              <h3 className="font-display font-medium text-brand-forest text-base mt-1">
                Disagreement & Mediation Ledger
              </h3>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed max-w-lg">
                If a circular companion misses their contribution, or you spot a calculation discrepancy, open a formal mediation. Platform administrators audit resolving.
              </p>
            </div>

            <button
              onClick={() => setShowDisputeModal(true)}
              className="bg-brand-clay hover:bg-brand-clay/90 text-brand-cream text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
            >
              <BadgeAlert className="w-4 h-4 shrink-0" />
              File Open Dispute
            </button>
          </div>

          {groupDisputes.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-brand-border space-y-3">
              <MessageSquare className="w-12 h-12 text-brand-forest/30 mx-auto" />
              <h4 className="font-display font-medium text-brand-forest">Peaceful Circular Progress</h4>
              <p className="text-xs text-brand-muted max-w-sm mx-auto">
                No active or historical disputes logged for this savings group. All members are coordinate correctly!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupDisputes.map((d) => (
                <div key={d.id} className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-cream pb-3">
                    <div>
                      <span className="text-[10px] font-mono tracking-wider font-semibold text-brand-clay uppercase bg-brand-clay/10 px-2 py-0.5 rounded">
                        DISPUTE #{d.id} ID · {d.category.replace("_", " ")}
                      </span>
                      <span className="text-xs text-brand-muted block mt-1.5">
                        Filed by **{d.raisedByName}**
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 text-[9px] font-mono rounded uppercase border ${
                        d.status === DisputeStatus.OPEN
                          ? "bg-red-500/5 text-red-500 border-red-500/10 font-bold"
                          : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                      }`}>
                        {d.status}
                      </span>
                      <span className="text-[10px] text-brand-muted block mt-1">
                        {new Date(d.createdAt).toLocaleDateString("en-NG")}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-brand-forest leading-relaxed">
                    {d.description}
                  </p>

                  {d.evidenceUrl && (
                    <div className="pt-2">
                      <span className="text-[11px] text-brand-muted block mb-1">Attached Evidence Capture:</span>
                      <a href={d.evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-brand-clay hover:underline font-semibold bg-brand-cream px-2.5 py-1.5 rounded-lg border border-brand-border">
                        <FileMinus className="w-3.5 h-3.5" />
                        View Evidence Attachment <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {d.resolution && (
                    <div className="p-4 bg-brand-cream/80 border border-brand-border rounded-xl space-y-1">
                      <span className="text-[10px] font-bold font-mono tracking-widest text-brand-forest uppercase block">
                        ADMIN PLATFORM RESOLUTION
                      </span>
                      <p className="text-xs font-serif text-brand-forest leading-relaxed italic">
                        &ldquo;{d.resolution}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Raise Dispute Overlay Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#FAF7F2] w-full max-w-lg rounded-2xl shadow-2xl border border-brand-border overflow-hidden animate-scale-up">
            <div className="bg-brand-forest p-4 text-brand-cream flex items-center justify-between">
              <h3 className="font-display font-medium text-brand-gold text-base">
                Raise Circle Dispute (Mediation Request)
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-brand-cream/80 hover:text-white font-sans cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRaiseDisputeSubmit} className="p-6 space-y-4 text-xs select-none">
              <div className="space-y-1">
                <label className="font-semibold text-brand-forest">Dispute Category</label>
                <select
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-brand-border bg-white text-brand-forest text-xs rounded-lg outline-none"
                >
                  <option value="missed_payout">Member Missed Contribution Deadline</option>
                  <option value="wrong_amount">Wrong Platform Calculations / Sum mismatch</option>
                  <option value="member_misconduct">Circular Companion Misconduct / Scam risk</option>
                  <option value="other">Other Circle Issue</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-forest">Mediation Description</label>
                <textarea
                  required
                  rows={4}
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Explain the incident with dates, slot numbers, and members involved. Provide clear contexts for the platform audit teams ..."
                  className="w-full p-3 border border-brand-border bg-white text-brand-forest text-xs rounded-lg outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-forest">Evidence Image Link (Optional)</label>
                <input
                  type="text"
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                  placeholder="Paste transaction snap link or bank slip screenshot url ..."
                  className="w-full px-3 py-2 border border-brand-border bg-white text-brand-forest text-xs rounded-lg outline-none"
                />
                <span className="text-[10px] text-brand-muted">
                  *Leaving this empty logs a standard system template screenshot.
                </span >
              </div>

              <button
                type="submit"
                className="w-full bg-brand-clay hover:bg-brand-clay/90 text-white font-bold py-3 rounded-xl transition-colors text-xs cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4 shrink-0" />
                Submit Formal Dispute to Audit Queue
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
