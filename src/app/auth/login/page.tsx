"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Sparkles, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/useAuthStore";
import api from "@/lib/api";
import { User } from "@/types";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/app";
  const { login, isAuthenticated, initialize } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // OTP Login states
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [phoneMasked, setPhoneMasked] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Check if already authenticated
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = (await api.post("/auth/login", {
        email,
        password,
      })) as any;

      if (response.status === "requires_otp") {
        setRequiresOtp(true);
        setPhoneMasked(response.data.phone_masked);
        setCountdown(60);
        setIsLoading(false);
        return;
      }

      // Response sesuai Standard Envelope: { status: "success", data: { user, token } }
      const { user, token } = response.data as { user: User; token: string };

      // Simpan ke Zustand store + localStorage
      login(user, token);

      // Redirect berdasarkan role
      if (user.role === "cashier") {
        router.replace("/app/kasir");
      } else if (user.role === "courier") {
        router.replace("/app/scan");
      } else {
        router.replace(redirectTo);
      }
    } catch (err: any) {
      if (err.code === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else if (err.code === 401 || err.status === 401) {
        setError("Email atau password salah. Silakan coba lagi.");
      } else {
        setError("Gagal terhubung ke server. Pastikan backend sudah menyala.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = (await api.post("/auth/otp/verify", {
        email,
        otp,
      })) as any;

      const payload = response.data || response;
      const { user, token } = payload as { user: User; token: string };

      // Simpan ke Zustand store + localStorage
      login(user, token);

      // Redirect berdasarkan role
      if (user.role === "cashier") {
        router.replace("/app/kasir");
      } else if (user.role === "courier") {
        router.replace("/app/scan");
      } else {
        router.replace(redirectTo);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "OTP salah atau kedaluwarsa.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setIsLoading(true);
    try {
      await api.post("/auth/login", {
        email,
        password,
      });
      setCountdown(60);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Gagal mengirim ulang OTP.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#4DA8FF]/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl translate-y-1/2" />
      <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-emerald-500/3 rounded-full blur-3xl" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '48px 48px',
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Branding */}
        <div className="text-center mb-8 space-y-4">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-white/5 border border-white/10 shadow-2xl shadow-[#4DA8FF]/20 mx-auto overflow-hidden"
          >
            <div className="relative h-12 w-12">
              <Image 
                src="/logo-small.png" 
                alt="LUNDRY.id Logo" 
                fill 
                className="object-contain" 
              />
            </div>
          </motion.div>
          
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">LUNDRY.id</h1>
            <p className="text-sm text-slate-400 mt-1">POS & ERP Gateway — Masuk ke Dashboard</p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            Staging Mode — Staff Login
          </div>
        </div>

        {/* Login Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl space-y-6"
        >
          {requiresOtp ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* General Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-red-950/30 border border-red-500/20 flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 font-medium leading-relaxed">{error}</p>
                </motion.div>
              )}

              <div className="text-center space-y-2 py-2">
                <p className="text-sm text-slate-300">
                  Masukkan 6 digit kode keamanan yang telah dikirim ke nomor WhatsApp Anda:
                </p>
                <p className="text-lg font-black text-[#4DA8FF] tracking-wider">
                  {phoneMasked}
                </p>
              </div>

              {/* OTP Input Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1.5">
                  Kode Verifikasi OTP
                </label>
                <div className="relative">
                  <Input
                    id="login-otp"
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-white text-2xl text-center font-bold tracking-widest placeholder:text-slate-700 focus:border-[#4DA8FF]/50"
                  />
                </div>
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#4DA8FF] to-cyan-400 hover:from-[#4DA8FF]/90 hover:to-cyan-400/90 text-slate-950 font-black tracking-wider uppercase text-xs shadow-xl shadow-[#4DA8FF]/15 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Verifikasi & Masuk
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Resend button */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={countdown > 0 || isLoading}
                  onClick={handleResendOtp}
                  className="text-xs text-[#4DA8FF] hover:underline disabled:text-slate-500 disabled:no-underline font-medium transition-all"
                >
                  {countdown > 0 ? `Kirim ulang OTP dalam ${countdown}s` : "Kirim Ulang OTP"}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRequiresOtp(false);
                    setError("");
                    setOtp("");
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Kembali ke Login Email
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* General Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-red-950/30 border border-red-500/20 flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 font-medium leading-relaxed">{error}</p>
                </motion.div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#4DA8FF]" />
                  Email
                </label>
                <div className="relative">
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="owner@lundry.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                    className={`h-14 bg-white/5 border-white/10 rounded-2xl text-white text-base pl-4 placeholder:text-slate-500 focus:border-[#4DA8FF]/50 ${
                      fieldErrors.email ? "border-red-500/50 focus:border-red-500" : ""
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-red-400 font-medium mt-1">{fieldErrors.email[0]}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#4DA8FF]" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className={`h-14 bg-white/5 border-white/10 rounded-2xl text-white text-base pl-4 pr-14 placeholder:text-slate-500 focus:border-[#4DA8FF]/50 ${
                      fieldErrors.password ? "border-red-500/50 focus:border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-red-400 font-medium mt-1">{fieldErrors.password[0]}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#4DA8FF] to-cyan-400 hover:from-[#4DA8FF]/90 hover:to-cyan-400/90 text-slate-950 font-black tracking-wider uppercase text-xs shadow-xl shadow-[#4DA8FF]/15 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Masuk ke Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* WhatsApp OTP Status */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#4DA8FF]/5 border border-[#4DA8FF]/10">
            <div className="h-8 w-8 rounded-lg bg-[#4DA8FF]/10 flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-[#4DA8FF]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.214l-.253-.157-2.866.852.852-2.866-.157-.253A8 8 0 1112 20z"/>
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#4DA8FF] uppercase tracking-wider">Keamanan OTP WhatsApp</p>
              <p className="text-[10px] text-slate-400">Verifikasi 2 langkah aktif saat masuk ke dashboard admin/staff</p>
            </div>
          </div>
        </motion.div>

        {/* Footer Branding */}
        <p className="text-center text-[10px] text-slate-600 mt-8">
          © 2026 PT NAWASENA ADIKARYA PRATAMA · LUNDRY.id v2.1
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-[#4DA8FF] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
