/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  TrendingUp,
  Sliders,
  DollarSign,
  Briefcase,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Lightbulb,
  XCircle,
  XSquare,
  Activity
} from "lucide-react";
import { Dispute, User, SavingsGroup, DisputeStatus, GroupStatus, PlanTier, AuditLog } from "../types";

interface AdminPanelProps {
  disputes: Dispute[];
  groups: SavingsGroup[];
  allPeople: { id: string; name: string; avatar: string }[];
  onResolveDispute: (disputeId: string, resolution: string) => void;
  onUpdateUserTrust: (userId: string, newScore: number) => void;
  onUpdateGroupStatus: (groupId: string, newStatus: GroupStatus) => void;
  auditLogs: AuditLog[];
}

export default function AdminPanel({
  disputes,
  groups,
  allPeople,
  onResolveDispute,
  onUpdateUserTrust,
  onUpdateGroupStatus,
  auditLogs,
}: AdminPanelProps) {
  const [adminView, setAdminView] = useState<"disputes" | "users" | "groups" | "revenue" | "auditLogs">("disputes");
  const [activeResolutionId, setActiveResolutionId] = useState<string | null>(null);
  const [writtenResolution, setWrittenResolution] = useState("");

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amt);
  };

  const handleResolveSubmit = (e: FormEvent, disputeId: string) => {
    e.preventDefault();
    if (!writtenResolution.trim()) return;

    onResolveDispute(disputeId, writtenResolution);
    setWrittenResolution("");
    setActiveResolutionId(null);
  };

  // Aggregated Stats
  const totalProcessedVolume = groups.reduce((sum, g) => sum + (g.contributionAmount * g.maxMembers * g.currentRound), 0);
  const totalEscrowFeesAccrued = totalProcessedVolume * 0.015;

  return (
    <div className="space-y-6 animate-fade-in relative z-10 select-none">
      
      {/* Admin header */}
      <div className="flex justify-between items-center bg-[#121A2C] text-brand-cream p-5 rounded-2xl shadow border border-brand-border/10">
        <div className="space-y-1">
          <span className="text-[9px] tracking-widest font-mono text-brand-gold uppercase block">AJOVAULT CENTRAL AUDIT CORE</span>
          <h2 className="text-xl md:text-2xl font-display font-medium text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-gold" />
            Platform Operations Panel
          </h2>
        </div>

        <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
          SuperAdmin
        </span>
      </div>

      {/* Grid operational stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Processed */}
        <div className="bg-white p-4 rounded-xl border border-brand-border">
          <span className="text-[10px] uppercase text-brand-muted tracking-wider block">Total Volume Circulated</span>
          <span className="text-lg font-bold text-brand-forest block mt-1">{formatCurrency(totalProcessedVolume || 1800000)}</span>
          <span className="text-[9px] text-emerald-600 font-medium block mt-1 flex items-center gap-0.5">
            + 14.2% MTD <Activity className="w-3 h-3" />
          </span>
        </div>

        {/* Accumulated Escrow Earnings */}
        <div className="bg-white p-4 rounded-xl border border-brand-border">
          <span className="text-[10px] uppercase text-brand-muted tracking-wider block">Accumulated Co-op Fee</span>
          <span className="text-lg font-bold text-brand-forest block mt-1">{formatCurrency(totalEscrowFeesAccrued || 27000)}</span>
          <span className="text-[9px] text-brand-muted block mt-1">1.5% Platform levy rate</span>
        </div>

        {/* Total Groups platform */}
        <div className="bg-white p-4 rounded-xl border border-brand-border">
          <span className="text-[10px] uppercase text-brand-muted tracking-wider block">Regulated Circles</span>
          <span className="text-lg font-bold text-brand-forest block mt-1">{groups.length} active circles</span>
          <span className="text-[9px] text-brand-muted block mt-1">Free & Pro tiers active</span>
        </div>

        {/* Outstanding disputes */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E0D5]">
          <span className="text-[10px] uppercase text-brand-muted tracking-wider block">Open Disputes</span>
          <span className={`text-lg font-bold block mt-1 ${disputes.length > 0 ? "text-brand-clay font-extrabold animate-pulse" : "text-brand-forest"}`}>
            {disputes.filter(d => d.status === DisputeStatus.OPEN).length} pending audit
          </span>
          <span className="text-[9px] text-brand-muted block mt-1">Mediation queue</span>
        </div>

      </div>

      {/* Sub tabs navigation */}
      <div className="flex border-b border-brand-border">
        {([
          { id: "disputes", label: "Disputes queue" },
          { id: "users", label: "User directory" },
          { id: "groups", label: "Regulated Circles" },
          { id: "auditLogs", label: "🔒 System Audit Logs" }
        ] as const).map((sub) => (
          <button
            key={sub.id}
            onClick={() => setAdminView(sub.id)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 capitalize transition-all cursor-pointer ${
              adminView === sub.id
                ? "border-brand-clay text-brand-clay font-bold"
                : "border-transparent text-brand-muted hover:text-brand-forest"
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* TABLES VIEWPORTS */}

      {/* SUB 1: DISPUTES QUEUE */}
      {adminView === "disputes" && (
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-xl border border-brand-border text-brand-muted italic">
              No disputes awaiting mediation. Platform operations are peaceful!
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map((dispute) => (
                <div key={dispute.id} className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-cream pb-3 text-xs">
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold text-brand-clay bg-brand-clay/15 px-2 py-0.5 rounded">
                        Audit ID #{dispute.id} · Category: {dispute.category.replace("_", " ")}
                      </span>
                      <h4 className="font-display font-medium text-brand-forest mt-1.5 text-sm">
                        Group Circle: {dispute.groupName}
                      </h4>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className={`px-2 py-0.5 text-[9px] font-mono rounded border ${
                        dispute.status === DisputeStatus.OPEN
                          ? "bg-red-500/5 text-red-500 border-red-500/10 font-bold"
                          : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                      }`}>
                        {dispute.status}
                      </span>
                      <span className="text-[10px] text-brand-muted block mt-1">
                        Reported on {new Date(dispute.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="text-brand-muted font-bold">Reported Incident Description:</span>
                    <p className="text-brand-forest leading-relaxed bg-brand-cream/40 p-3 rounded-lg border border-brand-cream text-xs">
                      {dispute.description}
                    </p>
                  </div>

                  {dispute.status === DisputeStatus.OPEN ? (
                    <div>
                      {activeResolutionId === dispute.id ? (
                        <form onSubmit={(e) => handleResolveSubmit(e, dispute.id)} className="space-y-2.5">
                          <textarea
                            required
                            rows={3}
                            value={writtenResolution}
                            onChange={(e) => setWrittenResolution(e.target.value)}
                            placeholder="Input written legal resolution directive. e.g. 'Audited paystack slips verified. Penalty waived and payout advanced manually...'"
                            className="w-full text-xs p-3 border border-brand-border bg-brand-cream text-brand-forest rounded-xl outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="bg-brand-forest text-brand-cream hover:bg-brand-forest/90 font-bold text-xs py-1.5 px-3 rounded-lg cursor-pointer shadow"
                            >
                              Publish Resolution
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveResolutionId(null)}
                              className="text-brand-muted text-xs py-1.5 px-3 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveResolutionId(dispute.id);
                            setWrittenResolution(`Audited platform micro-ledgers. Decided that Olumide Adebayo missed monthly gari rotation slot #4 due to payment network disturbances. Applying manual waiver on penalty fee. advancing payout index monthly circle to spot #5.`);
                          }}
                          className="bg-brand-clay hover:bg-brand-clay/90 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer shadow"
                        >
                          Resolve Dispute
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-emerald-800 tracking-wider font-mono">PUBLISHED OFFICIAL RESOLUTION</span>
                      <p className="italic text-brand-forest leading-relaxed">
                        &ldquo;{dispute.resolution}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB 2: USER DIRECTORY */}
      {adminView === "users" && (
        <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden text-xs overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-brand-cream text-brand-muted text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Reputation (Trust)</th>
                <th className="p-4">Verify Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream">
              {allPeople.map((person) => {
                const currentTrust = person.id === "user-1" ? 98 : person.id === "user-3" ? 100 : 85; 
                return (
                  <tr key={person.id} className="hover:bg-brand-cream/10">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img src={person.avatar} alt={person.name} className="w-8 h-8 rounded-full border border-brand-border object-cover" />
                        <span className="font-bold text-brand-forest">{person.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-brand-muted font-mono">{person.id === "user-1" ? "iyanuolalegan@gmail.com" : `${person.name.toLowerCase().replace(/\s+/g, "")}@ajovault.net`}</td>
                    <td className="p-4 font-mono font-bold text-brand-forest">
                      {currentTrust}%
                    </td>
                    <td className="p-4 text-left">
                      <button
                        onClick={() => onUpdateUserTrust(person.id, Math.min(currentTrust + 5, 100))}
                        className="bg-brand-cream border border-brand-border hover:border-brand-clay text-brand-forest font-bold px-2.5 py-1 rounded cursor-pointer mr-2"
                      >
                        Increase Score (+5)
                      </button>
                      <button
                        onClick={() => onUpdateUserTrust(person.id, Math.max(currentTrust - 10, 0))}
                        className="bg-red-500/5 border border-red-500/10 hover:border-red-500 text-red-500 text-[11px] font-bold px-2.5 py-1 rounded cursor-pointer"
                      >
                        Deduct (-10)
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB 3: REGULATED GROUPS SYSTEM */}
      {adminView === "groups" && (
        <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden text-xs overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-brand-cream text-brand-muted text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Ajo Savings Circle</th>
                <th className="p-4">Parameters</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream">
              {groups.map((g) => (
                <tr key={g.id} className="hover:bg-brand-cream/10">
                  <td className="p-4 font-bold text-brand-forest">{g.name}</td>
                  <td className="p-4 text-brand-muted leading-relaxed font-mono">
                    {formatCurrency(g.contributionAmount)} · {g.frequency} · {g.maxMembers} spaces
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[9px] font-mono rounded uppercase border ${
                      g.status === GroupStatus.ACTIVE
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                        : "bg-brand-gold/15 text-brand-gold border-brand-gold/25"
                    }`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {g.status === GroupStatus.ACTIVE ? (
                      <button
                        onClick={() => onUpdateGroupStatus(g.id, GroupStatus.PAUSED)}
                        className="bg-amber-600/10 border border-amber-600/15 text-amber-600 font-bold px-2.5 py-1 rounded cursor-pointer"
                      >
                        Pause Circle
                      </button>
                    ) : g.status === GroupStatus.PAUSED ? (
                      <button
                        onClick={() => onUpdateGroupStatus(g.id, GroupStatus.ACTIVE)}
                        className="bg-brand-forest text-brand-cream hover:bg-brand-forest/90 font-bold px-2.5 py-1 rounded cursor-pointer"
                      >
                        Resume Circle
                      </button>
                    ) : (
                      <span className="text-brand-muted font-serif">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB 4: SYSTEM AUDIT LOGS */}
      {adminView === "auditLogs" && (
        <div className="bg-white rounded-xl border border-brand-border shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-brand-cream pb-3">
            <div>
              <h3 className="font-display font-medium text-brand-forest text-sm uppercase tracking-wider">🔒 Immutable Ledger Stream</h3>
              <p className="text-[11px] text-brand-muted">AjoVault system-wide compliance, regulatory, and payment audit logs</p>
            </div>
            <span className="text-[10px] bg-brand-cream px-2 py-1 rounded font-mono font-bold text-brand-muted border border-brand-border">
              {auditLogs.length} Records Confirmed
            </span>
          </div>

          <div className="divide-y divide-brand-cream overflow-hidden">
            {auditLogs.map((log) => {
              const getActionColor = (action: string) => {
                switch (action) {
                  case "CONTRIBUTION_PAID": return "bg-emerald-500/10 text-emerald-800 border-emerald-500/20";
                  case "PAYOUT_SENT": return "bg-blue-500/10 text-blue-800 border-blue-500/10";
                  case "ROUND_ADVANCED": return "bg-purple-500/10 text-purple-800 border-purple-500/10";
                  case "GROUP_CREATED": return "bg-brand-clay/10 text-brand-clay border-brand-clay/10 font-bold";
                  case "GROUP_STARTED": return "bg-[#1F4B35]/10 text-[#1F4B35] border-[#1F4B35]/10 font-black";
                  default: return "bg-brand-muted/10 text-brand-muted border-transparent";
                }
              };

              return (
                <div key={log.id} className="py-3.5 space-y-1.5 hover:bg-brand-cream/5 ps-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-mono rounded border font-semibold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-brand-muted font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    {log.reference && (
                      <span className="text-[9px] font-mono text-brand-clay bg-brand-clay/5 px-2 py-0.5 border border-brand-clay/10">
                        REF: {log.reference}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-forest font-sans leading-relaxed">{log.details}</p>
                  <div className="flex items-center gap-4 text-[10px] text-brand-muted font-mono">
                    <span>Operator: <span className="text-brand-forest font-semibold">{log.operator}</span></span>
                    {log.groupName && (
                      <span>Circle: <span className="text-brand-forest font-semibold">{log.groupName}</span></span>
                    )}
                    {typeof log.roundNumber === "number" && log.roundNumber > 0 && (
                      <span>Round: <span className="text-brand-forest font-semibold">{log.roundNumber}</span></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
