"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";


export default function AttendancePage() {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendance, setAttendance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch current status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/v1/attendances/current");
        setAttendance(res.data?.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  // Get location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude},${position.coords.longitude}`);
        },
        (err) => {
          console.warn("Geolocation blocked or failed:", err.message);
        }
      );
    }
  }, []);

  const handleClockIn = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await api.post("/v1/attendances/clock-in", { location });
      setAttendance(res.data?.data);
      setSuccessMsg("Berhasil Clock In!");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Gagal Clock In.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await api.post("/v1/attendances/clock-out", { location });
      setAttendance(res.data?.data);
      setSuccessMsg("Berhasil Clock Out! Selamat beristirahat.");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Gagal Clock Out.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isClockedIn = !!attendance?.clock_in_time;
  const isClockedOut = !!attendance?.clock_out_time;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden flex flex-col">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -z-0" />
      
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/app" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-heading text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-400" />
              Absensi Kehadiran
            </h1>
            <p className="text-[10px] text-slate-400">Catat waktu kerja Anda</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md relative overflow-hidden text-center"
        >
          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4" /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {successMsg}
            </div>
          )}

          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
            {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(currentTime)}
          </h2>
          <div className="text-6xl font-black text-white font-mono tracking-tighter mb-8 drop-shadow-xl">
            {currentTime.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-8 bg-slate-900/50 py-2 px-4 rounded-full inline-flex">
            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
            {location ? "Lokasi terdeteksi" : "Mencari lokasi..."}
          </div>

          <div className="space-y-4">
            {!isClockedIn ? (
              <Button
                onClick={handleClockIn}
                disabled={isSubmitting || !location}
                className="w-full h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black tracking-widest uppercase text-sm shadow-lg shadow-emerald-500/20 transition-all"
              >
                {isSubmitting ? "Memproses..." : (
                  <>
                    <Fingerprint className="h-5 w-5 mr-2" /> CLOCK IN SEKARANG
                  </>
                )}
              </Button>
            ) : !isClockedOut ? (
              <>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-bold flex flex-col gap-1 mb-4">
                  <span className="text-[10px] text-emerald-500 uppercase tracking-widest">Waktu Masuk</span>
                  <span className="text-xl font-mono">{attendance.clock_in_time.substring(0, 5)}</span>
                </div>
                <Button
                  onClick={handleClockOut}
                  disabled={isSubmitting || !location}
                  variant="outline"
                  className="w-full h-16 rounded-2xl bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400 font-black tracking-widest uppercase text-sm transition-all"
                >
                  {isSubmitting ? "Memproses..." : (
                    <>
                      <LogOut className="h-5 w-5 mr-2" /> CLOCK OUT
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="p-6 bg-slate-800/50 border border-white/10 rounded-2xl">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-1">Absensi Selesai</h3>
                <p className="text-xs text-slate-400">Anda sudah menyelesaikan shift hari ini.</p>
                <div className="flex justify-between mt-4 pt-4 border-t border-white/5 text-sm font-mono font-bold">
                  <div className="text-emerald-400">IN: {attendance.clock_in_time.substring(0, 5)}</div>
                  <div className="text-red-400">OUT: {attendance.clock_out_time.substring(0, 5)}</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
