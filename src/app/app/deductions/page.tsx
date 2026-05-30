"use client";

import { useState, useEffect, FormEvent } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Coins, AlertTriangle, Plus, CheckCircle, Search, DollarSign } from "lucide-react";

interface StaffUser {
  id: string;
  name: string;
  role: string;
}

interface CashAdvance {
  id: string;
  user_id: string;
  amount: string;
  monthly_deduction: string;
  installment_months: number;
  remaining_balance: string;
  status: string;
  created_at: string;
  user?: StaffUser;
}

interface Punishment {
  id: string;
  user_id: string;
  amount: string;
  reason: string;
  date: string;
  status: string;
  created_at: string;
  user?: StaffUser;
  overrider?: {
    name: string;
  };
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

export default function DeductionsPage() {
  const [activeTab, setActiveTab] = useState("kasbon");
  const [cashAdvances, setCashAdvances] = useState<CashAdvance[]>([]);
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    amount: "",
    installment_months: "1",
    notes: "",
    reason: "", // For punishment
    date: format(new Date(), 'yyyy-MM-dd') // For punishment
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [caRes, pRes, staffRes] = await Promise.all([
        api.get("/v1/deductions/cash-advances"),
        api.get("/v1/deductions/punishments"),
        api.get("/v1/staff")
      ]);
      setCashAdvances(caRes.data || []);
      setPunishments(pRes.data || []);
      setStaff(staffRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === "kasbon") {
        await api.post("/v1/deductions/cash-advances", {
          user_id: formData.user_id,
          amount: parseFloat(formData.amount),
          installment_months: parseInt(formData.installment_months),
          notes: formData.notes
        });
      } else {
        await api.post("/v1/deductions/punishments", {
          user_id: formData.user_id,
          amount: parseFloat(formData.amount),
          reason: formData.reason,
          date: formData.date
        });
      }
      setShowModal(false);
      setFormData({ user_id: "", amount: "", installment_months: "1", notes: "", reason: "", date: format(new Date(), 'yyyy-MM-dd') });
      fetchData();
    } catch (error) {
      alert("Gagal menyimpan data.");
    }
  };

  const handleWaive = async (punishmentId: string) => {
    if(!confirm("Yakin ingin menganulir (waive) denda ini?")) return;
    try {
      const reason = prompt("Alasan Penganuliran (Override Reason):", "Salah input");
      if (!reason) return;
      await api.put(`/v1/deductions/punishments/${punishmentId}/waive`, { override_reason: reason });
      fetchData();
    } catch (error) {
      alert("Gagal menganulir denda.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-900">
      <div className="flex-none p-4 md:p-6 border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Potongan & Kasbon</h1>
              <p className="text-slate-400 text-sm">Kelola potongan gaji karyawan secara sistematis.</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {activeTab === "kasbon" ? "Tambah Kasbon" : "Tambah Denda"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-slate-800/50 backdrop-blur-xl rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('kasbon')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'kasbon' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Coins className="w-4 h-4" />
              Kasbon (Pinjaman)
            </button>
            <button
              onClick={() => setActiveTab('denda')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'denda' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Denda (Punishment)
            </button>
          </div>

          {/* Table Kasbon */}
          {activeTab === 'kasbon' && (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700/50">
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Karyawan</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Total Pinjaman</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Cicilan/Bulan</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Sisa Tagihan</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Tgl Dibuat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {cashAdvances.map((ca, i) => (
                      <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{ca.user?.name}</div>
                          <div className="text-xs text-slate-400">{ca.user?.role}</div>
                        </td>
                        <td className="p-4 text-slate-300">Rp {parseFloat(ca.amount).toLocaleString('id-ID')}</td>
                        <td className="p-4 text-slate-300">Rp {parseFloat(ca.monthly_deduction).toLocaleString('id-ID')} ({ca.installment_months}x)</td>
                        <td className="p-4 text-indigo-400 font-medium">Rp {parseFloat(ca.remaining_balance).toLocaleString('id-ID')}</td>
                        <td className="p-4">
                          {ca.status === 'active' ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">Berjalan</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3"/> Lunas</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-slate-400">{format(new Date(ca.created_at), 'dd MMM yyyy', { locale: id })}</td>
                      </tr>
                    ))}
                    {cashAdvances.length === 0 && !loading && (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada catatan kasbon.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Table Denda */}
          {activeTab === 'denda' && (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700/50">
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Tgl Kejadian</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Karyawan</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Nominal Denda</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Alasan</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {punishments.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                        <td className="p-4 text-sm text-slate-300">{format(new Date(p.date), 'dd MMM yyyy', { locale: id })}</td>
                        <td className="p-4">
                          <div className="font-medium text-white">{p.user?.name}</div>
                          <div className="text-xs text-slate-400">{p.user?.role}</div>
                        </td>
                        <td className="p-4 text-rose-400 font-medium">Rp {parseFloat(p.amount).toLocaleString('id-ID')}</td>
                        <td className="p-4 text-slate-300 text-sm max-w-xs truncate" title={p.reason}>{p.reason}</td>
                        <td className="p-4">
                          {p.status === 'pending' && <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">Menunggu Cut-off</span>}
                          {p.status === 'deducted' && <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">Terpotong (Gaji)</span>}
                          {p.status === 'waived' && (
                            <div>
                              <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 text-xs font-medium line-through">Dianulir</span>
                              <div className="text-[10px] text-slate-500 mt-1">oleh: {p.overrider?.name}</div>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {p.status === 'pending' && (
                            <button onClick={() => handleWaive(p.id)} className="text-xs text-slate-400 hover:text-white underline">Waive</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {punishments.length === 0 && !loading && (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada catatan denda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">
                {activeTab === 'kasbon' ? 'Input Kasbon Baru' : 'Input Denda Baru'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Karyawan</label>
                  <select 
                    required
                    value={formData.user_id}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="">Pilih Karyawan...</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nominal (Rp)</label>
                  <input 
                    type="number" required min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>

                {activeTab === 'kasbon' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Lama Cicilan (Bulan)</label>
                      <input 
                        type="number" required min="1" max="24"
                        value={formData.installment_months}
                        onChange={(e) => setFormData({...formData, installment_months: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">Potongan per bulan: Rp {formData.amount && formData.installment_months ? (parseFloat(formData.amount) / parseInt(formData.installment_months)).toLocaleString('id-ID') : 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Keterangan / Tujuan</label>
                      <textarea 
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                        rows={2}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Tanggal Kejadian</label>
                      <input 
                        type="date" required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Alasan Denda (Ex: Baju Customer Luntur)</label>
                      <textarea 
                        required
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                        rows={2}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
                    Batal
                  </button>
                  <button type="submit" className={`px-6 py-2 text-white font-medium rounded-xl transition-colors ${activeTab === 'kasbon' ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                    Simpan
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
