"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Printer,
  Package,
  User,
  CreditCard,
  MapPin,
  Clock,
  Shirt,
  MoreVertical,
  CheckCircle,
  Ban,
  Phone,
  QrCode,
  CheckCircle2,
  CalendarDays
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Order, OrderStatus, Payment } from "@/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  received: { label: "Diterima", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  processing: { label: "Diproses", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  ready_for_pickup: { label: "Siap Ambil", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  delivered: { label: "Selesai", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
  voided: { label: "Dibatalkan", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

// Fallback Mock Order untuk Staging
const MOCK_ORDER: Order = {
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
  qr_bags: [
    { id: "qr1", order_id: "01krxvcf2ndjpqwkxmcwy5wt9a", qr_code_string: "LND-BAG-20260519-0001-1-A1B2", bag_index: 1, current_status: "received", created_at: "2026-05-19T04:30:00Z", updated_at: "2026-05-19T04:30:00Z" }
  ]
};

const MOCK_PAYMENT: Payment = {
  id: "p1",
  order_id: "01krxvcf2ndjpqwkxmcwy5wt9a",
  payment_method: "cash",
  amount: 28000,
  status: "success",
  transaction_reference: null,
  created_at: "2026-05-19T04:31:00Z"
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setIsLoading(true);
      try {
        const orderRes = await api.get(`/v1/orders/${orderId}`);
        const orderData = orderRes.data?.data || orderRes.data;
        setOrder(orderData);
        
        // Payments are already eager-loaded in /v1/orders/{id}
        setPayments(orderData.payments || []);

      } catch (err) {
        console.warn("Order API not available or error, falling back to mock data");
        // Simulate loading then mock
        setTimeout(() => {
          setOrder({ ...MOCK_ORDER, id: orderId, order_number: `LND-${orderId.substring(0,6).toUpperCase()}` });
          setPayments([MOCK_PAYMENT]);
          setIsLoading(false);
        }, 600);
        return;
      }
      setIsLoading(false);
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-[#4DA8FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase animate-pulse">Memuat Data Order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-slate-700" />
        <h2 className="text-xl font-bold">Order Tidak Ditemukan</h2>
        <Button onClick={() => router.push("/app/orders")} variant="outline" className="border-white/10 mt-4">
          Kembali ke Daftar Order
        </Button>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG["received"];
  const isPaid = payments.some(p => p.status === "success");

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20 relative overflow-x-hidden print:bg-white print:text-black">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4DA8FF]/5 rounded-full blur-3xl -z-0 print:hidden" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl -z-0 print:hidden" />

      {/* Header (Hidden on Print) */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-black tracking-tight">{order.order_number}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusConf.bg} ${statusConf.color}`}>
                  {statusConf.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Detail Lengkap Pesanan</p>
            </div>
          </div>
          <Button onClick={handlePrint} className="rounded-full bg-[#4DA8FF] hover:bg-[#4DA8FF]/90 text-slate-950 font-bold text-xs gap-2">
            <Printer className="h-4 w-4" />
            Print Struk (F4)
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-5xl">
        
        {/* Print Header (Visible only on print) */}
        <div className="hidden print:block text-center mb-8 border-b-2 border-black border-dashed pb-6">
          <h1 className="text-3xl font-black mb-1">LUNDRY.id</h1>
          <p className="text-sm">Cabang Jember Pusat</p>
          <p className="text-sm">Jl. Mastrip Raya No. 99, Jember</p>
          <div className="mt-4 pt-4 border-t border-black flex justify-between text-sm font-bold">
            <span>Order: {order.order_number}</span>
            <span>{new Date(order.created_at).toLocaleDateString("id-ID")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Order Items & Summary */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Info Card */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl print:border-black print:bg-transparent print:rounded-none print:p-0">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 print:text-black">
                <User className="h-4 w-4" /> Informasi Pelanggan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-lg font-bold">{order.customer?.name || "Pelanggan Umum"}</p>
                  <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1 print:text-black">
                    <Phone className="h-3.5 w-3.5" /> {order.customer?.phone || "-"}
                  </p>
                </div>
                {order.customer?.address && (
                  <div className="md:text-right">
                    <p className="text-xs text-slate-400 print:text-black">Alamat Pengiriman/Jemput:</p>
                    <p className="text-sm mt-0.5 flex items-start gap-1.5 md:justify-end">
                      <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-400 print:hidden" />
                      {order.customer.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl print:border-none print:bg-transparent print:p-0">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 print:text-black">
                <Shirt className="h-4 w-4" /> Item Layanan
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-slate-400 print:border-black print:text-black">
                    <tr>
                      <th className="pb-3 font-bold uppercase text-[10px] tracking-wider">Layanan</th>
                      <th className="pb-3 font-bold uppercase text-[10px] tracking-wider text-center">Harga</th>
                      <th className="pb-3 font-bold uppercase text-[10px] tracking-wider text-center">Qty / Berat</th>
                      <th className="pb-3 font-bold uppercase text-[10px] tracking-wider text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 print:divide-black/20">
                    {order.items?.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="py-4 text-white print:text-black font-medium">{item.service_name}</td>
                        <td className="py-4 text-center text-slate-300 print:text-black">Rp {item.price_per_unit.toLocaleString("id-ID")}</td>
                        <td className="py-4 text-center text-slate-300 print:text-black">{item.quantity}</td>
                        <td className="py-4 text-right text-white print:text-black font-bold">Rp {parseFloat(String(item.subtotal)).toLocaleString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment Summary */}
              <div className="mt-6 pt-6 border-t border-white/10 print:border-black space-y-2 max-w-sm ml-auto">
                <div className="flex justify-between items-center text-sm text-slate-400 print:text-black">
                  <span>Subtotal</span>
                  <span className="font-bold">Rp {parseFloat(String(order.total_amount)).toLocaleString("id-ID")}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between items-center text-sm text-red-400 print:text-black">
                    <span>Diskon</span>
                    <span className="font-bold">-Rp {parseFloat(String(order.discount_amount)).toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-white/10 print:border-black mt-2">
                  <span className="text-base font-black">Total Tagihan</span>
                  <span className="text-xl font-black text-[#4DA8FF] print:text-black">Rp {parseFloat(String(order.final_amount)).toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {order.notes && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl print:border-black print:bg-transparent">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1 print:text-black">Catatan Khusus</p>
                <p className="text-sm text-amber-200 print:text-black italic">"{order.notes}"</p>
              </div>
            )}
          </div>

          {/* Right Column - Status & Payments */}
          <div className="space-y-6 print:hidden">
            
            {/* Status Card */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Status Pesanan
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#4DA8FF]/20 text-[#4DA8FF] flex items-center justify-center shrink-0">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Waktu Pemesanan</p>
                    <p className="text-sm font-bold mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Estimasi Selesai</p>
                    <p className="text-sm font-bold mt-0.5 text-emerald-400">{formatDate(order.estimated_completion_at)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Metode Pengambilan</p>
                    <p className="text-sm font-bold mt-0.5 uppercase tracking-wide">
                      {order.pickup_delivery_method === "courier" ? "Kurir Antar" : "Ambil Sendiri (Self)"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Card */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Pembayaran
              </h3>
              
              {isPaid ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center gap-2">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                  <div>
                    <p className="font-bold text-emerald-400 text-sm uppercase tracking-widest">LUNAS</p>
                    <p className="text-xs text-emerald-500/70">
                      via {payments.find(p => p.status === "success")?.payment_method.replace(/_/g, " ").toUpperCase() || "Sistem"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center text-center gap-2">
                  <Ban className="h-8 w-8 text-red-400" />
                  <div>
                    <p className="font-bold text-red-400 text-sm uppercase tracking-widest">BELUM BAYAR</p>
                    <Button size="sm" className="mt-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs">
                      Bayar Sekarang
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* QR Bags Section (Tracking Link) */}
            {order.qr_bags && order.qr_bags.length > 0 && (
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <QrCode className="h-4 w-4" /> Fisik Kantong
                </h3>
                <div className="space-y-3">
                  {order.qr_bags.map(bag => (
                    <div key={bag.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div>
                        <p className="text-xs font-mono font-bold text-[#4DA8FF]">{bag.qr_code_string.split('-').slice(-2).join('-')}</p>
                        <p className="text-[10px] text-slate-400">Kantong {bag.bag_index}</p>
                      </div>
                      <span className="px-2 py-1 bg-white/10 rounded-md text-[9px] uppercase tracking-wider font-bold">
                        {bag.current_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block text-center mt-12 pt-6 border-t border-black border-dashed">
          <p className="text-xs font-bold uppercase">Terima Kasih</p>
          <p className="text-[10px] mt-1">Harap bawa struk ini saat pengambilan cucian.</p>
          <p className="text-[10px]">Layanan Komplain Maks. 1x24 Jam setelah diambil.</p>
        </div>
      </div>
    </div>
  );
}
