"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Filter,
  ClipboardList,
  Eye,
  Ban,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Package,
  AlertCircle,
  Printer,
  X
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Order, OrderStatus } from "@/types";
import { ReceiptCard } from "@/components/ReceiptCard";
import { useAuthStore } from "@/lib/store/useAuthStore";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  received: { label: "Diterima", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  processing: { label: "Diproses", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  ready_for_pickup: { label: "Siap Ambil", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  delivered: { label: "Selesai", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
  voided: { label: "Dibatalkan", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

// Mock data untuk staging
const MOCK_ORDERS: Order[] = [
  {
    id: "01krxvcf2ndjpqwkxmcwy5wt9a",
    outlet_id: "01krxvceaqfftv04hsbmwn7vya",
    customer_id: "01krxvcf2ndjpqwkxmcwy5wt7e",
    drop_point_id: null,
    order_number: "LND-20260519-0001",
    status: "received",
    payment_status: "paid",
    estimated_weight: 3.5,
    final_weight: null,
    total_amount: 28000,
    discount_amount: 0,
    final_amount: 28000,
    paid_amount: 28000,
    remaining_amount: 0,
    pickup_delivery_method: "self",
    estimated_completion_at: "2026-05-22T10:00:00Z",
    notes: "Pisahkan baju putih",
    created_at: "2026-05-19T04:30:00Z",
    customer: {
      id: "01krxvcf2ndjpqwkxmcwy5wt7e",
      outlet_id: "01krxvceaqfftv04hsbmwn7vya",
      name: "Yudha The CEO",
      phone: "628113683131",
      address: "Mastrip Campus Area, Jember",
      wash_preference: "Wangi Lavender",
      membership_tier: "gold",
      prepaid_balance: 750000,
      coin_balance: 120,
      referral_code: "THEBEACON01",
      created_at: "2026-05-18T18:00:00Z",
    },
    items: [
      { id: "i1", order_id: "01krxvcf2ndjpqwkxmcwy5wt9a", service_name: "Cuci Setrika Regular", price_per_unit: 8000, quantity: 3.5, subtotal: 28000, created_at: "2026-05-19T04:30:00Z" },
    ],
  },
  {
    id: "01krxvcf2ndjpqwkxmcwy5wt9b",
    outlet_id: "01krxvceaqfftv04hsbmwn7vya",
    customer_id: "01krxvcf2ndjpqwkxmcwy5wt8f",
    drop_point_id: null,
    order_number: "LND-20260519-0002",
    status: "processing",
    payment_status: "paid",
    estimated_weight: 5.0,
    final_weight: 4.8,
    total_amount: 80000,
    discount_amount: 5000,
    final_amount: 75000,
    paid_amount: 75000,
    remaining_amount: 0,
    pickup_delivery_method: "courier",
    estimated_completion_at: "2026-05-20T08:00:00Z",
    notes: null,
    created_at: "2026-05-19T06:00:00Z",
    customer: {
      id: "01krxvcf2ndjpqwkxmcwy5wt8f",
      outlet_id: "01krxvceaqfftv04hsbmwn7vya",
      name: "Nala Larasati",
      phone: "6281234567890",
      address: "Sumbersari, Jember",
      wash_preference: "Pewangi Sakura",
      membership_tier: "silver",
      prepaid_balance: 120000,
      coin_balance: 45,
      referral_code: "NALA99",
      created_at: "2026-05-18T19:00:00Z",
    },
    items: [
      { id: "i2", order_id: "01krxvcf2ndjpqwkxmcwy5wt9b", service_name: "Cuci Setrika Express", price_per_unit: 16000, quantity: 5.0, subtotal: 80000, created_at: "2026-05-19T06:00:00Z" },
    ],
  },
  {
    id: "01krxvcf2ndjpqwkxmcwy5wt9c",
    outlet_id: "01krxvceaqfftv04hsbmwn7vya",
    customer_id: "01krxvcf2ndjpqwkxmcwy5wt7e",
    drop_point_id: null,
    order_number: "LND-20260518-0005",
    status: "ready_for_pickup",
    payment_status: "unpaid",
    estimated_weight: 2.0,
    final_weight: 2.0,
    total_amount: 50000,
    discount_amount: 0,
    final_amount: 50000,
    paid_amount: 0,
    remaining_amount: 50000,
    pickup_delivery_method: "self",
    estimated_completion_at: "2026-05-19T14:00:00Z",
    notes: "Cuci 3 jam kilat",
    created_at: "2026-05-18T11:00:00Z",
    customer: {
      id: "01krxvcf2ndjpqwkxmcwy5wt7e",
      outlet_id: "01krxvceaqfftv04hsbmwn7vya",
      name: "Yudha The CEO",
      phone: "628113683131",
      address: "Mastrip Campus Area, Jember",
      wash_preference: "Wangi Lavender",
      membership_tier: "gold",
      prepaid_balance: 750000,
      coin_balance: 120,
      referral_code: "THEBEACON01",
      created_at: "2026-05-18T18:00:00Z",
    },
    items: [
      { id: "i3", order_id: "01krxvcf2ndjpqwkxmcwy5wt9c", service_name: "Cuci Setrika 3 Jam Kilat", price_per_unit: 25000, quantity: 2.0, subtotal: 50000, created_at: "2026-05-18T11:00:00Z" },
    ],
  },
];

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  const user = useAuthStore((state) => state.user);
  const isCashier = user?.role === 'cashier';

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/v1/orders");
        setOrders(res.data || []);
      } catch {
        // Fallback mock
        setOrders(MOCK_ORDERS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Check if order can be voided (H+0 — same day only)
  const canVoid = (order: Order): boolean => {
    if (order.status === "voided" || order.status === "delivered") return false;
    const orderDate = new Date(order.created_at).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  };

  // Handle void order
  const handleVoid = async (orderId: string) => {
    if (!confirm("Yakin ingin membatalkan order ini? Aksi ini tidak dapat dibatalkan.")) return;
    
    setVoidingId(orderId);
    try {
      await api.patch(`/v1/orders/${orderId}/void`);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "voided" as OrderStatus } : o));
    } catch {
      // Fallback for staging
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "voided" as OrderStatus } : o));
    } finally {
      setVoidingId(null);
    }
  };

  // Filter & search
  const filteredOrders = orders.filter(o => {
    const matchSearch = !search || 
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-12 relative overflow-x-hidden print:overflow-visible">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl -z-0" />

      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/app" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-purple-400" />
                <span className="font-heading text-base md:text-lg font-black tracking-tight">Daftar Order</span>
              </div>
              <p className="text-[10px] text-slate-400">Kelola & pantau semua pesanan</p>
            </div>
          </div>

          <Link href="/app/kasir">
            <Button className="rounded-full bg-secondary hover:bg-secondary/90 text-white font-bold text-xs gap-2">
              + Order Baru
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 relative z-10 space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Cari no. order atau nama pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl text-white text-base"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", "received", "processing", "ready_for_pickup", "delivered", "voided"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all active:scale-95 ${
                  filterStatus === status
                    ? "bg-secondary/15 border-secondary text-[#4DA8FF]"
                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {status === "all" ? "Semua" : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </div>

        {/* Order List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-3 border-[#4DA8FF]/30 border-t-[#4DA8FF] rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order, idx) => {
              const statusConf = STATUS_CONFIG[order.status];
              const isVoidable = canVoid(order);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 hover:bg-white/[0.07] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Order Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono font-black text-sm text-white">{order.order_number}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusConf.bg} ${statusConf.color}`}>
                            {statusConf.label}
                          </span>
                          {order.pickup_delivery_method === "courier" && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-orange-500/10 border border-orange-500/20 text-orange-400 uppercase">
                              Kurir
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>{order.customer?.name || "Tanpa Nama"}</span>
                          <span>·</span>
                          <span>{order.estimated_weight} kg</span>
                          <span>·</span>
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <p className="text-[11px] text-slate-500">
                            {order.items.map(i => i.service_name).join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Right: Amount + Actions */}
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="text-right">
                          <p className="text-lg md:text-xl font-black text-[#4DA8FF]">
                            Rp {parseFloat(String(order.final_amount)).toLocaleString("id-ID")}
                          </p>
                          {order.discount_amount > 0 && (
                            <p className="text-[10px] text-red-400">-Rp {parseFloat(String(order.discount_amount)).toLocaleString("id-ID")}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setPrintingOrder(order)}
                            className="h-10 w-10 md:h-11 md:w-11 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 transition-all active:scale-90"
                            title="Cetak Ulang Receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          {!isCashier && isVoidable && order.status !== "voided" && (
                            <button
                              onClick={() => handleVoid(order.id)}
                              disabled={voidingId === order.id}
                              className="h-10 w-10 md:h-11 md:w-11 rounded-xl border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 active:scale-90"
                              title="Void Order (H+0)"
                            >
                              {voidingId === order.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          {/* Manual Assignment Button */}
                          {(user?.role === 'owner' || user?.role === 'manager' || user?.role === 'cashier') && order.status !== "delivered" && order.status !== "voided" && (
                            <Link href={`/app/orders/${order.id}/assignment`}>
                              <button
                                className="h-10 w-10 md:h-11 md:w-11 rounded-xl border border-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-500/10 transition-all active:scale-90"
                                title="Manual Assignment Produksi"
                              >
                                <ClipboardList className="h-4 w-4" />
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-sm text-slate-400">Tidak ada order ditemukan.</p>
          </div>
        )}

        {/* Void H+0 Info Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-400">Kebijakan Void Order H+0</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Pembatalan order hanya dapat dilakukan pada hari yang sama dengan tanggal pembuatan order (H+0). Tombol void akan otomatis nonaktif untuk order kemarin atau sebelumnya.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Print Selection */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col relative">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-slate-800">
              <h3 className="font-bold text-white">Pilih Jenis Struk</h3>
              <button onClick={() => setPrintingOrder(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Action Print */}
            <div className="p-6 flex flex-col gap-4">
              <Button 
                onClick={() => {
                  window.open(`/app/orders/${printingOrder.id}/receipt-print`, "_blank", "width=400,height=700");
                  setPrintingOrder(null);
                }}
                className="w-full h-14 bg-[#4DA8FF] hover:bg-[#4DA8FF]/90 text-white font-bold rounded-xl text-sm"
              >
                <Printer className="h-5 w-5 mr-2" />
                Cetak Struk Transaksi
              </Button>
              
              <Button 
                onClick={() => {
                  window.open(`/app/orders/${printingOrder.id}/production-receipt`, "_blank", "width=400,height=700");
                  setPrintingOrder(null);
                }}
                className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm"
              >
                <Printer className="h-5 w-5 mr-2" />
                Cetak Struk Produksi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
