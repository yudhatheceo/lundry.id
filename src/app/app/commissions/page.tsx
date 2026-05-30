"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plus, Trash2, Search, Percent } from "lucide-react";
import Link from "next/link";

interface StaffUser {
  id: string;
  name: string;
  role: string;
}

interface Commission {
  id: string;
  user_id: string;
  service_name: string;
  rate_amount: string;
  user?: StaffUser;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

interface AppService {
  id: string;
  service_name: string;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<AppService[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    service_name: "",
    rate_amount: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [comRes, staffRes, srvRes] = await Promise.all([
        api.get("/v1/commissions"),
        api.get("/v1/staff"),
        api.get("/v1/services")
      ]);
      setCommissions(comRes.data || []);
      setStaff(staffRes.data || []);
      setServices(srvRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/v1/commissions", {
        user_id: formData.user_id,
        service_name: formData.service_name,
        rate_amount: parseFloat(formData.rate_amount)
      });
      setShowModal(false);
      setFormData({ user_id: "", service_name: "", rate_amount: "" });
      fetchData();
    } catch (error) {
      alert("Gagal menyimpan komisi.");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Hapus pengaturan komisi ini?")) return;
    try {
      await api.delete(`/v1/commissions/${id}`);
      fetchData();
    } catch (error) {
      alert("Gagal menghapus komisi.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-900">
      <div className="flex-none p-4 md:p-6 border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/app" className="h-10 w-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Skema Komisi & Bonus</h1>
                <p className="text-slate-400 text-sm">Atur insentif per layanan untuk Kasir & Helper/Affiliate.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Atur Komisi Baru
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-700/50">
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Karyawan</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Layanan (Service)</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Nominal Komisi (Rp)</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {commissions.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{c.user?.name}</div>
                        <div className="text-xs text-slate-400">{c.user?.role}</div>
                      </td>
                      <td className="p-4 text-slate-300">
                        <span className="px-2.5 py-1 bg-slate-800 rounded text-sm border border-slate-700">{c.service_name}</span>
                      </td>
                      <td className="p-4 text-emerald-400 font-medium">+ Rp {parseFloat(c.rate_amount).toLocaleString('id-ID')} <span className="text-slate-500 text-xs">/ item</span></td>
                      <td className="p-4">
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {commissions.length === 0 && !loading && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">Belum ada pengaturan komisi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Setup Komisi Layanan</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Pilih Karyawan</label>
                  <select 
                    required
                    value={formData.user_id}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Pilih --</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Layanan (Service)</label>
                  <select 
                    required
                    value={formData.service_name}
                    onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Pilih Layanan --</option>
                    {services.map(s => <option key={s.id} value={s.service_name}>{s.service_name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nominal Komisi (Rp) per pcs/kg</label>
                  <input 
                    type="number" required min="0"
                    value={formData.rate_amount}
                    onChange={(e) => setFormData({...formData, rate_amount: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Sistem akan otomatis mengganti tarif lama jika sudah pernah di-set.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
                    Batal
                  </button>
                  <button type="submit" className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors">
                    Simpan Komisi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
