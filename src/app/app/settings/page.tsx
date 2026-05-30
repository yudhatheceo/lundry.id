"use client";

import React, { useState, useEffect } from "react";
import { Save, Settings2, Webhook, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    n8n_url: "",
    gowa_url: "",
    waha_url: "",
    active_provider: "n8n",
    whatsapp_otp_enabled: true,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/v1/settings/webhook");
      const payload = res.data?.data || res.data;
      if (payload) {
        setSettings({
          n8n_url: payload.n8n_url ?? "",
          gowa_url: payload.gowa_url ?? "",
          waha_url: payload.waha_url ?? "",
          active_provider: payload.active_provider ?? "n8n",
          whatsapp_otp_enabled: payload.whatsapp_otp_enabled ?? true,
        });
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan webhook:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await api.post("/v1/settings/webhook", settings);
      setMessage({ type: "success", text: "Pengaturan webhook berhasil disimpan!" });
    } catch (err: any) {
      setMessage({ type: "error", text: "Gagal menyimpan: " + (err.response?.data?.message || err.message || "Kesalahan server.") });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setMessage(null);
    try {
      const res = await api.post("/v1/settings/webhook/test");
      setMessage({ 
        type: res.data?.status === "success" ? "success" : "error", 
        text: res.data?.message ?? "Tes koneksi selesai." 
      });
    } catch (err: any) {
      setMessage({ 
        type: "error", 
        text: "Koneksi gagal: " + (err.response?.data?.message || err.message || "Endpoint tidak dapat dihubungi.") 
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-12">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4DA8FF]/5 rounded-full blur-3xl -z-0" />
      
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/app" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-[#4DA8FF]" />
            <span className="text-xs text-slate-400 uppercase tracking-widest font-black">Gateways</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 relative z-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Webhook className="h-8 w-8 text-[#4DA8FF]" /> Otomasi &amp; Webhook
          </h1>
          <p className="text-slate-400 text-xs mt-1.5">Integrasikan POS LUNDRY.id dengan n8n, Go-WhatsApp, atau WAHA untuk notifikasi WhatsApp otomatis ke pelanggan.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${message.type === "success" ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-400" : "bg-red-950/30 border-red-500/20 text-red-400"}`}>
            {message.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
          {/* Active Provider Selector */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Penyedia Otomasi Aktif</label>
            <select 
              value={settings.active_provider}
              onChange={(e) => setSettings({ ...settings, active_provider: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:border-[#4DA8FF]/60 outline-none transition-colors"
              style={{ colorScheme: "dark" }}
            >
              <option value="n8n" className="bg-slate-900 text-white">N8N (Node-based Webhook)</option>
              <option value="gowa" className="bg-slate-900 text-white">Go-WhatsApp (GoWa Gateway)</option>
              <option value="waha" className="bg-slate-900 text-white">WAHA (WhatsApp HTTP API)</option>
            </select>
          </div>

          {/* WhatsApp OTP Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="whatsapp_otp_enabled"
              checked={settings.whatsapp_otp_enabled}
              onChange={(e) => setSettings({ ...settings, whatsapp_otp_enabled: e.target.checked })}
              className="w-5 h-5 rounded bg-slate-850 border-white/10 text-[#4DA8FF] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="whatsapp_otp_enabled" className="text-sm text-slate-300 select-none cursor-pointer">
              Aktifkan Autentikasi OTP WhatsApp saat Login Dashboard
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-6 border-t border-white/10">
            {/* N8N Input */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
                <Webhook className="h-4 w-4 text-purple-400" /> Endpoint N8N Webhook
              </label>
              <Input 
                placeholder="https://n8n.domain.com/webhook/xxxx"
                value={settings.n8n_url}
                onChange={(e) => setSettings({ ...settings, n8n_url: e.target.value })}
                className="h-12 bg-slate-800 border-white/10 rounded-xl text-white text-sm"
                disabled={isLoading}
              />
            </div>

            {/* GoWa Input */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
                <Webhook className="h-4 w-4 text-emerald-400" /> Endpoint Go-WhatsApp (GoWa)
              </label>
              <Input 
                placeholder="https://gowa.domain.com/send"
                value={settings.gowa_url}
                onChange={(e) => setSettings({ ...settings, gowa_url: e.target.value })}
                className="h-12 bg-slate-800 border-white/10 rounded-xl text-white text-sm"
                disabled={isLoading}
              />
            </div>
            
            {/* WAHA Input */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
                <Webhook className="h-4 w-4 text-sky-400" /> Endpoint WAHA (WhatsApp HTTP API)
              </label>
              <Input 
                placeholder="https://waha.domain.com/api/sendText"
                value={settings.waha_url}
                onChange={(e) => setSettings({ ...settings, waha_url: e.target.value })}
                className="h-12 bg-slate-800 border-white/10 rounded-xl text-white text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-white/10">
            <Button 
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || isLoading}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 h-12 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {isTesting ? <RefreshCw className="h-4 w-4 animate-spin text-[#4DA8FF]" /> : <Send className="h-4 w-4" />}
              Test Koneksi Webhook
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSaving || isLoading}
              className="bg-[#4DA8FF] hover:bg-[#4DA8FF]/90 text-slate-950 font-bold px-8 h-12 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Pengaturan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
