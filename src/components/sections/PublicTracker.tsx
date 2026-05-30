"use client";

import React, { useState } from "react";
import { Search, Package, MapPin, Clock, CalendarDays, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export function PublicTracker() {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.get(`/public/track/${encodeURIComponent(identifier)}`);
      if (res.data?.status === 'success' && res.data?.data) {
        setResult(res.data.data);
      } else if (res.data) {
        setResult(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal melacak pesanan. Pastikan nomor resi benar.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      received: "Diterima",
      processing: "Diproses",
      ready_for_pickup: "Siap Diambil",
      delivered: "Selesai",
      voided: "Dibatalkan",
      sorting: "Penyortiran",
      washing: "Pencucian",
      drying: "Pengeringan",
      ironing: "Setrika",
      transit_to_customer: "Kurir Mengantar",
    };
    return map[status] || status;
  };

  return (
    <section id="lacak-cucian" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-0" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-secondary font-black text-[10px] uppercase tracking-[0.3em] mb-3 block">Real-time Tracker</span>
          <h2 className="font-heading text-3xl font-black tracking-tight text-primary sm:text-4xl">
            Lacak Cucian Kamu
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Masukkan Nomor Pesanan (LND-***) atau ID Kantong untuk melihat status cucian secara real-time.
          </p>
        </div>

        <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-[0_20px_50px_rgba(20,33,61,0.08)] border border-slate-100">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Contoh: LND-20260522-1234 atau ID Kantong"
                className="h-14 pl-12 bg-slate-50 border-slate-200 rounded-2xl text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !identifier.trim()}
              className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold"
            >
              {isLoading ? "Mencari..." : "Lacak Sekarang"}
            </Button>
          </form>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status Pesanan</p>
                  <h3 className="text-xl font-black text-primary">{result.order_number}</h3>
                  <p className="text-sm font-medium text-slate-600 mt-1">A.n. {result.customer_name}</p>
                </div>
                <div className="md:text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-widest">
                    {statusLabel(result.status)}
                  </span>
                  <div className="flex items-center md:justify-end gap-1.5 mt-2 text-sm text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span>Est. Selesai: {new Date(result.estimated_completion).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Detail Kantong Cucian</h4>
                {result.bags && result.bags.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {result.bags.map((bag: any, idx: number) => (
                      <div key={idx} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <p className="font-mono text-sm font-bold text-secondary">{bag.qr_code}</p>
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                            {statusLabel(bag.status)}
                          </span>
                        </div>
                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                          {bag.history && bag.history.map((log: any, logIdx: number) => (
                            <div key={logIdx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-secondary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="font-bold text-sm text-primary">{statusLabel(log.status)}</p>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                                  <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(log.date).toLocaleDateString("id-ID")}</span>
                                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {log.location}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!bag.history || bag.history.length === 0) && (
                            <p className="text-xs text-slate-400 italic ml-6">Belum ada riwayat pelacakan.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Data kantong tidak ditemukan untuk pesanan ini.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
