"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Order, BagStatus } from "@/types";
import { ArrowLeft, Loader2, Save, User, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";

const BAG_STATUSES: { value: BagStatus; label: string }[] = [
  { value: "received", label: "Diterima Kasir" },
  { value: "sorting", label: "Proses Sortir" },
  { value: "washing", label: "Proses Cuci" },
  { value: "drying", label: "Proses Pengeringan" },
  { value: "ironing", label: "Proses Setrika" },
  { value: "packing", label: "Pengemasan / QC" },
  { value: "ready_for_pickup", label: "Siap Diambil" },
  { value: "transit_to_customer", label: "Transit Kurir" },
  { value: "delivered", label: "Selesai / Diterima" },
];

export default function ManualAssignmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [staffList, setStaffList] = useState<{ id: string; name: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const user = useAuthStore((state) => state.user);

  // State form assignments
  // bagId -> { status_to, staff_id, notes }
  const [assignments, setAssignments] = useState<Record<string, { status_to: BagStatus; staff_id: string; notes: string }>>({});

  useEffect(() => {
    // Only authorized roles
    if (user && !['owner', 'manager', 'cashier'].includes(user.role)) {
      router.push('/app/orders');
      return;
    }

    const fetchData = async () => {
      try {
        const [orderRes, staffRes] = await Promise.all([
          api.get(`/v1/orders/${params.id}`),
          api.get("/v1/staff/active")
        ]);
        
        const fetchedOrder = orderRes.data?.data || orderRes.data;
        setOrder(fetchedOrder);
        setStaffList(staffRes.data?.data || []);

        // Initialize form state
        const initialForm: Record<string, any> = {};
        const bags = fetchedOrder.qr_bags || fetchedOrder.qrBags || [];
        bags.forEach((bag: any) => {
          // Determine next logical status
          const currentIdx = BAG_STATUSES.findIndex(s => s.value === bag.current_status);
          const nextStatus = currentIdx !== -1 && currentIdx < BAG_STATUSES.length - 1 
            ? BAG_STATUSES[currentIdx + 1].value 
            : bag.current_status;

          initialForm[bag.id] = {
            status_to: nextStatus,
            staff_id: "",
            notes: ""
          };
        });
        setAssignments(initialForm);
      } catch (err) {
        setError("Gagal memuat data. Pastikan jaringan stabil.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, user, router]);

  const handleAssign = async (bagId: string, estimatedWeight: number, estimatedPcs: number) => {
    const data = assignments[bagId];
    if (!data.staff_id) {
      alert("Silakan pilih staf terlebih dahulu!");
      return;
    }

    setSaving(bagId);
    setError("");
    setSuccess("");

    try {
      // Determine validation_type
      let vType = "handoff_out";
      if (["washing", "drying", "ironing"].includes(data.status_to)) vType = "handoff_in";
      else if (data.status_to === "packing") vType = "qc_check";
      else if (data.status_to === "ready_for_pickup") vType = "final_check";

      const payload = {
        status_to: data.status_to,
        validation_type: vType,
        validated_weight: estimatedWeight, // Auto fill matching estimate since it's an override
        validated_pcs: estimatedPcs,
        staff_id: data.staff_id,
        notes: "Manual Assignment Overridden",
      };

      await api.post(`/v1/bags/${bagId}/validate`, payload);
      setSuccess(`Berhasil assign kantong ke tahap ${data.status_to}.`);
      
      // Refresh order to get updated bag status
      const orderRes = await api.get(`/v1/orders/${params.id}`);
      setOrder(orderRes.data?.data || orderRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan assignment.");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!order) return null;
  const qrBags = (order as any).qr_bags || (order as any).qrBags || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-12 relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-3xl -z-0" />

      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/app/orders" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-heading text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-500" />
              Manual Assignment Produksi
            </h1>
            <p className="text-[10px] text-slate-400">Order: {order.order_number} · Pelanggan: {order.customer?.name}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-4xl space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Warning Fallback */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
          ⚠ Fitur ini adalah sistem fallback. Digunakan hanya jika sistem QR Code bermasalah. Manajer/Kasir yang melakukan assignment ini mem-bypass validasi timbangan aktual.
        </div>

        <div className="space-y-4">
          {qrBags.length > 0 ? qrBags.map((bag: any, i: number) => {
            const form = assignments[bag.id] || { status_to: bag.current_status, staff_id: "" };
            const isDelivered = bag.current_status === 'delivered';

            return (
              <div key={bag.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-6 backdrop-blur-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">Kantong #{i + 1} <span className="text-slate-500 font-mono text-xs ml-2">{bag.qr_code_string}</span></h3>
                    <p className="text-xs text-slate-400">Status Saat Ini: <span className="text-[#4DA8FF] uppercase font-bold tracking-wider">{bag.current_status}</span></p>
                    <p className="text-[10px] text-slate-500 mt-1">Estimasi: {bag.estimated_weight} kg | {bag.estimated_pcs} pcs</p>
                  </div>
                  {isDelivered && (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/30 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Selesai
                    </span>
                  )}
                </div>

                {!isDelivered && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Assign Ke Tahap:</label>
                      <select 
                        value={form.status_to}
                        onChange={(e) => setAssignments(prev => ({ ...prev, [bag.id]: { ...prev[bag.id], status_to: e.target.value as BagStatus } }))}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                      >
                        {BAG_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-5">
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Tugaskan Kepada (Staf):</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <select 
                          value={form.staff_id}
                          onChange={(e) => setAssignments(prev => ({ ...prev, [bag.id]: { ...prev[bag.id], staff_id: e.target.value } }))}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none appearance-none"
                        >
                          <option value="">-- Pilih Staf --</option>
                          {staffList.map(st => (
                            <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="md:col-span-3 flex items-end">
                      <Button
                        onClick={() => handleAssign(bag.id, bag.estimated_weight, bag.estimated_pcs)}
                        disabled={saving === bag.id || !form.staff_id}
                        className="w-full h-[42px] rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                      >
                        {saving === bag.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Terapkan
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              Tidak ada data kantong untuk order ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
