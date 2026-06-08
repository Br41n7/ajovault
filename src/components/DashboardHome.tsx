/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  Wallet,
  Coins,
  Users,
  ShieldAlert,
  Sparkles,
  Clock,
  CreditCard,
  ArrowUpRight,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  SavingsGroup,
  GroupMember,
  Contribution,
  Transaction,
  User,
  ContributionStatus,
  TransactionType,
  TransactionStatus
} from "../types";

interface DashboardHomeProps {
  user: User;
  groups: SavingsGroup[];
  members: GroupMember[];
  contributions: Contribution[];
  transactions: Transaction[];
  onSelectGroup: (groupId: string) => void;
  onPayContribution: (contributionId: string, amount: number, channel: string) => void;
  onNavigateToWallet: () => void;
  onNavigateToCreateGroup: () => void;
}

export default function DashboardHome({
  user,
  groups,
  members,
  contributions,
  transactions,
  onSelectGroup,
  onPayContribution,
  onNavigateToWallet,
  onNavigateToCreateGroup,
}: DashboardHomeProps) {
  // Paystack Simulator State
  const [activePayment, setActivePayment] = useState<{
    id: string;
    groupName: string;
    amount: number;
    penalty: number;
  } | null>(null);
  const [paymentChannel, setPaymentChannel] = useState<"card" | "bank_transfer" | "wallet">("card");
  const [selectedBank, setSelectedBank] = useState("GTBank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"gateway" | "success">("gateway");
  const [paystackSimStep, setPaystackSimStep] = useState<number>(0);

  // Contributions Filter state for ledger history timeline
  const [activeContributionFilter, setActiveContributionFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");

  const filteredContributions = contributions
    .filter((c) => {
      if (activeContributionFilter === "paid") {
        return c.status === ContributionStatus.PAID;
      }
      if (activeContributionFilter === "pending") {
        return c.status === ContributionStatus.PENDING;
      }
      if (activeContributionFilter === "overdue") {
        return c.status === ContributionStatus.LATE || c.status === ContributionStatus.MISSED;
      }
      return true; // "all"
    })
    .sort((a, b) => {
      const dateA = a.paidAt ? new Date(a.paidAt).getTime() : new Date(a.dueDate).getTime();
      const dateB = b.paidAt ? new Date(b.paidAt).getTime() : new Date(b.dueDate).getTime();
      return dateB - dateA;
    });

  // Filter Upcoming Contributions
  const myContributions = contributions.filter(
    (c) => c.userId === user.id && c.status !== ContributionStatus.PAID
  );

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amt);
  };

  const getStatusBadgeClass = (status: ContributionStatus) => {
    switch (status) {
      case ContributionStatus.PENDING:
        return "bg-brand-gold/15 text-brand-gold border-brand-gold/25";
      case ContributionStatus.LATE:
        return "bg-amber-600/15 text-amber-600 border-amber-600/25 animate-pulse-slow";
      case ContributionStatus.MISSED:
        return "bg-red-600/15 text-red-600 border-red-600/25";
      default:
        return "bg-brand-forest/15 text-brand-forest border-brand-forest/25";
    }
  };

  // Run paystack transaction simulator
  const handleSimulatedPayment = () => {
    if (!activePayment) return;
    setIsProcessing(true);
    setPaystackSimStep(1); // Spawning popup secure frame

    // Progressive Nigerian Network condition steps:
    setTimeout(() => {
      setPaystackSimStep(2); // popup delay fallback to inline routing redirect mode

      setTimeout(() => {
        setPaystackSimStep(3); // Listening on Paystack Webhook listener

        setTimeout(() => {
          setPaystackSimStep(4); // Webhook payload success verification confirmed

          setTimeout(() => {
            setIsProcessing(false);
            setPaymentStep("success");
            setPaystackSimStep(0);

            // Apply to parent state after short congrats screen
            setTimeout(() => {
              onPayContribution(activePayment.id, activePayment.amount + activePayment.penalty, paymentChannel);
              setActivePayment(null);
              setPaymentStep("gateway");
            }, 1800);
          }, 800);
        }, 1200);
      }, 1500);
    }, 1000);
  };

  // Computations
  const activeMyGroups = groups.filter((g) =>
    members.some((m) => m.groupId === g.id && m.userId === user.id)
  );

  const totalSavedSoFar = transactions
    .filter((t) => t.type === TransactionType.CONTRIBUTION && t.status === TransactionStatus.SUCCESS)
    .reduce((sum, t) => sum + t.amount, 0);

  // Trust score coloring
  const getTrustColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "text-brand-gold bg-brand-gold/10 border-brand-gold/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 adire-grid w-48 h-full pointer-events-none opacity-5" />
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-medium text-brand-forest">
            Ajo Kwenu, {user.firstName}!
          </h2>
          <p className="text-sm text-brand-muted mt-1">
            Keep your rotational contribution cycles healthy and build long-term communal trust.
          </p>
        </div>
        <button
          onClick={onNavigateToCreateGroup}
          className="flex items-center gap-2 bg-brand-clay hover:bg-brand-clay/90 text-brand-cream font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Circle (Ajo)
        </button>
      </div>

      {/* Grid Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Wallet Balance */}
        <div
          onClick={onNavigateToWallet}
          className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex items-center gap-4 cursor-pointer hover:border-brand-clay transition-all duration-200"
        >
          <div className="p-3 bg-brand-clay/10 text-brand-clay rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-brand-muted uppercase tracking-wider block">
              Wallet Balance
            </span>
            <span className="text-xl font-bold text-brand-forest">
              {formatCurrency(user.walletBalance)}
            </span>
            <span className="text-[10px] text-brand-clay font-medium block mt-0.5 hover:underline flex items-center gap-0.5">
              Top up / Cashout <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Total Saved Cumulative */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-forest/10 text-brand-forest rounded-xl">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-brand-muted uppercase tracking-wider block">
              Total Contributed
            </span>
            <span className="text-xl font-bold text-brand-forest">
              {formatCurrency(totalSavedSoFar)}
            </span>
            <span className="text-[10px] text-brand-forest font-medium block mt-0.5">
              Across all circles
            </span>
          </div>
        </div>

        {/* Reputation Trust Score */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex items-center gap-4 relative">
          <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-medium text-brand-muted uppercase tracking-wider block">
              Trust Score
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-brand-forest">{user.trustScore}%</span>
              <span className={`text-[10px] font-mono border px-1.5 py-0.5 rounded ${getTrustColor(user.trustScore)}`}>
                {user.trustScore >= 90 ? "Excellent" : "Fair"}
              </span>
            </div>
            <span className="text-[10px] text-brand-muted block mt-0.5">
              Reputation & reliability score
            </span>
          </div>
        </div>

        {/* Active Groups Counts */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-brand-muted uppercase tracking-wider block">
              My Circles
            </span>
            <span className="text-xl font-bold text-brand-forest">{activeMyGroups.length} Active</span>
            <span className="text-[10px] text-brand-muted block mt-0.5">
              Rotational savings groups
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Growth Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-lg font-display font-medium text-brand-forest">
              Circular Savings & Contributor Timeline
            </h3>
            <p className="text-xs text-brand-muted">
              Live tracking of your circular savings additions and accumulated platform trust ledger deposits.
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto uppercase font-mono text-[10px] tracking-widest bg-brand-cream text-brand-forest px-2.5 py-1 rounded-full border border-brand-border font-bold">
            <span className="w-2 h-2 rounded-full bg-brand-clay animate-pulse" />
            Naira Financial Ledger (NGN)
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[200px] md:h-[280px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                { month: "Jan", saved: 30000, target: 50000 },
                { month: "Feb", saved: 75000, target: 100000 },
                { month: "Mar", saved: 120000, target: 150000 },
                { month: "Apr", saved: 180000, target: 200000 },
                { month: "May", saved: 240000, target: 250000 },
                { month: "Jun", saved: totalSavedSoFar || 300000, target: 300000 },
              ]}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8A5A44" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8A5A44" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#31493C" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#31493C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EFEA" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#6B7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₦${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FAF7F2",
                  border: "1px solid #D9D2C5",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#1E293B",
                }}
                formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, "Amount"]}
              />
              <Area
                type="monotone"
                dataKey="saved"
                name="Contributed"
                stroke="#8A5A44"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSaved)"
              />
              <Area
                type="monotone"
                dataKey="target"
                name="Circular Obligation"
                stroke="#31493C"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorTarget)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center gap-6 text-[11px] justify-center pt-2 font-mono">
          <div className="flex items-center gap-1.5 text-brand-forest font-semibold">
            <span className="w-3 h-1.5 bg-brand-clay rounded-full block" />
            Contributed: ₦{totalSavedSoFar.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-brand-muted">
            <span className="w-3 h-1.5 border-t-2 border-dashed border-brand-forest rounded-full block" />
            Target: ₦300,000
          </div>
        </div>
      </div>

      {/* Main content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Groups Carousel + Contributions List */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Savings Groups list */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-display font-medium text-brand-forest">
                My Active Mutual Groups
              </h3>
              <span className="text-xs text-brand-muted">
                {activeMyGroups.length} circles found
              </span>
            </div>

            {activeMyGroups.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-brand-border text-center space-y-3">
                <ShieldAlert className="w-10 h-10 text-brand-gold mx-auto opacity-60" />
                <h4 className="font-display font-medium text-brand-forest">
                  No Joined Circles Yet
                </h4>
                <p className="text-xs text-brand-muted max-w-sm mx-auto">
                  Get started by creating a savings circle as group admin, or join one via invite code!
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={onNavigateToCreateGroup}
                    className="text-xs bg-brand-clay text-brand-cream px-3 py-2 rounded-lg font-medium cursor-pointer"
                  >
                    Create Circle
                  </button>
                  <button className="text-xs bg-brand-forest text-brand-cream px-3 py-2 rounded-lg font-medium">
                    Browse Discover Tabs
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeMyGroups.map((group) => {
                  const userAsMember = members.find(
                    (m) => m.groupId === group.id && m.userId === user.id
                  );
                  return (
                    <div
                      key={group.id}
                      onClick={() => onSelectGroup(group.id)}
                      className="bg-white border border-brand-border hover:border-brand-clay rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between cursor-pointer group transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {/* Photo Header */}
                      <div className="h-24 relative bg-brand-forest/90">
                        {group.coverImageUrl && (
                          <img
                            src={group.coverImageUrl}
                            alt={group.name}
                            className="w-full h-full object-cover mix-blend-overlay opacity-30"
                          />
                        )}
                        <span className="absolute top-3 right-3 text-[10px] font-mono tracking-wider text-brand-gold bg-brand-forest/80 px-2 py-0.5 rounded-full border border-brand-gold/20 backdrop-blur-sm shadow-sm uppercase">
                          {group.frequency}
                        </span>
                        <div className="absolute bottom-3 left-4">
                          <h4 className="text-white font-display text-base font-semibold truncate max-w-[200px]">
                            {group.name}
                          </h4>
                          <span className="text-[10px] text-brand-gold font-sans font-medium uppercase tracking-wide">
                            {group.payoutOrder} Rotation Order
                          </span>
                        </div>
                      </div>

                      {/* Group Progress Info */}
                      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-brand-muted font-medium">Rotation Round</span>
                          <span className="font-semibold text-brand-forest">
                            Round {group.currentRound} of {group.totalRounds}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-brand-cream h-2 rounded-full overflow-hidden border border-brand-border">
                          <div
                            className="bg-brand-clay h-full rounded-full"
                            style={{
                              width: `${(group.currentRound / group.totalRounds) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Core Pricing / Position detail */}
                        <div className="grid grid-cols-2 gap-2 border-t border-brand-cream pt-3 text-xs">
                          <div>
                            <span className="text-brand-muted block">Contribution</span>
                            <span className="font-bold text-brand-forest text-sm">
                              {formatCurrency(group.contributionAmount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-brand-muted block">Your Spot</span>
                            <span className="font-bold text-brand-clay text-sm flex items-center gap-1">
                              {userAsMember?.payoutPosition
                                ? `Slot #${userAsMember.payoutPosition}`
                                : "Unassigned"}
                            </span>
                          </div>
                        </div>

                        {/* Next Due Date */}
                        <div className="bg-brand-cream/65 px-3 py-2 rounded-lg border border-brand-border text-[11px] text-brand-forest flex items-center justify-between">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-brand-clay shrink-0" />
                            Next Payment
                          </span>
                          <span className="font-semibold">
                            {group.nextContributionDate
                              ? new Date(group.nextContributionDate).toLocaleDateString("en-NG", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Not Scheduled"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Contributions Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-display font-medium text-brand-forest">
                Upcoming Savings Contributions
              </h3>
              <span className="text-xs text-brand-muted font-mono">{myContributions.length} Outstanding</span>
            </div>

            {myContributions.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-500/10 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-800 text-sm">No Pending Debts!</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Outstanding contributions are completely settled for this round. Keep up the high trust rating!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-brand-border rounded-2xl shadow-sm divide-y divide-brand-cream overflow-hidden">
                {myContributions.map((c) => {
                  const grp = groups.find((g) => g.id === c.groupId);
                  const isLate = c.status === ContributionStatus.LATE || c.status === ContributionStatus.MISSED;
                  return (
                    <div
                      key={c.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-cream/20 transition-all"
                    >
                      <div className="flex gap-3">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${isLate ? "bg-red-500/5 text-red-500 border-red-500/10" : "bg-brand-cream text-brand-forest border-brand-border"}`}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-display font-medium text-brand-forest text-sm">
                            {grp?.name || "Ajo Circle Contribution"}
                          </h4>
                          <span className="text-[11px] text-brand-muted block mt-0.5">
                            Due on {new Date(c.dueDate).toLocaleDateString("en-NG", {
                              weekday: "short",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Right Detail parameters */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                        <div className="text-left sm:text-right">
                          <span className="text-xs text-brand-muted block">Total Due</span>
                          <span className="text-sm font-bold text-brand-forest">
                            {formatCurrency(c.amount + c.penaltyAmount)}
                          </span>
                          {c.penaltyAmount > 0 && (
                            <span className="text-[10px] text-brand-clay font-medium block">
                              Includes {formatCurrency(c.penaltyAmount)} late penalty
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono border px-2 py-0.5 rounded-full ${getStatusBadgeClass(c.status)}`}>
                            {c.status}
                          </span>

                          <button
                            onClick={() =>
                              setActivePayment({
                                id: c.id,
                                groupName: grp?.name || "Ajo Circle",
                                amount: c.amount,
                                penalty: c.penaltyAmount,
                              })
                            }
                            className="bg-brand-forest hover:bg-brand-forest/90 text-brand-cream text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Pay Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Contribution Activity Timeline/Ledger Feed */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="text-lg font-display font-medium text-brand-forest">
                  Recent Contribution Activity
                </h3>
                <p className="text-xs text-brand-muted">
                  Rotational pools timeline logs, paid escrow receipts, and member obligations.
                </p>
              </div>
              
              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-brand-border text-[11px] font-medium self-start sm:self-auto shadow-sm">
                {([
                  { id: "all", label: "All Activities" },
                  { id: "paid", label: "Paid Receipts" },
                  { id: "pending", label: "Pending" },
                  { id: "overdue", label: "Overdue" },
                ] as const).map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveContributionFilter(filter.id)}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-200 text-xs font-semibold ${
                      activeContributionFilter === filter.id
                        ? "bg-brand-clay text-brand-cream font-bold"
                        : "text-brand-muted hover:text-brand-forest hover:bg-brand-cream/50"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List and Timeline content */}
            {filteredContributions.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-brand-border text-center space-y-3">
                <p className="text-xs text-brand-muted">No contribution logs fit the selected filter criteria.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline connector line */}
                <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-brand-border" />

                <div className="space-y-4">
                  {filteredContributions.map((c) => {
                    const grp = groups.find((g) => g.id === c.groupId);
                    const member = members.find((m) => m.userId === c.userId && m.groupId === c.groupId);
                    const isSelf = c.userId === user.id;

                    // Compute date details to show
                    const dateToShow = c.status === ContributionStatus.PAID && c.paidAt
                      ? new Date(c.paidAt)
                      : new Date(c.dueDate);

                    const dateString = dateToShow.toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    // Icon and background color for the timeline dot
                    let dotBg = "bg-brand-cream text-brand-muted border-brand-border";
                    let statusLabel = c.status as string;
                    if (c.status === ContributionStatus.PAID) {
                      dotBg = "bg-emerald-50 text-emerald-600 border-emerald-500/30";
                      statusLabel = "Verified Paid";
                    } else if (c.status === ContributionStatus.LATE || c.status === ContributionStatus.MISSED) {
                      dotBg = "bg-red-50 text-red-500 border-red-500/20";
                      statusLabel = c.status === ContributionStatus.LATE ? "Late Due" : "Missed Obligation";
                    } else {
                      dotBg = "bg-brand-gold/15 text-brand-gold border-brand-gold/20";
                      statusLabel = "Awaiting Escrow";
                    }

                    return (
                      <div
                        key={c.id}
                        className="relative pl-12 pr-4 py-4 bg-white border border-brand-border rounded-2xl shadow-sm hover:border-brand-clay/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group animate-fade-in"
                      >
                        {/* Timeline node circle anchor */}
                        <div className={`absolute left-2.5 top-[18px] w-6 h-6 rounded-full border flex items-center justify-center text-[10px] shadow-sm z-10 transition-transform group-hover:scale-110 ${dotBg}`}>
                          {c.status === ContributionStatus.PAID ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : c.status === ContributionStatus.LATE || c.status === ContributionStatus.MISSED ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Title details & user profiling column */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display font-medium text-brand-forest text-sm">
                              {grp?.name || "Ajo Savings Circle"}
                            </span>
                            <span className="text-[10px] text-brand-muted font-mono bg-brand-cream border border-brand-border px-1.5 py-0.5 rounded-full font-bold">
                              Round {grp?.currentRound || "1"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {member?.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt="Member"
                                className="w-4 h-4 rounded-full object-cover border border-brand-border"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-brand-clay/20 text-brand-clay flex items-center justify-center text-[8px] font-bold">
                                {member?.displayName?.charAt(0) || "P"}
                              </div>
                            )}
                            <span className="text-xs font-semibold text-brand-forest">
                              {isSelf ? "You (Iyanu L.)" : member?.displayName || "Participant"}
                            </span>
                            <span className="text-brand-muted text-xs">
                              {c.status === ContributionStatus.PAID ? "successfully contributed to escrow" : "has scheduled payment of"}
                            </span>
                          </div>
                        </div>

                        {/* Timing, Payment Channel and Core amount column */}
                        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 border-t md:border-t-0 border-brand-cream/60 pt-2.5 md:pt-0 w-full md:w-auto">
                          <div className="text-left md:text-right font-mono text-xs">
                            <span className="text-brand-muted text-[10px] uppercase font-bold tracking-wider block">
                              {c.status === ContributionStatus.PAID ? "Approved On" : "Target Due"}
                            </span>
                            <span className="font-semibold text-brand-forest">
                              {dateString}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-xs">
                            {/* Payment Method Badge */}
                            {c.status === ContributionStatus.PAID && c.paymentChannel && (
                              <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/15 rounded-full">
                                {c.paymentChannel.replace("_", " ")}
                              </span>
                            )}
                            
                            <span className={`px-2 py-0.5 text-[9px] rounded-full uppercase font-bold border ${dotBg}`}>
                              {statusLabel}
                            </span>

                            <span className="font-bold text-brand-forest pl-1 text-sm">
                              {formatCurrency(c.amount + c.penaltyAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: Mini Transaction Log & Circle Rule Tips */}
        <div className="space-y-8">
          
          {/* Recent Transaction Log */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-brand-cream pb-3">
              <h3 className="text-base font-display font-semibold text-brand-forest">
                Recent Transaction Feed
              </h3>
              <Coins className="w-4 h-4 text-brand-gold" />
            </div>

            <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg border ${
                        t.type === TransactionType.TOP_UP || t.type === TransactionType.PAYOUT
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-brand-clay/10 text-brand-clay border-brand-clay/10"
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-medium text-brand-forest block">
                        {t.type === TransactionType.CONTRIBUTION && "Ajo Paid"}
                        {t.type === TransactionType.PAYOUT && "Recieved Rotation"}
                        {t.type === TransactionType.TOP_UP && "Wallet Funded"}
                        {t.type === TransactionType.WITHDRAWAL && "Fund Cashout"}
                      </span>
                      <span className="text-[10px] text-brand-muted block mt-0.5">
                        {new Date(t.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })} · {t.reference}
                      </span>
                    </div>
                  </div>
                  <span className={`font-bold ${t.type === TransactionType.PAYOUT ? 'text-emerald-700' : 'text-brand-forest'}`}>
                    {t.type === TransactionType.WITHDRAWAL ? "-" : "+"}
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Trust Widget */}
          <div className="bg-brand-forest p-5 rounded-2xl border border-brand-forest shadow-sm text-brand-cream relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-brand-clay/20 rounded-full blur-xl" />
            <div className="flex items-start gap-3 relative z-10">
              <ShieldAlert className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs">
                <h4 className="font-display font-semibold text-brand-gold">
                  Understanding Rotational Rules
                </h4>
                <p className="text-brand-cream/80 leading-relaxed">
                  The rotational sequence is governed strictly by slot numbers assigned by group administrators or random shuffle at start.
                </p>
                <p className="text-brand-cream/80 leading-relaxed">
                  Maintaining your high **Trust Score** secures earlier payout positions in next rounds and unlocks lower fee structures down to **1.0%** !
                </p>
                <div className="pt-1.5">
                  <a href="#rules" className="text-[11px] text-brand-gold hover:underline font-semibold block">
                    Learn Esusu, Adashe & Stokvel Guides →
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Paystack Checkout Simulation Modal */}
      {activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#FAF7F2] w-full max-w-md rounded-2xl shadow-2xl border border-brand-border overflow-hidden select-none animate-scale-up">
            
            {/* Paystack Branded Top bar */}
            <div className="bg-[#121A2C] p-4 text-white flex items-center justify-between border-b border-brand-border/10">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs font-bold tracking-widest text-emerald-400">
                  paystack SECURE GATEWAY
                </span>
              </div>
              <button
                onClick={() => setActivePayment(null)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer font-sans"
              >
                ✕
              </button>
            </div>

            {/* Simulated Checkout Frame */}
            <div className="p-6 space-y-6">
              
              {paymentStep === "gateway" ? (
                <>
                  {/* Ledger summary */}
                  <div className="bg-white p-4 rounded-xl border border-brand-border space-y-2">
                    <span className="text-[10px] font-mono uppercase text-brand-muted tracking-wider block">
                      Paying toward {activePayment.groupName}
                    </span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-brand-forest font-semibold">Standard Contribution</span>
                      <span className="font-bold text-sm text-brand-forest">
                        {formatCurrency(activePayment.amount)}
                      </span>
                    </div>
                    {activePayment.penalty > 0 && (
                      <div className="flex justify-between items-baseline pt-1 border-t border-brand-cream">
                        <span className="text-xs text-brand-clay font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-brand-clay" />
                          Late Delay Penalty Rate
                        </span>
                        <span className="font-bold text-sm text-brand-clay">
                          {formatCurrency(activePayment.penalty)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-brand-border pt-2 flex justify-between items-baseline font-bold text-lg text-brand-forest mt-2">
                      <span>Total Invoice</span>
                      <span className="text-brand-clay">
                        {formatCurrency(activePayment.amount + activePayment.penalty)}
                      </span>
                    </div>
                  </div>

                  {/* Channel selectors */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-brand-forest uppercase tracking-wider block">
                      Choose Simulated Paystack Channel
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentChannel("card")}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                          paymentChannel === "card"
                            ? "border-brand-clay bg-brand-clay/5 text-brand-clay"
                            : "border-brand-border bg-white text-brand-muted hover:border-brand-muted"
                        }`}
                      >
                        <CreditCard className="w-5 h-5 mb-1.5" />
                        <span className="text-[10px] font-bold">ATM Card</span>
                      </button>

                      <button
                        onClick={() => setPaymentChannel("bank_transfer")}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                          paymentChannel === "bank_transfer"
                            ? "border-brand-clay bg-brand-clay/5 text-brand-clay"
                            : "border-brand-border bg-white text-brand-muted hover:border-brand-muted"
                        }`}
                      >
                        <ArrowUpRight className="w-5 h-5 mb-1.5" />
                        <span className="text-[10px] font-bold">Transfer</span>
                      </button>

                      <button
                        onClick={() => setPaymentChannel("wallet")}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                          paymentChannel === "wallet"
                            ? "border-brand-clay bg-brand-clay/5 text-brand-clay"
                            : "border-brand-border bg-white text-brand-muted hover:border-brand-muted"
                        }`}
                      >
                        <Wallet className="w-5 h-5 mb-1.5" />
                        <span className="text-[10px] font-bold">Ajo Wallet</span>
                      </button>
                    </div>
                  </div>

                  {/* Channel specifics */}
                  {paymentChannel === "card" && (
                    <div className="space-y-3 p-4 bg-white rounded-xl border border-brand-border">
                      <div className="space-y-1">
                        <label className="text-[10px] text-brand-muted block">Simulated Card Details</label>
                        <div className="flex gap-2 items-center text-xs font-mono bg-brand-cream border border-brand-border p-2.5 rounded-lg text-brand-forest">
                          <span className="font-bold flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" /> SECURE MATCH
                          </span>
                          <span>••••  ••••  ••••  5678</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-brand-muted leading-relaxed">
                        Simulating direct tokenized debit. No real funds will be charged.
                      </p>
                    </div>
                  )}

                  {paymentChannel === "bank_transfer" && (
                    <div className="space-y-3 p-4 bg-white rounded-xl border border-brand-border">
                      <div>
                        <label className="text-[10px] text-brand-muted block">Simulating Bank Provider</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full text-xs font-medium border border-brand-border p-2 rounded-lg bg-brand-cream text-brand-forest outline-none mt-1"
                        >
                          <option value="GTBank">Guaranty Trust Bank</option>
                          <option value="Zenith">Zenith Bank Plc</option>
                          <option value="Kuda">Kuda Microfinance</option>
                          <option value="Access">Access Bank</option>
                        </select>
                      </div>
                      <div className="bg-brand-clay/5 border border-brand-clay/10 p-2 rounded-lg text-[10px] text-brand-clay font-medium leading-relaxed">
                        You can simulate instant bank response.
                      </div>
                    </div>
                  )}

                  {paymentChannel === "wallet" && (
                    <div className="p-4 bg-white rounded-xl border border-brand-border space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-brand-muted">Wallet Balance:</span>
                        <span className="font-bold text-brand-forest">{formatCurrency(user.walletBalance)}</span>
                      </div>
                      {user.walletBalance < activePayment.amount + activePayment.penalty ? (
                        <div className="text-[10px] text-red-500 font-bold border border-red-500/20 p-2 bg-red-500/5 rounded">
                          Insufficient wallet funds. Please fund your wallet first or choose card.
                        </div>
                      ) : (
                        <p className="text-[10px] text-emerald-600 font-medium">✓ Sufficient wallet balance available.</p>
                      )}
                    </div>
                  )}

                  {/* Simulated interactive network feedback */}
                  {isProcessing && (
                    <div className="bg-brand-forest/5 border border-brand-forest/15 p-3 rounded-xl space-y-2 text-[10px] animate-fade-in font-mono text-brand-forest">
                      <span className="font-semibold block uppercase text-[9px] text-brand-clay tracking-wider">🔒 Real-time Gateway Audit Trail</span>
                      <div className="space-y-1">
                        <p className={paystackSimStep >= 1 ? "text-brand-forest font-bold" : "text-brand-muted"}>
                          {paystackSimStep >= 1 ? "●" : "○"} [1/4] Triggering standard Paystack Popup frame...
                        </p>
                        <p className={paystackSimStep >= 2 ? "text-brand-forest font-bold" : "text-brand-muted"}>
                          {paystackSimStep >= 2 ? "● [Fallback] Popup handshakes blocked or delayed to server -> executing REDIRECT routing!" : "○ [2/4] Waiting for popup response..."}
                        </p>
                        <p className={paystackSimStep >= 3 ? "text-brand-forest font-bold" : "text-brand-muted"}>
                          {paystackSimStep >= 3 ? "● [System Node] Capturing backchannel Webhook event (charge.success) as sole status authority..." : "○ [3/4] Expecting live Webhook trigger..."}
                        </p>
                        <p className={paystackSimStep >= 4 ? "text-[#0F5132] font-bold" : "text-brand-muted"}>
                          {paystackSimStep >= 4 ? "● [Success] Payload verified! Committing block ledger entry in system logs safe..." : "○ [4/4] Writing cryptographically secured ledger block..."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Trigger simulated payment */}
                  <button
                    onClick={handleSimulatedPayment}
                    disabled={isProcessing || (paymentChannel === "wallet" && user.walletBalance < activePayment.amount + activePayment.penalty)}
                    className="w-full bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying Webhook Backchannel ...
                      </>
                    ) : (
                      <>Authorize Payment of {formatCurrency(activePayment.amount + activePayment.penalty)}</>
                    )}
                  </button>
                </>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-10 h-10 animate-scale-up" />
                  </div>
                  <div>
                    <h4 className="text-brand-forest font-display font-bold text-lg">
                      Payment Successful!
                    </h4>
                    <span className="text-[11px] font-mono text-brand-muted block mt-1">
                      Paystack Ref: PAY-{Math.floor(100000 + Math.random() * 900000)}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted max-w-xs mx-auto">
                    Your contribution of {formatCurrency(activePayment.amount + activePayment.penalty)} has been logged into the escrow pool securely.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
