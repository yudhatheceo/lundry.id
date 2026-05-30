"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  UserPlus,
  ShieldCheck,
  Mail,
  Phone,
  Briefcase,
  ToggleRight,
  ToggleLeft,
  MoreVertical,
  KeyRound,
  Banknote,
  Gift,
  Clock,
  IdCard,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { User } from "@/types";
import { useAuthStore } from "@/lib/store/useAuthStore";

const ROLE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  owner: { label: "Owner", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  manager: { label: "Manager", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  admin_hr: { label: "Admin HR", bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20" },
  cashier: { label: "Kasir", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  courier: { label: "Kurir", bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  staff: { label: "Staff Produksi", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  driver: { label: "Driver", bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
};

export default function StaffListPage() {
  const { user: currentUser } = useAuthStore();
  const [staff, setStaff] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom delete confirmation states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff",
    password: "",
    employee_type: "tetap",
    employee_status: "active",
    shift_id: "",
    base_salary: 0,
    meal_allowance: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [staffRes, shiftRes] = await Promise.all([
          api.get("/v1/staff"),
          api.get("/v1/staff/shifts")
        ]);
        setStaff(staffRes.data?.data || staffRes.data || []);
        setShifts(shiftRes.data?.data || shiftRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        outlet_id: currentUser?.outlet_id || "01krxvceaqfftv04hsbmwn7vya", 
        ...formData,
        shift_id: formData.shift_id ? parseInt(formData.shift_id) : null
      };

      if (isEditMode && editingId) {
        if (!payload.password) delete payload.password;
        const res = await api.put(`/v1/staff/${editingId}`, payload);
        const updatedStaff = res.data?.data || res.data;
        setStaff(staff.map(s => s.id === editingId ? updatedStaff : s));
      } else {
        const res = await api.post("/v1/staff", payload);
        const newStaff = res.data?.data || res.data;
        if (newStaff) {
            setStaff([newStaff, ...staff]);
        }
      }
      
      setShowAddModal(false);
      setFormData({ 
        name: "", email: "", phone: "", role: "staff", password: "", 
        employee_type: "tetap", employee_status: "active", shift_id: "", base_salary: 0, meal_allowance: 0 
      });
      setIsEditMode(false);
      setEditingId(null);
    } catch (err: any) {
        let msg = err.response?.data?.message || "Gagal menambah staf";
        if (err.response?.status === 422 && err.response?.data?.errors) {
            msg += ": " + Object.values(err.response.data.errors).flat().join(", ");
        }
        alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      await api.put(`/v1/staff/${staffId}`, { employee_status: currentStatus ? "inactive" : "active" });
      setStaff(staff.map(s => s.id === staffId ? { ...s, is_active: !currentStatus } : s));
    } catch (err) {
      alert("Gagal mengubah status akses.");
    }
  };

  const handleDeleteClick = (staffId: string) => {
    setDeleteTargetId(staffId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/v1/staff/${deleteTargetId}`);
      setStaff(staff.filter(s => s.id !== deleteTargetId));
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menghapus staf.");
    }
  };

  const handleEditClick = (staffObj: any) => {
    setIsEditMode(true);
    setEditingId(staffObj.id);
    setFormData({
      name: staffObj.name || "",
      email: staffObj.email || "",
      phone: staffObj.phone || "",
      role: staffObj.role || "staff",
      password: "", // Leave blank unless they want to change it
      employee_type: staffObj.employee_type || "tetap",
      employee_status: staffObj.is_active ? "active" : "inactive",
      shift_id: staffObj.shift_id ? String(staffObj.shift_id) : "",
      base_salary: staffObj.base_salary || 0,
      meal_allowance: staffObj.meal_allowance || 0,
    });
    setShowAddModal(true);
  };

  const filteredStaff = staff.filter(s => 
    !search || 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.referral_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-12 relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl -z-0" />

      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/app" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-400" />
                <span className="font-heading text-base md:text-lg font-black tracking-tight">Manajemen Staf & HR</span>
              </div>
              <p className="text-[10px] text-slate-400">Hak Akses & Data Karyawan</p>
            </div>
          </div>

          {currentUser && ["owner", "manager", "admin_hr"].includes(currentUser.role) && (
            <Button 
              onClick={() => {
                setIsEditMode(false);
                setEditingId(null);
                setFormData({ name: "", email: "", phone: "", role: "staff", password: "", employee_type: "tetap", employee_status: "active", shift_id: "", base_salary: 0, meal_allowance: 0 });
                setShowAddModal(true);
              }}
              className="rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden md:inline">Tambah Karyawan</span>
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 relative z-10 space-y-6 max-w-6xl">
        
        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Cari nama, email, atau kode referral..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl text-white text-base focus:border-red-500/50 focus:ring-red-500/20"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-3 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : filteredStaff.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredStaff.map((s, idx) => {
              if (!s) return null;
              const roleConf = ROLE_CONFIG[s?.role] || { label: s?.role || 'Unknown', bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" };
              
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white/5 border ${s.is_active ? 'border-white/10' : 'border-red-900/30 opacity-70'} rounded-3xl p-5 hover:bg-white/[0.07] transition-all relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
                    {currentUser && ["owner", "manager", "admin_hr"].includes(currentUser.role) && (
                      <button onClick={() => handleEditClick(s)} className="text-slate-500 hover:text-[#4DA8FF] transition-colors text-xs font-bold border border-slate-500/30 px-2 py-1 rounded">
                        Edit
                      </button>
                    )}
                    {currentUser && ["owner", "manager"].includes(currentUser.role) && s.id !== currentUser?.id && (
                      <button onClick={() => handleDeleteClick(s.id)} className="text-slate-500 hover:text-red-400 transition-colors bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-2 py-1 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-lg text-white leading-tight">{s.name}</h3>
                          {s.id === currentUser?.id && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${roleConf.bg} ${roleConf.border} ${roleConf.text}`}>
                            {roleConf.label}
                          </span>
                          {s.employee_type && (
                             <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-white/10 text-white border border-white/20">
                               {s.employee_type.replace('_', ' ')}
                             </span>
                          )}
                          {!s.is_active && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30">
                              Non-Aktif
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 mt-4">
                           {s.referral_code && (
                            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold font-mono">
                              <Gift className="h-3.5 w-3.5" />
                              <span>Referral: {s.referral_code}</span>
                            </div>
                           )}
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{s.email}</span>
                          </div>
                          {s.phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{s.phone}</span>
                            </div>
                          )}
                          {s.shift && (
                             <div className="flex items-center gap-2 text-xs text-slate-400">
                               <Clock className="h-3.5 w-3.5" />
                               <span>Shift {s.shift.name} ({s.shift.start_time.substring(0,5)} - {s.shift.end_time.substring(0,5)})</span>
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Toggle Action */}
                    <div className="sm:border-l sm:border-white/10 sm:pl-5 flex flex-col justify-center gap-2 pt-4 sm:pt-0 border-t border-white/10 sm:border-t-0 mt-2 sm:mt-0">
                      <div className="text-center sm:text-left">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Akses Login</p>
                        <button 
                          onClick={() => handleToggleStatus(s.id, s.is_active)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all w-full justify-center sm:justify-start ${
                            s.is_active 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                              : "bg-slate-500/10 border-slate-500/30 text-slate-400 hover:bg-slate-500/20"
                          }`}
                        >
                          {s.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          {s.is_active ? "Terbuka" : "Terkunci"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <ShieldCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Data staf tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl p-6 bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl relative my-8"
            >
              <h4 className="font-heading text-lg font-black mb-6 flex items-center gap-2">
                <IdCard className="h-5 w-5 text-red-400" />
                {isEditMode ? "Edit Profil Karyawan" : "Registrasi Karyawan Baru"}
              </h4>
              <form onSubmit={handleAddSubmit} className="space-y-6">
                
                {/* Personal Info */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-white border-b border-white/10 pb-2">Informasi Pribadi & Login</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap *</label>
                      <Input 
                        required
                        placeholder="Contoh: Rendi Wijaya"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-xl focus:border-red-500/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Login *</label>
                      <Input 
                        required
                        type="email"
                        placeholder="rendi@lundry.id"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-xl focus:border-red-500/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp *</label>
                      <Input 
                        required
                        placeholder="628..."
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-xl focus:border-red-500/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password Login {isEditMode ? "(Opsional)" : "*"}</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <Input 
                          required={!isEditMode}
                          type="text"
                          placeholder={isEditMode ? "Kosongkan jika tidak ingin diubah" : "Minimal 6 karakter"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="bg-white/5 border-white/10 rounded-xl focus:border-red-500/50 h-11 pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* HR & Pekerjaan */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-white border-b border-white/10 pb-2">Informasi Kepegawaian</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role Sistem *</label>
                      <select 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-white focus:border-red-500/50 focus:outline-none appearance-none text-sm"
                      >
                        <option value="staff" className="bg-slate-900 text-white">Staff Produksi</option>
                        <option value="cashier" className="bg-slate-900 text-white">Kasir POS</option>
                        <option value="courier" className="bg-slate-900 text-white">Kurir (Scanner)</option>
                        <option value="driver" className="bg-slate-900 text-white">Driver Lintas</option>
                        {currentUser?.role === "owner" && (
                          <>
                            <option value="admin_hr" className="bg-slate-900 text-white">Admin HR</option>
                            <option value="manager" className="bg-slate-900 text-white">Manager Outlet</option>
                            <option value="owner" className="bg-slate-900 text-white">System Owner</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipe Karyawan *</label>
                      <select 
                        value={formData.employee_type}
                        onChange={(e) => setFormData({...formData, employee_type: e.target.value})}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-white focus:border-red-500/50 focus:outline-none appearance-none text-sm"
                      >
                        <option value="tetap" className="bg-slate-900 text-white">Tetap</option>
                        <option value="kontrak" className="bg-slate-900 text-white">Kontrak</option>
                        <option value="paruh_waktu" className="bg-slate-900 text-white">Paruh Waktu (Part-time)</option>
                        <option value="borongan" className="bg-slate-900 text-white">Borongan</option>
                        <option value="magang" className="bg-slate-900 text-white">Magang (Intern)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jadwal Shift</label>
                      <select 
                        value={formData.shift_id}
                        onChange={(e) => setFormData({...formData, shift_id: e.target.value})}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-white focus:border-red-500/50 focus:outline-none appearance-none text-sm"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">-- Pilih Shift --</option>
                        {shifts.map(s => (
                           <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.name} ({s.start_time.substring(0,5)} - {s.end_time.substring(0,5)})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Kompensasi */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-white border-b border-white/10 pb-2">Kompensasi (Opsional)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gaji Pokok</label>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <Input 
                          type="number"
                          placeholder="0"
                          value={formData.base_salary}
                          onChange={(e) => setFormData({...formData, base_salary: parseFloat(e.target.value) || 0})}
                          className="bg-white/5 border-white/10 rounded-xl focus:border-red-500/50 h-11 pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Uang Makan / Harian</label>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <Input 
                          type="number"
                          placeholder="0"
                          value={formData.meal_allowance}
                          onChange={(e) => setFormData({...formData, meal_allowance: parseFloat(e.target.value) || 0})}
                          className="bg-white/5 border-white/10 rounded-xl focus:border-red-500/50 h-11 pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
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
                    className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black tracking-widest uppercase text-xs shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {isSubmitting ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan" : "Simpan Karyawan")}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* Custom Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h4 className="font-heading text-lg font-black mb-2 text-white">Hapus Karyawan?</h4>
              <p className="text-sm text-slate-400 mb-6">Apakah Anda yakin ingin menghapus karyawan ini secara permanen? Tindakan ini tidak dapat dibatalkan.</p>
              
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTargetId(null);
                  }}
                  className="flex-1 h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 font-bold text-xs"
                >
                  Batal
                </Button>
                <Button 
                  type="button" 
                  onClick={confirmDelete}
                  className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black tracking-widest uppercase text-xs shadow-lg shadow-red-500/20"
                >
                  Hapus
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
