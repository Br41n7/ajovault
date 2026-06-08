import React, { useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  Coins,
  Users,
  Scale,
  Lock,
  ArrowRight,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Database,
  Calculator,
  UserCheck
} from "lucide-react";
import { User, KYCStatus, PlanTier, UserRole } from "../types";

interface LandingPageProps {
  onLogin: (user: User) => void;
  onShowToast: (message: string, type: "success" | "info" | "warning") => void;
}

export default function LandingPage({ onLogin, onShowToast }: LandingPageProps) {
  const [authMode, setAuthMode] = useState<"view" | "login" | "register">("view");
  
  // Registration Form State
  const [regEmail, setRegEmail] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regBvn, setRegBvn] = useState("");
  const [regNin, setRegNin] = useState("");
  const [regTier, setRegTier] = useState<PlanTier>(PlanTier.FREE);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");

  // Live rotating savings calculator state
  const [calcContribution, setCalcContribution] = useState<number>(50000);
  const [calcFrequency, setCalcFrequency] = useState<"MONTHLY" | "WEEKLY">("MONTHLY");
  const [calcMembers, setCalcMembers] = useState<number>(6);

  // Calculate live estimates
  const totalCircleVolume = calcContribution * calcMembers;
  const estimatedPlatformFee = totalCircleVolume * (regTier === PlanTier.PRO ? 0.01 : 0.015);
  const estimatedNetPayout = totalCircleVolume - estimatedPlatformFee;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regFirstName || !regLastName || !regPhone) {
      onShowToast("Please populate all required directory fields to proceed.", "warning");
      return;
    }

    if (regBvn && regBvn.length !== 11) {
      onShowToast("Nigerian Bank Verification Number (BVN) must be exactly 11 digits.", "warning");
      return;
    }

    // Design-led custom participant injection
    const customUser: User = {
      id: `user-${Date.now()}`,
      email: regEmail.trim(),
      phone: regPhone.trim(),
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      displayName: `${regFirstName.trim()} ${regLastName.trim().charAt(0)}.`,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&q=80&w=200`,
      role: UserRole.MEMBER,
      kycStatus: regBvn && regNin ? KYCStatus.VERIFIED : KYCStatus.PENDING,
      isActive: true,
      timezone: "Africa/Lagos",
      planTier: regTier,
      walletBalance: 15000, // starting gift
      currency: "NGN",
      trustScore: regBvn ? 95 : 75,
      joinedAt: new Date().toISOString()
    };

    onShowToast(`Onboarding Success! Welcome ${customUser.firstName} to AjoVault.`, "success");
    onLogin(customUser);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      onShowToast("Please enter an authorized email address to login.", "warning");
      return;
    }

    // Try finding matching prepopulated user or create a session mockup
    const normalized = loginEmail.trim().toLowerCase();
    
    // Check if the email corresponds to one of our special ones
    if (normalized === "iyanuolalegan@gmail.com" || normalized === "iyanu") {
      const targetUser: User = {
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
      onShowToast("Logged in as Circle Administrator", "success");
      onLogin(targetUser);
      return;
    }

    if (normalized === "chinedu@example.com" || normalized === "chinedu") {
      const targetUser: User = {
        id: "user-2",
        email: "chinedu@example.com",
        phone: "2348033456123",
        firstName: "Chinedu",
        lastName: "Okafor",
        displayName: "Chinedu O.",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
        role: UserRole.MEMBER,
        kycStatus: KYCStatus.VERIFIED,
        isActive: true,
        timezone: "Africa/Lagos",
        planTier: PlanTier.FREE,
        walletBalance: 65000,
        currency: "NGN",
        trustScore: 95,
        joinedAt: "2026-02-10T08:30:00Z"
      };
      onShowToast("Logged in successfully as Chinedu Okafor", "success");
      onLogin(targetUser);
      return;
    }

    if (normalized === "fatima@example.com" || normalized === "fatima") {
      const targetUser: User = {
        id: "user-3",
        email: "fatima@example.com",
        phone: "2348057213894",
        firstName: "Fatima",
        lastName: "Bello",
        displayName: "Fatima B.",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        role: UserRole.MEMBER,
        kycStatus: KYCStatus.VERIFIED,
        isActive: true,
        timezone: "Africa/Lagos",
        planTier: PlanTier.PRO,
        walletBalance: 120000,
        currency: "NGN",
        trustScore: 100,
        joinedAt: "2026-03-01T12:00:00Z"
      };
      onShowToast("Logged in successfully as Fatima Bello", "success");
      onLogin(targetUser);
      return;
    }

    // Default Custom Mock session
    const genericUser: User = {
      id: `user-${Date.now()}`,
      email: normalized,
      phone: "2348109988776",
      firstName: normalized.split("@")[0] || "Ajo",
      lastName: "Partner",
      displayName: normalized.split("@")[0] || "Ajo Partner",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      role: UserRole.MEMBER,
      kycStatus: KYCStatus.PENDING,
      isActive: true,
      timezone: "Africa/Lagos",
      planTier: PlanTier.FREE,
      walletBalance: 10000,
      currency: "NGN",
      trustScore: 80,
      joinedAt: new Date().toISOString()
    };

    onShowToast(`Logged in under new sandbox session: ${genericUser.displayName}`, "info");
    onLogin(genericUser);
  };

  const handleQuickLogin = (email: string) => {
    setLoginEmail(email);
    // Auto-trigger direct session logic
    if (email.includes("iyanu")) {
      handleLoginSubmit({ preventDefault: () => {} } as any);
    } else {
      setLoginEmail(email);
      setAuthMode("login");
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink flex flex-col justify-between relative overflow-x-hidden font-sans">
      
      {/* Visual Traditional Fabric Accent Lines background */}
      <div className="absolute inset-0 adire-grid opacity-[0.05] pointer-events-none" />

      {/* Decorative colored radial blurs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-brand-forest/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 right-10 w-[450px] h-[450px] bg-brand-clay/5 rounded-full blur-3xl pointer-events-none" />

      {/* Primary Sticky Header */}
      <header className="relative z-20 h-20 border-b border-brand-border/60 bg-brand-cream/80 backdrop-blur-md px-6 md:px-12 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#1F4B35] flex items-center justify-center shadow-lg transform rotate-3">
            <HeartHandshake className="w-6 h-6 text-brand-cream" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-brand-forest">
              AjoVault
            </h1>
            <p className="text-[9px] text-[#C1440E] font-mono uppercase tracking-[0.15em] font-bold leading-none">
              Rotational Trust Protocol
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 font-semibold text-xs text-brand-muted">
          <a href="#features" className="hover:text-brand-forest transition-colors">Trust Ecosystem</a>
          <a href="#how-it-works" className="hover:text-brand-forest transition-colors">Cooperative structures</a>
          <a href="#audits" className="hover:text-brand-forest transition-colors">Statutory Security</a>
          <a href="#estimator" className="hover:text-brand-forest transition-colors">Esusu Estimator</a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAuthMode("login")}
            className="px-4 py-2 text-xs font-bold text-brand-forest hover:bg-brand-forest/5 rounded-xl transition-all cursor-pointer min-h-[40px]"
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode("register")}
            className="px-4 py-2 text-xs font-bold bg-brand-clay text-brand-cream hover:bg-brand-clay/90 rounded-xl transition-all shadow-md cursor-pointer min-h-[40px] flex items-center gap-1.5"
          >
            Launch Vault <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container Core switch block */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 md:px-12 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {authMode === "view" ? (
          <>
            {/* LEFT HERO PANEL (7 columns on desktop) */}
            <div className="lg:col-span-7 space-y-6 md:space-y-8 animate-fade-in text-left">
              
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-forest/10 rounded-full text-[10px] font-mono uppercase tracking-widest font-black text-brand-forest border border-brand-forest/20">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-spin-slow" />
                  Nigerian FinTech rotational co-op
                </span>

                <h2 className="text-display font-display font-semibold text-brand-forest leading-[1.1] tracking-tight">
                  Guaranteed Rotational Trust.<br />
                  <span className="text-brand-clay">Smart Adashe & Esusu</span><br />
                  for Modern Africa.
                </h2>

                <p className="text-sm md:text-base text-brand-muted font-sans leading-relaxed max-w-xl">
                  AjoVault digitizes traditional community savings associations with real-time trust ledger streams, cryptographic KYC compliance audits, instant wallet disbursements, and transparent dispute resolutions. Build capital collaboratively—secured by math.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setAuthMode("register")}
                  className="px-6 py-3.5 bg-[#1F4B35] text-brand-cream hover:bg-[#1F4B35]/95 text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                >
                  Create Your Free Account <ArrowRight className="w-4 h-4 text-brand-gold" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("estimator");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3.5 bg-white border border-brand-border text-brand-forest hover:border-brand-forest/30 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer text-center"
                >
                  Estimate Cyclic Yield
                </button>
              </div>

              {/* Micro Metrics row validation */}
              <div className="grid grid-cols-3 gap-4 border-t border-brand-border/60 pt-6 max-w-lg font-mono text-[11px]">
                <div className="space-y-1">
                  <span className="text-brand-muted block font-sans">CIRCULAR VOLUME</span>
                  <p className="text-sm font-bold text-brand-forest">₦45,000,000+</p>
                  <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    ▲ 11% This Month
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-brand-muted block font-sans">METRIC CIRCLES</span>
                  <p className="text-sm font-bold text-brand-forest">350+ Secured</p>
                  <span className="text-[9px] text-brand-muted">Fully Audited</span>
                </div>
                <div className="space-y-1">
                  <span className="text-brand-muted block font-sans">REPUTATION INDEX</span>
                  <p className="text-sm font-bold text-brand-clay">99.2% Trust</p>
                  <span className="text-[9px] text-brand-gold font-semibold flex items-center gap-0.5">
                    ★ Zero Capital Losses
                  </span>
                </div>
              </div>

            </div>

            {/* RIGHT PROMO ESTIMATOR / QUICK ACTION PANEL (5 columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Interactive estimator box */}
              <div id="estimator" className="bg-white rounded-2xl border border-brand-border p-5 md:p-6 shadow-xl space-y-4 text-left animate-scale-up">
                <div className="flex justify-between items-center border-b border-brand-cream pb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-brand-clay" />
                    <div>
                      <h3 className="font-display font-semibold text-brand-forest text-sm">Circular Savings Estimator</h3>
                      <p className="text-[10px] text-brand-muted">Calculate rotation pool disbursements</p>
                    </div>
                  </div>
                  <span className="text-[8px] bg-brand-forest/5 text-brand-forest px-2 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase border border-brand-forest/10">
                    Live Rates
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Contribution Slider input */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <label className="text-brand-forest">Contribute Per Round</label>
                      <span className="text-brand-clay font-mono">₦{calcContribution.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={5000}
                      max={250000}
                      step={5000}
                      value={calcContribution}
                      onChange={(e) => setCalcContribution(Number(e.target.value))}
                      className="w-full accent-[#C1440E] bg-brand-cream rounded-lg h-2 appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-brand-muted font-mono">
                      <span>₦5k</span>
                      <span>₦100k</span>
                      <span>₦250k</span>
                    </div>
                  </div>

                  {/* Frequency Toggle and Members Count in single row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-brand-forest block">Frequency Interval</label>
                      <select
                        value={calcFrequency}
                        onChange={(e) => setCalcFrequency(e.target.value as any)}
                        className="w-full bg-brand-cream border border-brand-border rounded-lg p-2 font-mono text-xs focus:ring-1 focus:ring-brand-clay text-brand-forest focus:outline-none"
                      >
                        <option value="WEEKLY">Weekly Rotations</option>
                        <option value="MONTHLY">Monthly Rotations</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-brand-forest block">Members Count</label>
                      <select
                        value={calcMembers}
                        onChange={(e) => setCalcMembers(Number(e.target.value))}
                        className="w-full bg-brand-cream border border-brand-border rounded-lg p-2 font-mono text-xs focus:ring-1 focus:ring-brand-clay text-brand-forest focus:outline-none"
                      >
                        {[3, 4, 5, 6, 8, 10, 12].map((num) => (
                          <option key={num} value={num}>{num} Slots</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calculations breakdown banner */}
                  <div className="bg-brand-cream/80 border border-brand-border p-4 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-brand-muted">
                      <span>Total Circle Pool Size:</span>
                      <span className="font-mono font-bold text-brand-forest">₦{totalCircleVolume.toLocaleString()} NGN</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-brand-muted">
                      <span>Platform Co-op Levy (1.5%):</span>
                      <span className="font-mono text-brand-clay">-₦{estimatedPlatformFee.toLocaleString()} NGN</span>
                    </div>
                    <div className="border-t border-brand-border/60 pt-2 flex justify-between items-center text-xs">
                      <span className="font-bold text-brand-forest">Your Escrow Payout:</span>
                      <span className="font-mono font-black text-brand-forest text-sm bg-[#1F4B35]/10 text-[#1F4B35] px-2.5 py-0.5 rounded border border-[#1F4B35]/10">
                        ₦{estimatedNetPayout.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-[9px] text-brand-muted font-mono leading-relaxed text-center">
                    Estimates based on standard co-op parameters. Basic and Pro subscribers enjoy platform fees reduced to **1.0%** alongside prioritization in payout orders.
                  </p>
                </div>
              </div>

              {/* Micro Quick Login Pre-populated Panel */}
              <div className="bg-[#FAF7F2] rounded-2xl border border-brand-border p-5 text-left space-y-3 shadow-md">
                <div>
                  <h4 className="font-display font-semibold text-brand-forest text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/60 pb-2">
                    <UserCheck className="w-4 h-4 text-brand-gold" />
                    Sandbox Quick-Entry Onboarding Portal
                  </h4>
                  <p className="text-[10px] text-brand-muted pt-1">
                    Select a simulated Nigerian circular economy participant to test immediate trust interactions:
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleQuickLogin("iyanuolalegan@gmail.com")}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-brand-border hover:border-brand-clay text-left transition-all cursor-pointer hover:bg-brand-cream/35"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                        alt="Iyanu"
                        className="w-7 h-7 rounded-full border border-brand-border object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-xs font-bold text-brand-forest block">Iyanu Legan (Admin)</span>
                        <span className="text-[9px] text-brand-muted block font-mono">iyanuolalegan@gmail.com</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-brand-forest/10 text-brand-forest border border-brand-forest/10 rounded">
                      Admin Hub
                    </span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin("fatima@example.com")}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-brand-border hover:border-brand-clay text-left transition-all cursor-pointer hover:bg-brand-cream/35"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                        alt="Fatima"
                        className="w-7 h-7 rounded-full border border-brand-border object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-xs font-bold text-brand-forest block">Fatima Bello (Premium Pro)</span>
                        <span className="text-[9px] text-brand-muted block font-mono">fatima@example.com</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-brand-gold/20 text-brand-forest border border-brand-gold/30 rounded">
                      Pro Tier
                    </span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin("chinedu@example.com")}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-brand-border hover:border-brand-clay text-left transition-all cursor-pointer hover:bg-brand-cream/35"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                        alt="Chinedu"
                        className="w-7 h-7 rounded-full border border-brand-border object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-xs font-bold text-brand-forest block">Chinedu Okafor (Participating)</span>
                        <span className="text-[9px] text-brand-muted block font-mono">chinedu@example.com</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-brand-cream border border-brand-border rounded text-brand-muted">
                      Member
                    </span>
                  </button>
                </div>
              </div>

            </div>
          </>
        ) : authMode === "login" ? (
          /* FULL AUTHENTICATED LOGIN CARD FORM */
          <div className="lg:col-span-6 lg:col-start-4 bg-white rounded-2xl border border-brand-border p-6 shadow-2xl space-y-6 text-left animate-scale-up">
            <div className="border-b border-brand-cream pb-4 space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-brand-clay block">
                Secure Credentials Node
              </span>
              <h3 className="font-display font-medium text-brand-forest text-base md:text-lg">
                Access Your AjoVault
              </h3>
              <p className="text-xs text-brand-muted">
                Input your registered email account to reconnect your escrow co-op networks.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-brand-forest">E-mail Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-border rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-brand-clay focus:outline-none text-brand-forest text-xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-brand-forest block">Password / Secure Code</label>
                  <span className="text-[10px] text-brand-muted hover:underline cursor-pointer">ForgotPassword?</span>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-border rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-brand-clay focus:outline-none text-brand-forest text-xs"
                />
                <span className="text-[9px] text-brand-muted block font-mono">
                  * Live demo: Enter any value to log in under a simulated sandbox session!
                </span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full bg-brand-forest hover:bg-brand-forest/95 text-brand-cream font-bold py-3 rounded-lg transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  Sign In to Vault Panel
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("view")}
                  className="w-full text-center py-2 text-brand-muted hover:text-brand-forest hover:bg-brand-cream/30 rounded-lg transition-all"
                >
                  Return to Home Landing
                </button>
              </div>
            </form>

            <div className="border-t border-brand-border/60 pt-4 flex items-center justify-between text-[11px]">
              <span className="text-brand-muted">New partner to rotational co-ops?</span>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className="font-bold text-brand-clay hover:underline cursor-pointer"
              >
                Launch Account Profile
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION / ONBOARDING ENCRYPTION FORM */
          <div className="lg:col-span-8 lg:col-start-3 bg-white rounded-2xl border border-brand-border p-6 shadow-2xl space-y-6 text-left animate-scale-up">
            <div className="border-b border-brand-cream pb-4 space-y-1 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-brand-clay block">
                  Covenants & Membership Onboarding
                </span>
                <h3 className="font-display font-medium text-brand-forest text-base md:text-lg">
                  Launch Your Immutable Trust Identity
                </h3>
                <p className="text-xs text-brand-muted">
                  Register below. Provide details matching your official NIMC/NIBSS registers for automatic trust score verification.
                </p>
              </div>
              <span className="text-[9px] self-start sm:self-auto bg-brand-forest/5 border border-brand-forest/10 px-2.5 py-1 text-brand-forest font-mono font-bold rounded uppercase">
                Step 1 of 1
              </span>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-brand-forest">First Name (Legal)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Iyanu"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    className="w-full bg-brand-cream border border-brand-border rounded-lg p-2.5 font-sans focus:ring-1 focus:ring-brand-clay focus:outline-none text-brand-forest"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-brand-forest">Last Name (Legal)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Legan"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className="w-full bg-brand-cream border border-brand-border rounded-lg p-2.5 font-sans focus:ring-1 focus:ring-brand-clay focus:outline-none text-brand-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-brand-forest">Legal Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. partner@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-brand-cream border border-brand-border rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-brand-clay focus:outline-none text-brand-forest"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-brand-forest">Phone (NIBSS Standard Format)</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 2348123456789"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-brand-cream border border-brand-border rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-brand-clay focus:outline-none text-brand-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-cream/50 p-4 rounded-xl border border-brand-border/60">
                <div className="space-y-1">
                  <label className="font-semibold text-brand-forest flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-clay" />
                    BVN (Optional for sandbox demo)
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="11-Digit Standard Number"
                    value={regBvn}
                    onChange={(e) => setRegBvn(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-white border border-brand-border rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-brand-clay focus:outline-none text-brand-forest"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-brand-forest flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-clay" />
                    NIN Code (National Identity Number)
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="11-Digit Code"
                    value={regNin}
                    onChange={(e) => setRegNin(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-white border border-brand-border rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-brand-clay focus:outline-none text-brand-forest"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-brand-forest block">Cooperative Plan Tier Selection</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegTier(PlanTier.FREE)}
                    className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                      regTier === PlanTier.FREE
                        ? "border-brand-clay bg-brand-clay/5 text-brand-clay font-bold"
                        : "border-brand-border bg-white text-brand-muted hover:border-brand-muted"
                    }`}
                  >
                    <span>General Sandbox Trial</span>
                    <span className="text-[9px] block text-brand-muted mt-1">1 active circle / 1.5% levies</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegTier(PlanTier.PRO)}
                    className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                      regTier === PlanTier.PRO
                        ? "border-brand-forest bg-[#1F4B35]/5 text-brand-forest font-bold"
                        : "border-brand-border bg-white text-brand-muted hover:border-brand-muted"
                    }`}
                  >
                    <span>Premium Pro Adashe (Admin)</span>
                    <span className="text-[9px] block text-brand-muted mt-1">Unlimited circles / bidding / 1.0% levies</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#FAF7F2] p-3 text-[10px] text-brand-muted border border-brand-border rounded-lg space-y-1 select-none leading-relaxed">
                <span className="font-bold uppercase text-brand-forest block">STATUTORY ENCRYPTION NOTICE</span>
                <p>
                  * By registering, you authorize AjoVault to execute sandbox legal compliance mapping on your mock NIN/BVN identifiers using standard SHA-256 secure hash networks. Your plaintext keys are immediately destroyed following validation checks.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full bg-[#1F4B35] hover:bg-[#1F4B35]/95 text-brand-cream font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 text-xs"
                >
                  <UserCheck className="w-4 h-4 text-brand-gold shrink-0" />
                  Initiate Profile & Sign Covenant Agreement
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("view")}
                  className="w-full text-center py-2 text-brand-muted hover:text-brand-forest hover:bg-brand-cream/30 rounded-lg transition-all"
                >
                  Return to Home Landing
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* THREE PILLARS NARRATIVE SECTION */}
      {authMode === "view" && (
        <section id="features" className="bg-white border-y border-brand-border/60 py-16 px-6 md:px-12 relative z-10 select-none">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C1440E] font-bold block">
                CORE TECHNICAL REVOLUTION
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-medium text-[#1F4B35]">
                Built on Three Pillars of Trust
              </h2>
              <p className="text-xs md:text-sm text-brand-muted leading-relaxed">
                By blending traditional Nigerian rotating savings customs with modern financial protocols, AjoVault removes risk and unlocks cooperative asset gains.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1 */}
              <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-brand-border space-y-4 hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-full bg-brand-forest/15 flex items-center justify-center text-brand-forest">
                  <Coins className="w-5 h-5 text-brand-forest" />
                </div>
                <h4 className="font-display font-semibold text-brand-forest text-base">Mathematical Rotations</h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Choose between matching algorithmic orders or modular live processes: Fixed index, Random randomized pools, Bidding (highest discount takes slot), or Consensus Voting layouts.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-brand-border space-y-4 hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-full bg-brand-clay/15 flex items-center justify-center text-brand-clay">
                  <ShieldCheck className="w-5 h-5 text-brand-clay" />
                </div>
                <h4 className="font-display font-semibold text-brand-forest text-base">Statutory Compliant Guard</h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Avoid defaults. Integrated BVN and NIN cryptographic validations guarantee that all participating community users are legally matched prior to circle authorization.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-brand-border space-y-4 hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                  <TrendingUp className="w-5 h-5 text-brand-gold" />
                </div>
                <h4 className="font-display font-semibold text-brand-forest text-base">Trust Reputation Index</h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Every transaction builds your decentralized ledger reputation index. Consistently paying on time boosts your platform Score, lowering subsequent escrow penalty rates.
                </p>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* FOOTER CO-OP COMPLIANCE SLATE */}
      <footer className="relative z-10 border-t border-brand-border/60 bg-brand-cream/90 py-8 px-6 text-center select-none shrink-0 text-[10px] text-brand-muted font-mono leading-relaxed space-y-1.5">
        <p className="font-bold text-brand-forest">
          © {new Date().getFullYear()} AJOVAULT COOPERATIVE INC. ALL SECURED INTELLECTUAL PROPERTY COVENANTS RESERVED.
        </p>
        <p>
          Licensures: NIMC compliant partner networks • NIBSS escrow direct-settlement nodes • CBN sandbox participant under regulatory observation.
        </p>
      </footer>

    </div>
  );
}
