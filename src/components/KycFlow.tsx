/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  ShieldCheck,
  Check,
  Camera,
  Smartphone,
  Fingerprint,
  UserCheck,
  Lightbulb,
  ShieldAlert,
  Clock,
  Lock
} from "lucide-react";
import { User, KYCStatus } from "../types";

interface KycFlowProps {
  user: User;
  onUpdateKycStatus: (status: KYCStatus) => void;
}

export default function KycFlow({ user, onUpdateKycStatus }: KycFlowProps) {
  const [kycStep, setKycStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);

  // States
  const [bvn, setBvn] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [nin, setNin] = useState("");
  const [selfieSnapped, setSelfieSnapped] = useState(false);

  const handleBvnVerify = () => {
    if (bvn.length !== 11) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setKycStep(2);
    }, 1800);
  };

  const handleOtpVerify = () => {
    if (phoneOtp.length !== 6) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setKycStep(3);
    }, 1500);
  };

  const handleNinVerify = () => {
    if (nin.length !== 11) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setKycStep(4);
    }, 1800);
  };

  const handleSelfieSnap = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setSelfieSnapped(true);
    }, 2000);
  };

  const handleCompleteKYCAll = () => {
    onUpdateKycStatus(KYCStatus.VERIFIED);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in relative z-10 select-none">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <h2 className="text-xl font-display font-medium text-brand-forest flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-clay" />
          KYC Compliance Verification Hub
        </h2>
        <p className="text-xs text-brand-muted mt-1 leading-relaxed">
          Nigeria regulatory compliant verification (BVN & NIN alignment). This secure protocol preserves high-velocity trust inside rotational adashe groupings.
        </p>

        {/* Current verified state widget */}
        <div className="mt-4 pt-4 border-t border-brand-cream flex justify-between items-center text-xs">
          <span className="text-brand-muted font-medium">Compliance Status:</span>
          {user.kycStatus === KYCStatus.VERIFIED ? (
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 font-bold rounded-full flex items-center gap-1 font-mono text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED COMPLIANT
            </span>
          ) : user.kycStatus === KYCStatus.PENDING ? (
            <span className="px-2.5 py-1 bg-brand-gold/15 text-brand-gold border-brand-gold/25 font-bold rounded-full flex items-center gap-1 font-mono text-[10px] animate-pulse">
              <Clock className="w-3.5 h-3.5" /> PENDING ALL MATCHES
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-red-500/5 text-red-500 border border-red-500/10 font-bold rounded-full flex items-center gap-1 font-mono text-[10px]">
              <ShieldAlert className="w-3.5 h-3.5" /> UNVERIFIED
            </span>
          )}
        </div>
      </div>

      {user.kycStatus === KYCStatus.VERIFIED ? (
        <div className="bg-white p-8 text-center rounded-2xl border border-brand-border shadow-sm space-y-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-500/15 text-emerald-600">
            <UserCheck className="w-10 h-10 animate-scale-up" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-brand-forest text-base">Verification Complete</h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto leading-relaxed">
              Your biometric and statutory identities are aligned successfully with the Central Bank database. Your Trust reputation Rating is locked to **100%** maximum!
            </p>
          </div>
          <div className="bg-brand-cream p-3 rounded-lg border border-brand-border text-[10px] text-brand-muted font-mono max-w-xs mx-auto">
            SHA-GCM Encrypted: AES256-DEB892...
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden divide-y divide-brand-cream">
          
          {/* Active Steps Progress Bar */}
          <div className="bg-brand-cream px-6 py-3 flex justify-between items-center text-[10px] font-bold text-brand-muted uppercase font-mono tracking-wider">
            <span className={kycStep === 1 ? "text-brand-clay" : ""}>1. BVN</span>
            <span className={kycStep === 2 ? "text-brand-clay" : ""}>2. SMS Code</span>
            <span className={kycStep === 3 ? "text-brand-clay" : ""}>3. NIN verify</span>
            <span className={kycStep === 4 ? "text-brand-clay" : ""}>4. Selfie Bio</span>
          </div>

          {/* Form Area */}
          <div className="p-6 md:p-8 space-y-6">
            
            {/* STEP 1: BVN */}
            {kycStep === 1 && (
              <div className="space-y-4">
                <div className="flex gap-3 bg-brand-cream p-4 rounded-xl border border-brand-border text-xs text-brand-muted leading-relaxed">
                  <Fingerprint className="w-5 h-5 text-brand-clay shrink-0" />
                  <p>
                    Your Bank Verification Number (BVN) allows AjoVault to confirm your legal names and statutory credentials automatically. We transmit to the NIBSS proxy securely using AES-256 encryption.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-forest uppercase tracking-wider block">
                    Enter your 11-digit BVN Code
                  </label>
                  <input
                    type="password"
                    maxLength={11}
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                    placeholder="2210 • • • • • • •"
                    className="w-full tracking-widest text-center px-4 py-3 border border-brand-border rounded-lg bg-brand-cream font-mono font-bold text-base outline-none focus:border-brand-clay text-brand-forest"
                  />
                  <span className="text-[10px] text-brand-muted block text-right mt-1 font-mono">
                    {bvn.length}/11 numeric characters
                  </span>
                </div>

                <button
                  onClick={handleBvnVerify}
                  disabled={bvn.length !== 11 || isVerifying}
                  className="w-full bg-brand-forest hover:bg-brand-forest/90 text-brand-cream disabled:opacity-40 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating BVN Encryptions...
                    </>
                  ) : (
                    "Authorize Identity Lookups"
                  )}
                </button>
              </div>
            )}

            {/* STEP 2: PHONE OTP */}
            {kycStep === 2 && (
              <div className="space-y-4">
                <div className="flex gap-3 bg-brand-cream p-4 rounded-xl border border-brand-border text-xs text-brand-muted leading-relaxed">
                  <Smartphone className="w-5 h-5 text-brand-clay shrink-0" />
                  <p>
                    Matching mobile number located. We dispatched a simulated **6-digit Termii SMS OTP** code to your statutory mobile number registered matching **Iyanu Legan** (******6789).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-forest uppercase tracking-wider block">
                    Enter Termii SMS Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 1 2 3 4 5 6"
                    className="w-full tracking-widest text-center px-4 py-3 border border-brand-border rounded-lg bg-brand-cream font-mono font-bold text-base outline-none focus:border-brand-clay text-brand-forest"
                  />
                  <span className="text-[10px] text-brand-muted block text-right mt-1 font-mono">
                    Sandbox Code: type **123456** to pass quickly
                  </span>
                </div>

                <button
                  onClick={handleOtpVerify}
                  disabled={phoneOtp.length !== 6 || isVerifying}
                  className="w-full bg-brand-forest hover:bg-brand-forest/90 text-brand-cream disabled:opacity-40 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Decrypting Signature Handshakes...
                    </>
                  ) : (
                    "Confirm OTP Credentials"
                  )}
                </button>
              </div>
            )}

            {/* STEP 3: NIN */}
            {kycStep === 3 && (
              <div className="space-y-4">
                <div className="flex gap-3 bg-brand-cream p-4 rounded-xl border border-brand-border text-xs text-brand-muted leading-relaxed">
                  <UserCheck className="w-5 h-5 text-brand-clay shrink-0" />
                  <p>
                    statutory compliance rules demand checked NIN credentials to prevent circular misconduct or rotational cash-scout runs. Let's lookup your NIMC profile records.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-forest uppercase tracking-wider block">
                    Enter your National Identity Number (NIN)
                  </label>
                  <input
                    type="password"
                    maxLength={11}
                    value={nin}
                    onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
                    placeholder="3456 • • • • • • •"
                    className="w-full tracking-widest text-center px-4 py-3 border border-brand-border rounded-lg bg-brand-cream font-mono font-bold text-base outline-none focus:border-brand-clay text-brand-forest"
                  />
                  <span className="text-[10px] text-brand-muted block text-right mt-1 font-mono">
                    {nin.length}/11 numeric characters
                  </span>
                </div>

                <button
                  onClick={handleNinVerify}
                  disabled={nin.length !== 11 || isVerifying}
                  className="w-full bg-brand-forest hover:bg-brand-forest/90 text-brand-cream disabled:opacity-40 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Contacting NIMC Statutory Servers...
                    </>
                  ) : (
                    "Authorize NIMC Sync"
                  )}
                </button>
              </div>
            )}

            {/* STEP 4: BIO SNAP */}
            {kycStep === 4 && (
              <div className="space-y-6 text-center">
                <div className="flex gap-3 bg-brand-cream p-4 rounded-xl border border-brand-border text-xs text-brand-muted text-left">
                  <Lightbulb className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                  <p>
                    Please align your face inside the snap viewfinder circle. Avoid heavy glasses, accessories, or dark backgrounds to pass NIBSS face-similarity verification.
                  </p>
                </div>

                <div className="relative w-48 h-48 rounded-full border-4 border-dashed border-brand-clay mx-auto overflow-hidden animate-pulse flex items-center justify-center bg-black/5">
                  {selfieSnapped ? (
                    <img
                      src={user.avatarUrl}
                      alt="Snapped selfie"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Camera className="w-12 h-12 text-brand-clay opacity-80" />
                  )}
                </div>

                {!selfieSnapped ? (
                  <button
                    onClick={handleSelfieSnap}
                    disabled={isVerifying}
                    className="bg-brand-clay hover:bg-brand-clay/90 text-brand-cream font-bold text-xs py-2 px-5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-45"
                  >
                    {isVerifying ? "Matching biometric grids..." : "Snap Verification Selfie"}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-emerald-600 font-bold text-xs">✓ Biometric Liveness Face Match: 99.4%</p>
                    <button
                      onClick={handleCompleteKYCAll}
                      className="w-full bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold py-3 rounded-lg text-xs cursor-pointer shadow"
                    >
                      Complete & Bind Encrypted KYC Profiler
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Statutory Security Seal Accent */}
          <div className="bg-brand-cream/50 p-4 rounded-b-2xl border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[9px] text-brand-muted font-mono select-none">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-brand-clay shrink-0" />
              AES-GCM SECURED PINLESS ENCRYPTIONS
            </span>
            <span>NIMC & NIBSS COMPLIANT DIRECT HANDSHAKES</span>
          </div>

        </div>
      )}

    </div>
  );
}
