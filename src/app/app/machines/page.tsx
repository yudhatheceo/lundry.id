"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft,
  Timer,
  Activity,
  AlertTriangle,
  Plus,
  RefreshCw,
  Wrench,
  CheckCircle2,
  Calendar,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function MachinesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [machines, setMachines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  
  // Batch Input State
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchInputs, setBatchInputs] = useState<Record<string, number>>({});
  
  // Maintenance State
  const [mtDate, setMtDate] = useState(new Date().toISOString().split('T')[0]);
  const [mtType, setMtType] = useState('cleaning_drum');
  const [mtCost, setMtCost] = useState('');
  const [mtNotes, setMtNotes] = useState('');

  // Add Machine State
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [newMachine, setNewMachine] = useState({
    asset_id: '', device_id: ''
  });

  const fetchMachines = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/v1/machines');
      const payload = res.data || [];
      setMachines(payload);
      
      // Initialize batch inputs
      const initialBatch: Record<string, number> = {};
      payload.forEach((m: any) => {
        initialBatch[m.id] = 0;
      });
      setBatchInputs(initialBatch);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableAssets = async () => {
    try {
      const res = await api.get('/v1/machines/available-assets');
      const payload = res.data || [];
      setAvailableAssets(payload);
      if (payload.length > 0) {
        setNewMachine(prev => ({ ...prev, asset_id: payload[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const totalActive = machines.filter(m => m.condition === 'good' || m.condition === 'fair').length;
  const totalTodayCycle = machines.reduce((acc, m) => acc + (Number(m.today_cycles) || 0), 0);
  const totalNeedsMaintenance = machines.filter(m => {
    // Basic logic: if lifetime cycle is > 500 since last maintenance (simplified here to just > 500 total)
    // Actually, we could calculate if (lifetime_cycles % 500) > 400 or something. 
    // Let's just say if lifetime > 500 and no maintenance recently, or just randomly mark for demo if not complex.
    return (Number(m.lifetime_cycles) || 0) > 500;
  }).length;

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const logs = Object.entries(batchInputs).map(([id, count]) => ({
        asset_id: id,
        cycle_count: count
      }));
      
      await api.post('/v1/machines/cycle-logs/batch', {
        date: batchDate,
        logs: logs
      });
      
      alert('Berhasil menyimpan siklus harian!');
      setShowBatchModal(false);
      fetchMachines();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan.');
    }
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;
    
    try {
      await api.post(`/v1/machines/${selectedMachine.id}/maintenance`, {
        maintenance_date: mtDate,
        maintenance_type: mtType,
        cost: Number(mtCost) || 0,
        notes: mtNotes
      });
      
      alert('Log perawatan berhasil disimpan!');
      setShowMaintenanceModal(false);
      setSelectedMachine(null);
      fetchMachines();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan.');
    }
  };

  const handleAddMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/v1/machines', newMachine);
      alert('Mesin berhasil diregistrasi!');
      setShowAddMachineModal(false);
      setNewMachine({ asset_id: '', device_id: '' });
      fetchMachines();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan mesin. Cek kembali data atau Device ID.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/v1/machines/${id}/status`, {
        is_active: !currentStatus
      });
      fetchMachines();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status mesin.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/app" className="h-10 w-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center border border-white/10 transition-all">
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <Timer className="h-6 w-6 md:h-8 md:w-8 text-[#4DA8FF]" />
              Manajemen Mesin <span className="text-[10px] bg-[#4DA8FF]/20 text-[#4DA8FF] px-2 py-0.5 rounded uppercase tracking-wider ml-2">IoT Ready</span>
            </h1>
            <p className="text-slate-400 text-sm">Catat putaran mesin harian &amp; jadwal servis.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              fetchAvailableAssets();
              setShowAddMachineModal(true);
            }}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Mesin</span>
          </button>
          <button 
            onClick={() => setShowBatchModal(true)}
            className="bg-[#4DA8FF] hover:bg-[#4DA8FF]/90 text-slate-950 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#4DA8FF]/20"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Input Cycle Shift</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Mesin Aktif</h3>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{totalActive} <span className="text-sm font-normal text-slate-400">Unit</span></p>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#4DA8FF]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Cycle Hari Ini</h3>
            <div className="h-10 w-10 rounded-xl bg-[#4DA8FF]/10 flex items-center justify-center text-[#4DA8FF]">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{totalTodayCycle} <span className="text-sm font-normal text-slate-400">Putaran</span></p>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Perlu Servis</h3>
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-red-400">{totalNeedsMaintenance} <span className="text-sm font-normal text-slate-400">Mesin</span></p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-400" />
            Status Real-time Mesin
          </h2>
          <button onClick={fetchMachines} className="text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 font-semibold text-slate-300">Nama Mesin</th>
                <th className="p-4 font-semibold text-slate-300">Status</th>
                <th className="p-4 font-semibold text-slate-300">Cycle Hari Ini</th>
                <th className="p-4 font-semibold text-slate-300">Total Lifetime</th>
                <th className="p-4 font-semibold text-slate-300">Terakhir Servis</th>
                <th className="p-4 font-semibold text-slate-300 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Memuat data mesin...</td>
                </tr>
              ) : machines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Belum ada data mesin di manajemen aset.</td>
                </tr>
              ) : (
                machines.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.brand} • IoT: {m.device_id || '-'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          m.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {m.is_active ? 'Aktif' : 'Non-Aktif'}
                        </span>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-white/5 ${
                          m.condition === 'good' ? 'text-emerald-400' :
                          m.condition === 'fair' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {m.condition}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-lg">{m.today_cycles || 0}</span>
                        <span className="text-[10px] text-slate-500 uppercase">Putaran</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">{m.lifetime_cycles || 0}</span>
                        {Number(m.lifetime_cycles) > 500 && (
                          <span title="Over 500 cycles">
                            <AlertTriangle className="h-3 w-3 text-red-400" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      {m.maintenances && m.maintenances.length > 0 ? (
                        m.maintenances[0].maintenance_date
                      ) : (
                        <span className="italic">Belum pernah</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(m.id, m.is_active)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                            m.is_active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {m.is_active ? 'Non-Aktifkan' : 'Aktifkan'}
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedMachine(m);
                            setShowMaintenanceModal(true);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Wrench className="h-3.5 w-3.5" />
                          Servis
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Input Modal */}
      <AnimatePresence>
        {showBatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative"
            >
              <h2 className="text-xl font-black mb-1">Input Siklus Harian</h2>
              <p className="text-slate-400 text-xs mb-6">Isi jumlah putaran mesin yang berjalan di shift ini.</p>
              
              <form onSubmit={handleBatchSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Tanggal Pencatatan</label>
                  <input 
                    type="date" 
                    value={batchDate}
                    onChange={(e) => setBatchDate(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#4DA8FF]"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-4 max-h-[40vh] overflow-y-auto">
                  {machines.filter(m => m.condition !== 'disposed').map(m => (
                    <div key={m.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-white">{m.name}</p>
                        <p className="text-[10px] text-slate-500">{m.brand}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => setBatchInputs(prev => ({...prev, [m.id]: Math.max(0, (prev[m.id] || 0) - 1)}))}
                          className="h-8 w-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"
                        >-</button>
                        <input 
                          type="number"
                          value={batchInputs[m.id] || 0}
                          onChange={(e) => setBatchInputs(prev => ({...prev, [m.id]: parseInt(e.target.value) || 0}))}
                          className="w-12 h-8 text-center bg-transparent border-none text-white font-black"
                        />
                        <button 
                          type="button"
                          onClick={() => setBatchInputs(prev => ({...prev, [m.id]: (prev[m.id] || 0) + 1}))}
                          className="h-8 w-8 rounded bg-[#4DA8FF]/20 text-[#4DA8FF] hover:bg-[#4DA8FF]/30 flex items-center justify-center"
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowBatchModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 font-bold hover:bg-white/5">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-[#4DA8FF] text-slate-950 font-black hover:bg-[#4DA8FF]/90">
                    Simpan Semua
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Maintenance Modal */}
      <AnimatePresence>
        {showMaintenanceModal && selectedMachine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative"
            >
              <h2 className="text-xl font-black mb-1 text-white">Catat Servis Mesin</h2>
              <p className="text-slate-400 text-xs mb-6 font-bold text-[#4DA8FF]">{selectedMachine.name}</p>
              
              <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Tanggal Servis</label>
                  <input 
                    type="date" 
                    value={mtDate}
                    onChange={(e) => setMtDate(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#4DA8FF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Jenis Perawatan</label>
                  <select 
                    value={mtType}
                    onChange={(e) => setMtType(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#4DA8FF]"
                  >
                    <option value="cleaning_drum">Pembersihan Tabung (Cleaning Drum)</option>
                    <option value="v_belt_replacement">Ganti V-Belt</option>
                    <option value="general_service">Servis Rutin / Umum</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Biaya Servis (Opsional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
                    <input 
                      type="number" 
                      value={mtCost}
                      onChange={(e) => setMtCost(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white outline-none focus:border-[#4DA8FF]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Catatan Teknisi</label>
                  <textarea 
                    value={mtNotes}
                    onChange={(e) => setMtNotes(e.target.value)}
                    placeholder="Contoh: Diganti dinamo baru merk LG..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#4DA8FF] min-h-[80px]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowMaintenanceModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 font-bold hover:bg-white/5">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-[#4DA8FF] text-slate-950 font-black hover:bg-[#4DA8FF]/90">
                    Simpan Servis
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Machine Modal */}
      <AnimatePresence>
        {showAddMachineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-black mb-1 text-white">Registrasi Mesin</h2>
              <p className="text-slate-400 text-xs mb-6">Pilih aset kategori 'mesin' yang belum didaftarkan untuk dikelola putaran dan perawatannya.</p>
              
              <form onSubmit={handleAddMachine} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Pilih Aset *</label>
                  {availableAssets.length === 0 ? (
                    <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20">
                      Tidak ada aset mesin yang tersedia. Silakan catat aset terlebih dahulu di menu <strong>Manajemen Aset</strong>.
                    </div>
                  ) : (
                    <select
                      value={newMachine.asset_id}
                      onChange={(e) => setNewMachine({...newMachine, asset_id: e.target.value})}
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#4DA8FF]"
                    >
                      {availableAssets.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.brand || 'No Brand'})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Nomor Seri IoT (Device ID) *</label>
                  <input 
                    type="text" 
                    value={newMachine.device_id}
                    onChange={(e) => setNewMachine({...newMachine, device_id: e.target.value})}
                    required
                    placeholder="Mencegah double deploy hardware IoT"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#4DA8FF]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddMachineModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 font-bold hover:bg-white/5">
                    Batal
                  </button>
                  <button type="submit" disabled={availableAssets.length === 0} className="flex-1 py-2 rounded-lg bg-[#4DA8FF] text-slate-950 font-black hover:bg-[#4DA8FF]/90 disabled:opacity-50">
                    Registrasi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
