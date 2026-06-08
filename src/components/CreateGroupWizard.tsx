/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  Users,
  Settings2,
  Sliders,
  Eye,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { SavingsGroup, ContributionFrequency, PayoutOrder, PlanTier, User } from "../types";

interface CreateGroupWizardProps {
  user: User;
  onLaunchGroup: (newGroup: Omit<SavingsGroup, "id" | "createdAt" | "currentRound">) => void;
  onCancel: () => void;
  onUpgradePrompt: () => void;
}

const COVER_PRESETS = [
  { url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=400", label: "Fintech Cash Flow" },
  { url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400", label: "Nigerian Markets" },
  { url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400", label: "Enterprise Growth" },
  { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400", label: "Cooperative Hands" }
];

export default function CreateGroupWizard({
  user,
  onLaunchGroup,
  onCancel,
  onUpgradePrompt,
}: CreateGroupWizardProps) {
  const [step, setStep] = useState(1);

  // Step 1: Basics
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);

  // Step 2: Core Rules
  const [amount, setAmount] = useState(25000);
  const [frequency, setFrequency] = useState<ContributionFrequency>(ContributionFrequency.WEEKLY);
  const [payoutOrder, setPayoutOrder] = useState<PayoutOrder>(PayoutOrder.FIXED);
  const [maxMembers, setMaxMembers] = useState(6);

  // Step 3: Advanced settings
  const [kycRequired, setKycRequired] = useState(true);
  const [penaltyRate, setPenaltyRate] = useState(0.05); // 5% default
  const [gracePeriod, setGracePeriod] = useState(24); // 24h
  const [isPrivate, setIsPrivate] = useState(false);
  const [rules, setRules] = useState("1. Pay promptly.\n2. Respect your slot allocation.\n3. Late fees are applied strictly after grace hours.");

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amt);
  };

  // Up-sell block check
  const isSelectedOrderAllowed = () => {
    if (payoutOrder === PayoutOrder.BIDDING && user.planTier === PlanTier.FREE) {
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;
    if (step === 2 && !isSelectedOrderAllowed()) {
      onUpgradePrompt();
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = () => {
    // Generate secure randomized invite code
    const inviteCode = `${name.replace(/\s+/g, "-").substring(0, 7).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    
    onLaunchGroup({
      name,
      description,
      adminId: user.id,
      status: "FORMING" as any,
      contributionAmount: amount,
      currency: "NGN",
      frequency,
      payoutOrder,
      maxMembers,
      totalRounds: maxMembers,
      isPrivate,
      penaltyRate,
      gracePeriodHours: gracePeriod,
      rules,
      coverImageUrl: coverImage,
      inviteCode,
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-brand-border shadow-md overflow-hidden animate-fade-in relative z-10 select-none">
      
      {/* Wizard Progress bar Indicator */}
      <div className="bg-brand-cream border-b border-brand-border p-4 flex justify-between items-center text-xs text-brand-muted">
        <div className="flex items-center gap-2">
          <span className="font-bold text-brand-forest">Step {step} of 4</span>
          <span className="h-1 w-12 bg-brand-border rounded-full overflow-hidden block">
            <div className="bg-brand-clay h-full" style={{ width: `${(step / 4) * 100}%` }} />
          </span>
        </div>

        <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
          {step === 1 && "Circle Foundation"}
          {step === 2 && "Rotation Parameters"}
          {step === 3 && "Advanced Trust Laws"}
          {step === 4 && "Circle Preview Verification"}
        </span>

        <button onClick={onCancel} className="text-brand-muted hover:text-brand-clay font-bold cursor-pointer">
          ✕ Cancel
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6">

        {/* STEP 1: BASICS */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-forest uppercase tracking-wider block">
                Circle Savings Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lagos Techies Ajo Circle, Benin Traders Esusu"
                className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg bg-brand-cream text-brand-forest placeholder:text-brand-muted/70 outline-none focus:border-brand-clay"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-forest uppercase tracking-wider block">
                Circle Context Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex. Mutual rotational savings circle amongst trustworthy software engineers in Ikeja area ..."
                className="w-full p-3 text-xs border border-brand-border rounded-lg bg-brand-cream text-brand-forest placeholder:text-brand-muted/70 outline-none focus:border-brand-clay resize-none"
              />
            </div>

            {/* Presets Header */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-brand-forest uppercase tracking-wider block">
                Select Cover Canvas theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COVER_PRESETS.map((p) => (
                  <button
                    key={p.url}
                    onClick={() => setCoverImage(p.url)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      coverImage === p.url ? "border-brand-clay scale-[1.02]" : "border-transparent opacity-83"
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white p-1 text-center font-bold">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CORE RULES */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Core NGN Contribution selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-forest uppercase tracking-wider block">
                  Contribution amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-brand-forest">₦</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full border border-brand-border rounded-lg py-2 pl-7 pr-3 bg-brand-cream text-brand-forest text-xs font-bold outline-none"
                  />
                </div>
                <span className="text-[10px] text-brand-muted">Target price in NGN</span>
              </div>

              {/* Frequencies */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-forest uppercase tracking-wider block">
                  Frequency Cycle
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full text-xs font-medium border border-brand-border p-2 rounded-lg bg-brand-cream text-brand-forest outline-none"
                >
                  <option value={ContributionFrequency.DAILY}>Daily Cycle</option>
                  <option value={ContributionFrequency.WEEKLY}>Weekly Cycle</option>
                  <option value={ContributionFrequency.BIWEEKLY}>Biweekly Cycle</option>
                  <option value={ContributionFrequency.MONTHLY}>Monthly Cycle</option>
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Max Members slots */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F4B35] uppercase tracking-wider block">
                  Membership Spot limit (3 - 12)
                </label>
                <input
                  type="range"
                  min={3}
                  max={12}
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(Number(e.target.value))}
                  className="w-full accent-brand-clay cursor-ew-resize py-2"
                />
                <div className="flex justify-between text-[11px] font-bold text-brand-forest">
                  <span>3 Slots</span>
                  <span className="text-brand-clay">{maxMembers} Members Slots</span>
                  <span>12 Slots</span>
                </div>
              </div>

              {/* Rotational Selection Order */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F4B35] uppercase tracking-wider block">
                  Rotational selector
                </label>
                <select
                  value={payoutOrder}
                  onChange={(e) => setPayoutOrder(e.target.value as any)}
                  className="w-full text-xs font-medium border border-brand-border p-2 rounded-lg bg-brand-cream text-brand-forest outline-none"
                >
                  <option value={PayoutOrder.FIXED}>Fixed Order (Admin Assigns)</option>
                  <option value={PayoutOrder.RANDOM}>Random Shuffle (Recommended)</option>
                  <option value={PayoutOrder.BIDDING}>Rotational Bidding [Upgrade Premium]</option>
                </select>
                
                {/* Premium upsell badge */}
                {payoutOrder === PayoutOrder.BIDDING && user.planTier === PlanTier.FREE && (
                  <div className="text-[10px] text-brand-clay font-bold border border-brand-clay/20 p-2 bg-brand-clay/5 rounded mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Your plan tier is **Free**. Upgrading to Basic Pro/Premium Pro is required to configure bidding.</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: ADVANCED PENALTIES AND TRUST LOCK */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Late Penalty Sliders */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-forest uppercase tracking-wider block">
                  Late Delay Penalty rate (0% - 20%)
                </label>
                <input
                  type="range"
                  min={0.0}
                  max={0.20}
                  step={0.01}
                  value={penaltyRate}
                  onChange={(e) => setPenaltyRate(Number(e.target.value))}
                  className="w-full accent-brand-clay cursor-ew-resize py-2"
                />
                <div className="flex justify-between text-[10px] font-bold text-brand-forest">
                  <span>No Penalty</span>
                  <span className="text-brand-clay">{(penaltyRate * 100)}% Late fee</span>
                  <span>20% Fee</span>
                </div>
              </div>

              {/* Grace hour select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-forest uppercase tracking-wider block">
                  Grace Settlement hours
                </label>
                <select
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(Number(e.target.value))}
                  className="w-full text-xs font-medium border border-brand-border p-2 rounded-lg bg-brand-cream text-brand-forest outline-none"
                >
                  <option value={12}>12 Hours (Aggressive)</option>
                  <option value={24}>24 Hours Standard</option>
                  <option value={48}>48 Hours Lenient</option>
                  <option value={72}>72 Hours Extrawide</option>
                </select>
              </div>

            </div>

            {/* KYC Checkbox */}
            <div className="flex items-center gap-3 p-3 bg-brand-cream rounded-xl border border-brand-border text-xs">
              <input
                type="checkbox"
                id="kycToggle"
                checked={kycRequired}
                onChange={(e) => setKycRequired(e.target.checked)}
                className="w-4 h-4 accent-brand-forest"
              />
              <label htmlFor="kycToggle" className="font-semibold text-brand-forest cursor-pointer select-none">
                Require Verified KYC profile status for all participating members
              </label>
            </div>

            {/* Circle rules markdown input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-forest uppercase tracking-wider block">
                Custom Circle Laws / Rules (Markdown formatted)
              </label>
              <textarea
                rows={3}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="w-full p-2.5 text-xs text-brand-forest border border-brand-border rounded-lg bg-brand-cream outline-none focus:border-brand-clay"
              />
            </div>
          </div>
        )}

        {/* STEP 4: PREVIEW & LAUNCH TICKET */}
        {step === 4 && (
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-brand-forest text-center uppercase tracking-wider block">
              Confirm Circular Parameters Ticket
            </h4>

            {/* Visual invitation ticket */}
            <div className="relative border-2 border-brand-clay/35 rounded-2xl p-6 bg-brand-cream shadow-inner space-y-4">
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-brand-clay text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                DRAFT SECURED
              </div>

              <div className="border-b border-dashed border-brand-border pb-4 space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-brand-clay font-bold block">AJOVAULT ROTATIONAL TRUST INC.</span>
                <h3 className="font-display font-bold text-brand-forest text-lg">{name || "Ajo Circle Draft"}</h3>
                <p className="text-xs italic text-brand-muted truncate max-w-md">{description || "No context given"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-brand-muted text-[10px] block uppercase">INDIVIDUAL CONTRIBUTION</span>
                  <span className="font-bold text-brand-forest">{formatCurrency(amount)}</span>
                </div>
                <div>
                  <span className="text-brand-muted text-[10px] block uppercase">ROTATIONAL FREQUENCY</span>
                  <span className="font-bold text-brand-forest uppercase">{frequency} cycles</span>
                </div>
                <div>
                  <span className="text-brand-muted text-[10px] block uppercase">ROUND TOTAL CAPACITY</span>
                  <span className="font-bold text-brand-clay">
                    {formatCurrency(amount * maxMembers)} pool allocation
                  </span>
                </div>
                <div>
                  <span className="text-brand-muted text-[10px] block uppercase">MUTUAL SPOT CAPACITY</span>
                  <span className="font-bold text-brand-forest">{maxMembers} Recruits</span>
                </div>
              </div>

              <div className="border-t border-brand-border/40 pt-4 text-xs space-y-1 bg-black/5 p-3 rounded-lg">
                <span className="text-[10px] font-semibold text-[#1F4B35] block">CO-OP MANDATES SUMMARY</span>
                <p className="text-brand-muted text-[10px] leading-relaxed">
                  KYC requirement sets **{kycRequired ? "ENABLED" : "DISABLED"}**. Outstanding collections sliding penalty rate is locked at **{(penaltyRate * 100)}%** after **{gracePeriod} hours** grace hours.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation Buttons */}
      <div className="bg-brand-cream border-t border-brand-border p-4 flex justify-between items-center select-none">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-brand-forest font-semibold text-xs py-2 px-4 hover:bg-brand-cream rounded-xl border border-brand-border transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5 shrink-0" />
            Previous Step
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-brand-muted font-semibold text-xs py-2 px-4 hover:bg-brand-cream rounded-xl transition-all cursor-pointer"
          >
            Cancel Draft
          </button>
        )}

        {step < 4 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-brand-forest text-brand-cream hover:bg-brand-forest/90 font-bold text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Continue Step
            <ArrowRight className="w-4.5 h-4.5 shrink-0 text-brand-gold" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="bg-brand-clay text-brand-cream hover:bg-brand-clay/90 font-bold text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 animate-pulse-slow"
          >
            <Check className="w-4.5 h-4.5 shrink-0" />
            Launch Savings Circle
          </button>
        )}
      </div>

    </div>
  );
}
