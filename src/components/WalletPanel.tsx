/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  Clock,
  ArrowRight,
  Building,
  CheckCircle2,
  Calendar,
  Eye,
  AlertTriangle,
  CreditCard
} from "lucide-react";
import { User, Transaction, TransactionType, TransactionStatus } from "../types";
import { BANK_LIST } from "../utils/mockData";

interface WalletPanelProps {
  user: User;
  transactions: Transaction[];
  onFundWallet: (amount: number) => void;
  onWithdrawWallet: (amount: number, bankDetail: { bankName: string; accNumber: string }) => void;
}

export default function WalletPanel({
  user,
  transactions,
  onFundWallet,
  onWithdrawWallet,
}: WalletPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"fund" | "withdraw" | "history">("fund");

  // Funding States
  const [fundAmount, setFundAmount] = useState<number>(20000);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Cashout / Withdrawal States
  const [selectedBankCode, setSelectedBankCode] = useState(BANK_LIST[0].code);
  const [accountNumber, setAccountNumber] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState<number>(10000);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amt);
  };

  // Simulate instant bank account resolution
  const handleAccountTyping = (val: string) => {
    setAccountNumber(val.replace(/\D/g, ""));
    const cleaned = val.replace(/\D/g, "");
    
    if (cleaned.length === 10) {
      setIsResolving(true);
      setResolvedName("");
      setTimeout(() => {
        setIsResolving(false);
        // Resolve nicely as user's name
        setResolvedName(`${user.firstName} ${user.lastName}`);
      }, 1000);
    } else {
      setResolvedName("");
    }
  };

  const handleFundingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (fundAmount <= 0) return;
    setIsDepositing(true);

    setTimeout(() => {
       setIsDepositing(false);
       setDepositSuccess(true);
       onFundWallet(fundAmount);
      
       setTimeout(() => {
         setDepositSuccess(false);
       }, 2000);
     }, 1800);
   };
 
   const handleWithdrawSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > user.walletBalance || accountNumber.length !== 10) return;
    setIsWithdrawing(true);

    const bankObj = BANK_LIST.find((b) => b.code === selectedBankCode);

    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      onWithdrawWallet(withdrawAmount, {
        bankName: bankObj?.name || "Access Bank",
        accNumber: accountNumber,
      });

      setTimeout(() => {
        setWithdrawSuccess(false);
        setAccountNumber("");
        setResolvedName("");
      }, 2000);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10 select-none">
      
      {/* Wallet overview card */}
      <div className="bg-brand-forest text-brand-cream p-6 rounded-2xl border border-brand-forest shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 adire-accent opacity-5 pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] tracking-wider uppercase font-mono text-brand-gold font-bold">AJOVAULT WALLET LEDGER</span>
          <h2 className="text-3xl font-bold">{formatCurrency(user.walletBalance)}</h2>
          <p className="text-[11px] text-brand-cream/70">
            Escrow protected ledger active. Verified by NIBSS and Paystack.
          </p>
        </div>

        <div className="flex gap-2 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab("fund")}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === "fund"
                ? "bg-brand-clay border-brand-clay text-white shadow"
                : "bg-white/10 hover:bg-white/15 border-white/20 text-brand-cream"
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-brand-gold shrink-0" />
            Deposit
          </button>

          <button
            onClick={() => setActiveSubTab("withdraw")}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === "withdraw"
                ? "bg-brand-clay border-brand-clay text-white shadow"
                : "bg-white/10 hover:bg-white/15 border-white/20 text-brand-cream"
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-brand-gold shrink-0" />
            Cashout
          </button>
        </div>
      </div>

      {/* Main body tabs content router */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Forms */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
          
          {activeSubTab === "fund" && (
            <form onSubmit={handleFundingSubmit} className="space-y-6 text-xs">
              <div className="border-b border-brand-cream pb-3">
                <h3 className="text-base font-display font-semibold text-brand-forest">
                  Simulate Wallet Deposit (Paystack Inline)
                </h3>
                <p className="text-[11px] text-brand-muted mt-0.5">
                  Top up your AjoVault balance instantly to pay contributors or fund rotation pools.
                </p>
              </div>

              {depositSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8 animate-scale-up" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-forest font-display">Wallet Funded Success</h4>
                    <p className="text-xs text-brand-muted mt-1">
                      {formatCurrency(fundAmount)} added to your active available balances.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Amount quick selectors */}
                  <div className="space-y-2">
                    <label className="font-semibold text-brand-forest">Select Prefund Size</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[15000, 30000, 50000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setFundAmount(amt)}
                          className={`py-2 rounded-lg font-bold border transition-all text-xs cursor-pointer ${
                            fundAmount === amt
                              ? "border-brand-clay bg-brand-clay/5 text-brand-clay"
                              : "border-brand-border bg-brand-cream text-brand-muted hover:border-brand-muted"
                          }`}
                        >
                          {formatCurrency(amt)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual selector input */}
                  <div className="space-y-1">
                    <label className="font-semibold text-brand-forest">Or Enter custom amount (NGN)</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={fundAmount}
                      onChange={(e) => setFundAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-cream text-brand-forest font-bold"
                    />
                  </div>

                  <div className="p-3 bg-brand-cream rounded-xl border border-brand-border flex gap-2 items-start">
                    <CreditCard className="w-4.5 h-4.5 text-brand-clay shrink-0 mt-0.5" />
                    <p className="text-[11px] text-brand-muted font-medium">
                      Simulates interactive escrow debit. Your funds are secured protected in our sandboxed test pools.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isDepositing || fundAmount <= 0}
                    className="w-full bg-brand-forest hover:bg-brand-forest/90 text-brand-cream py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-40"
                  >
                    {isDepositing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Summoning Secure Paystack Gateway...
                      </>
                    ) : (
                      `Prefund Wallet with ${formatCurrency(fundAmount)}`
                    )}
                  </button>
                </>
              )}
            </form>
          )}

          {activeSubTab === "withdraw" && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
              <div className="border-b border-brand-cream pb-3">
                <h3 className="text-base font-display font-semibold text-brand-forest">
                  Initiate Fund Cashout (Mock Paystack Transfers)
                </h3>
                <p className="text-[11px] text-brand-muted mt-0.5">
                  Transfer mutual savings payout safely to any verified Nigerian commercial account.
                </p>
              </div>

              {withdrawSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8 animate-scale-up" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-forest font-display">Cashout Transferred Success</h4>
                    <p className="text-xs text-brand-muted mt-1">
                      {formatCurrency(withdrawAmount)} dispatched safely. Processing NIP bank logs...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Bank Selection */}
                    <div className="space-y-1">
                      <label className="font-semibold text-brand-forest uppercase tracking-wider block">Target Destination Bank</label>
                      <select
                        value={selectedBankCode}
                        onChange={(e) => setSelectedBankCode(e.target.value)}
                        className="w-full text-xs font-semibold border border-brand-border p-2 rounded-lg bg-brand-cream text-brand-forest outline-none mt-1"
                      >
                        {BANK_LIST.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Account lookup */}
                    <div className="space-y-1">
                      <label className="font-semibold text-brand-forest uppercase tracking-wider block">Account Number (10 Digits)</label>
                      <input
                        type="text"
                        maxLength={10}
                        required
                        value={accountNumber}
                        onChange={(e) => handleAccountTyping(e.target.value)}
                        placeholder="e.g. 0123456789"
                        className="w-full px-3 py-2 border border-brand-border bg-brand-cream text-brand-forest font-mono font-bold mt-1"
                      />
                    </div>

                  </div>

                  {/* Resolved name loader */}
                  {isResolving && (
                    <div className="p-3 bg-brand-cream text-brand-muted text-[11px] flex items-center gap-2 rounded-lg border border-brand-border font-medium">
                      <div className="w-3.5 h-3.5 border-2 border-brand-muted border-t-transparent rounded-full animate-spin" />
                      Resolving account on Paystack directory lookup...
                    </div>
                  )}

                  {resolvedName && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-500/10 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Recipient Named: {resolvedName}
                    </div>
                  )}

                  {/* Amount select to withdraw */}
                  <div className="space-y-1 pt-2 border-t border-brand-cream">
                    <label className="font-semibold text-brand-forest uppercase tracking-wider block">Cashout Amount (NGN)</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2 text-xs font-bold text-brand-forest">₦</span>
                      <input
                        type="number"
                        required
                        max={user.walletBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="w-full border border-brand-border text-xs py-2 pl-7 pr-3 bg-brand-cream text-brand-forest font-bold font-mono"
                      />
                    </div>
                    
                    {/* Insufficient caution */}
                    {withdrawAmount > user.walletBalance && (
                      <span className="text-[10px] text-red-500 font-bold block mt-1">
                        *Amount exceeds your active wallet ledger. Maximum withdraw is {formatCurrency(user.walletBalance)}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isWithdrawing || withdrawAmount <= 0 || withdrawAmount > user.walletBalance || accountNumber.length !== 10 || !resolvedName}
                    className="w-full bg-brand-forest hover:bg-brand-forest/90 text-brand-cream disabled:opacity-40 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:cursor-not-allowed"
                  >
                    {isWithdrawing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Disbursing Bank Wire NIP Cashout...
                      </>
                    ) : (
                      `Authorize Transfer Cashout of ${formatCurrency(withdrawAmount)}`
                    )}
                  </button>
                </>
              )}
            </form>
          )}

        </div>

        {/* Right Column: Mini feed ledger of Top-up and withdrawals */}
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-display font-bold text-brand-forest uppercase tracking-wider border-b border-brand-cream pb-2">
            Wallet Movements Log
          </h3>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {transactions
              .filter((t) => t.type === TransactionType.TOP_UP || t.type === TransactionType.WITHDRAWAL)
              .map((t) => (
                <div key={t.id} className="flex justify-between items-center text-xs border-b border-brand-cream pb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg border ${
                        t.type === TransactionType.TOP_UP
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/15"
                          : "bg-red-500/5 text-red-500 border-red-500/10"
                      }`}
                    >
                      {t.type === TransactionType.TOP_UP ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-brand-forest block">
                        {t.type === TransactionType.TOP_UP ? "Fund Direct" : "Cashout Wire"}
                      </span>
                      <span className="text-[10px] text-brand-muted block mt-0.5 font-mono">
                        {new Date(t.createdAt).toLocaleDateString("en-NG")} · {t.reference}
                      </span>
                    </div>
                  </div>

                  <span className={`font-bold ${t.type === TransactionType.TOP_UP ? "text-emerald-700" : "text-brand-clay"}`}>
                    {t.type === TransactionType.TOP_UP ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}

            {transactions.filter((t) => t.type === TransactionType.TOP_UP || t.type === TransactionType.WITHDRAWAL).length === 0 && (
              <div className="text-center py-8 text-brand-muted italic text-xs">
                No funding movements logged in this sandbox.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
