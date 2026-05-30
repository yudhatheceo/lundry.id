"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  UserPlus,
  Users,
  Award,
  Wallet,
  Phone,
  Coins,
  MapPin,
  Heart,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Customer, MembershipTier } from "@/types";

const TIER_COLORS: Record<MembershipTier, { bg: string; text: string; border: string }> = {
  regular: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
  bronze: { bg: "bg-amber-700/10", text: "text-amber-600", border: "border-amber-700/20" },
  silver: { bg: "bg-slate-300/10", text: "text-slate-300", border: "border-slate-300/20" },
  gold: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
};

// Mock fallback data
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "01krxvcf2ndjpqwkxmcwy5wt7e",
    outlet_id: "01krxvceaqfftv04hsbmwn7vya",
    name: "Yudha The CEO",
    phone: "628113683131",
    address: "Mastrip Campus Area, Jember",
    wash_preference: "Wangi Lavender, Setrika Presisi",
    membership_tier: "gold",
    prepaid_balance: 750000,
    coin_balance: 120,
    referral_code: "THEBEACON01",
    created_at: "2026-05-18T18:00:00Z",
  },
  {
    id: "01krxvcf2ndjpqwkxmcwy5wt8f",
    outlet_id: "01krxvceaqfftv04hsbmwn7vya",
    name: "Nala Larasati",
    phone: "6281234567890",
    address: "Sumbersari, Jember",
    wash_preference: "Solf/Softener extra, pewangi Sakura",
    membership_tier: "silver",
    prepaid_balance: 120000,
    coin_balance: 45,
    referral_code: "NALA99",
    created_at: "2026-05-18T19:00:00Z",
  },
  {
    id: "01krxvcf2ndjpqwkxmcwy5wt9c",
    outlet_id: "01krxvceaqfftv04hsbmwn7vya",
    name: "Budi Santoso",
    phone: "6285222333444",
    address: "Jl. Hayam Wuruk No. 5",
    wash_preference: null,
    membership_tier: "regular",
    prepaid_balance: 0,
    coin_balance: 10,
    referral_code: "BUDI123",
    created_at: "2026-05-19T08:00:00Z",
  },
];

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    wash_preference: "",
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/v1/customers");
        const data = res.data?.data || res.data || [];
        setCustomers(Array.isArray(data) ? data : []);
      } catch {
        setCustomers(MOCK_CUSTOMERS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await api.post("/v1/customers", {
        name: formData.name,
        phone: formData.phone,
        address: formData.address || null,
        wash_preference: formData.wash_preference || null,
      });
      const created = res.data?.data || res.data;
      setCustomers([created, ...customers]);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.phone?.[0] || "Gagal menyimpan pelanggan.";
      alert("Error: " + msg);
    } finally {
      setIsSubmitting(false);
      setShowAddModal(false);
      setFormData({ name: "", phone: "", address: "", wash_preference: "" });
    }
  };

  const filteredCustomers = customers.filter(c => 
    !search || 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-12 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#4DA8FF]/5 rounded-full blur-3xl -z-0" />

      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/app" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                <span className="font-heading text-base md:text-lg font-black tracking-tight">Daftar Pelanggan</span>
              </div>
              <p className="text-[10px] text-slate-400">Database Pelanggan LUNDRY.id</p>
            </div>
          </div>

          <Button 
            onClick={() => setShowAddModal(true)}
            className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs gap-2"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden md:inline">Tambah Pelanggan</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 relative z-10 space-y-6">
        
        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Cari nama atau nomor WhatsApp pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl text-white text-base focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCustomers.map((cust, idx) => {
              const tier = TIER_COLORS[cust.membership_tier];
              return (
                <motion.div
                  key={cust.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:bg-white/[0.07] transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <button className="text-slate-500 hover:text-white transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl text-slate-300">
                      {cust.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-white leading-tight pr-6">{cust.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${tier.bg} ${tier.border} ${tier.text}`}>
                          {cust.membership_tier} Tier
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{cust.phone}</span>
                    </div>
                    {cust.address && (
                      <div className="flex items-start gap-2 text-xs text-slate-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{cust.address}</span>
                      </div>
                    )}
                    {cust.wash_preference && (
                      <div className="flex items-start gap-2 text-xs text-slate-400">
                        <Heart className="h-3.5 w-3.5 shrink-0 mt-0.5 text-pink-400/70" />
                        <span className="line-clamp-1 italic text-slate-300">"{cust.wash_preference}"</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                    <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/10">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-1 flex items-center gap-1">
                        <Wallet className="h-3 w-3" /> Deposit
                      </p>
                      <p className="font-bold text-emerald-400 text-sm">
                        Rp {cust.prepaid_balance.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/10">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-1 flex items-center gap-1">
                        <Coins className="h-3 w-3" /> L-Coins
                      </p>
                      <p className="font-bold text-amber-400 text-sm">
                        {cust.coin_balance} Koin
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Pelanggan tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl relative"
            >
              <h4 className="font-heading text-lg font-black mb-6 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-400" />
                Tambah Pelanggan Baru
              </h4>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap *</label>
                  <Input 
                    required
                    placeholder="Contoh: Rendi Wijaya"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-white/5 border-white/10 rounded-xl focus:border-emerald-500/50 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nomor WhatsApp *</label>
                  <Input 
                    required
                    placeholder="Contoh: 628123456xxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-white/5 border-white/10 rounded-xl focus:border-emerald-500/50 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alamat</label>
                  <Input 
                    placeholder="Contoh: Jl. Hayam Wuruk No. 5"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="bg-white/5 border-white/10 rounded-xl focus:border-emerald-500/50 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferensi Cuci Khusus</label>
                  <Input 
                    placeholder="Contoh: Pewangi Sakura, Setrika Presisi"
                    value={formData.wash_preference}
                    onChange={(e) => setFormData({...formData, wash_preference: e.target.value})}
                    className="bg-white/5 border-white/10 rounded-xl focus:border-emerald-500/50 h-12"
                  />
                  <p className="text-[10px] text-slate-500">Akan tampil sebagai catatan otomatis di POS.</p>
                </div>

                <div className="flex gap-3 pt-6">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 font-bold text-xs transition-all"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black tracking-widest uppercase text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
