/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  HelpCircle,
  Wallet,
  Settings,
  Sparkles,
  HeartHandshake
} from "lucide-react";
import { User, PlanTier } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onUpgradeClick: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, onUpgradeClick }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "groups", label: "My Circles (Ajo)", icon: Users },
    { id: "wallet", label: "Wallet & Cashout", icon: Wallet },
    { id: "kyc", label: "KYC Verification", icon: ShieldCheck },
    { id: "advisor", label: "Guru AI Coach", icon: HelpCircle },
    { id: "admin", label: "Platform Admin", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-brand-forest text-brand-cream flex-col justify-between border-r border-brand-forest/20 relative z-20 select-none">
      {/* Visual Yoruba Background Accent */}
      <div className="absolute inset-0 adire-accent opacity-5 pointer-events-none" />

      {/* Brand Header */}
      <div className="p-6 border-b border-brand-cream/10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-clay flex items-center justify-center shadow-lg transform rotate-3">
            <HeartHandshake className="w-6 h-6 text-brand-cream" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-brand-cream flex items-center gap-1.5">
              AjoVault
              <span className="text-brand-gold text-xs font-sans tracking-widest uppercase px-1 py-0.5 bg-brand-clay/30 rounded border border-brand-clay/50">
                TM
              </span>
            </h1>
            <p className="text-[10px] text-brand-gold font-sans uppercase tracking-[0.15em] font-medium leading-none mt-1">
              Rotational Trust
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto relative">
        <p className="text-[10px] text-brand-cream/40 font-mono tracking-widest uppercase font-bold pl-3 pb-2">
          Vault Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-brand-clay text-brand-cream font-semibold shadow-md translate-x-1"
                  : "text-brand-cream/80 hover:bg-brand-cream/10 hover:text-brand-cream"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-brand-cream" : "text-brand-gold"}`} />
              <span>{item.label}</span>
              {item.id === "advisor" && (
                <span className="ml-auto text-[9px] bg-brand-gold text-brand-forest font-bold px-1.5 py-0.5 rounded-full animate-pulse-slow">
                  Gemini
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Premium Status Panel */}
      <div className="p-4 border-t border-brand-cream/10 bg-black/10 relative">
        <div className="bg-brand-cream/5 rounded-xl p-3 border border-brand-cream/5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider font-medium text-brand-cream/60">
              {user.email}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-brand-cream/50 uppercase font-mono">Plan Level</span>
              <span className={`text-sm font-bold flex items-center gap-1 ${user.planTier !== PlanTier.FREE ? 'text-brand-gold' : 'text-brand-cream'}`}>
                {user.planTier === PlanTier.FREE && "Free Vault"}
                {user.planTier === PlanTier.BASIC && "Basic Pro"}
                {user.planTier === PlanTier.PRO && "Premium Pro"}
                {user.planTier === PlanTier.COOPERATIVE && "Cooperative"}
                {user.planTier !== PlanTier.FREE && <Sparkles className="w-3.5 h-3.5 text-brand-gold inline" />}
              </span>
            </div>

            {user.planTier === PlanTier.FREE && (
              <button
                onClick={onUpgradeClick}
                className="text-[10px] font-bold px-2 py-1 bg-brand-clay hover:bg-brand-clay/80 rounded border border-brand-clay text-brand-cream transition-colors duration-200 cursor-pointer"
              >
                UPGRADE
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
