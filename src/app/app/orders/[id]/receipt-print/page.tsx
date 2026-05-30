"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Order } from "@/types";

/**
 * Isolated Receipt Print Page — Sprint 1
 *
 * This page loads ONLY the receipt, with zero dashboard sidebar/header,
 * so the browser @media print rules apply cleanly without cutting content.
 *
 * Usage: window.open(`/app/orders/${orderId}/receipt-print`)
 * or: <a href={`/app/orders/${orderId}/receipt-print`} target="_blank">
 */
export default function ReceiptPrintPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      const res = await api.get(`/v1/orders/${params.id}`);
      setOrder(res.data?.data || res.data);
    } catch {
      setError("Gagal memuat data order.");
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Auto-trigger print dialog once order loads
  useEffect(() => {
    if (order) {
      // Small delay so the browser renders the DOM before print dialog
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [order]);

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 font-mono">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center font-mono text-gray-400">
        Memuat struk...
      </div>
    );
  }

  const items = order.items || [];
  const payments = order.payments || [];
  const qrBags = (order as any).qr_bags || (order as any).qrBags || [];
  const customer = order.customer;
  const mainPayment = payments[0] ?? null;

  // Derive service category label from the first item's service name
  // Mapping to owner-defined bold header labels
  const serviceCategoryLabel = (() => {
    const name = (items[0]?.service_name ?? "").toLowerCase();
    if (name.includes("kilat") || name.includes("3 jam") || name.includes("super")) return "SUPER EKSPRESS";
    if (name.includes("prioritas")) return "PRIORITAS";
    if (name.includes("express") || name.includes("ekspress") || name.includes("1 hari")) return "EKSPRESS";
    return "REGULER";
  })();

  const categoryColor: Record<string, string> = {
    "PRIORITAS":     "#ef4444",  // Red
    "SUPER EKSPRESS": "#f97316", // Orange
    "EKSPRESS":      "#eab308",  // Yellow
    "REGULER":       "#22c55e",  // Green
  };

  return (
    <>
      {/* ─── Print-specific CSS — isolated from dashboard layout ─── */}
      <style>{`
        @media screen {
          body { background: #f1f5f9; margin: 0; padding: 16px; display: flex; justify-content: center; }
        }
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          html, body {
            width: 80mm;
            margin: 0;
            padding: 0;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .receipt-wrapper {
            width: 80mm;
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
          }
          .receipt-wrapper * { color: black !important; border-color: #999 !important; }
          .service-badge { background: transparent !important; border: 2px solid black !important; }
        }
      `}</style>

      {/* ─── No-print toolbar for screen preview ─── */}
      <div className="no-print mb-4 flex gap-3 justify-center">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          🖨️ Cetak Sekarang
        </button>
        <button
          onClick={() => window.close()}
          className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
        >
          ✕ Tutup
        </button>
      </div>

      {/* ─── Receipt ─── */}
      <div className="receipt-wrapper" style={{ width: "80mm", fontFamily: "monospace", fontSize: "12px", color: "#000", background: "#fff", padding: "4mm" }}>

        {/* ═══ SERVICE CATEGORY HEADER (Big, Bold, Prominent) ═══ */}
        <div
          className="service-badge"
          style={{
            backgroundColor: categoryColor[serviceCategoryLabel] ?? "#22c55e",
            color: "#fff",
            textAlign: "center",
            fontWeight: 900,
            fontSize: "18px",
            letterSpacing: "2px",
            padding: "6px 4px",
            marginBottom: "8px",
            borderRadius: "4px",
          }}
        >
          ★ {serviceCategoryLabel} ★
        </div>

        {/* ─── Store header ─── */}
        <div style={{ textAlign: "center", borderBottom: "1px dashed #999", paddingBottom: "6px", marginBottom: "6px" }}>
          <p style={{ fontWeight: 700, fontSize: "13px", margin: 0 }}>LUNDRY.id</p>
          <p style={{ margin: 0, fontSize: "10px", color: "#555" }}>PT Nawasena Adikarya Pratama</p>
          <p style={{ margin: 0, fontSize: "10px", color: "#555" }}>Jember Pusat</p>
        </div>

        {/* ─── Order info ─── */}
        <div style={{ marginBottom: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>No Order:</span><strong>{order.order_number}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Pelanggan:</span><span>{customer?.name ?? "—"}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tanggal:</span><span>{new Date(order.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
          {order.estimated_completion_at && (
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Est. Selesai:</span><span>{new Date(order.estimated_completion_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</span></div>
          )}
        </div>

        {/* ─── Items ─── */}
        <div style={{ borderTop: "1px dashed #999", borderBottom: "1px dashed #999", padding: "6px 0", marginBottom: "6px" }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
              <span style={{ maxWidth: "55%" }}>{item.service_name} × {item.quantity}</span>
              <span>Rp {parseFloat(String(item.subtotal)).toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>

        {/* ─── Totals ─── */}
        <div style={{ marginBottom: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal:</span><span>Rp {parseFloat(String(order.total_amount)).toLocaleString("id-ID")}</span></div>
          {parseFloat(String(order.discount_amount)) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Potongan:</span><span>- Rp {parseFloat(String(order.discount_amount)).toLocaleString("id-ID")}</span></div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "14px", marginTop: "4px" }}>
            <span>TOTAL:</span><span>Rp {parseFloat(String(order.final_amount)).toLocaleString("id-ID")}</span>
          </div>
          {mainPayment && (
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Metode:</span><span style={{ textTransform: "uppercase" }}>{mainPayment.payment_method.replace(/_/g, " ")}</span></div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Status:</span>
            <strong style={{ textTransform: "uppercase" }}>{order.payment_status}</strong>
          </div>
        </div>

        {/* ─── Weight & Pcs Summary ─── */}
        <div style={{ borderTop: "1px dashed #999", paddingTop: "6px", marginBottom: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Berat Order:</span>
            <strong>{order.final_weight !== null && order.final_weight !== undefined ? `${order.final_weight} kg` : `${order.estimated_weight} kg`}</strong>
          </div>
          {(order.estimated_pcs || order.final_pcs) && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Jumlah Pcs:</span>
              <strong>{order.final_pcs !== null && order.final_pcs !== undefined ? `${order.final_pcs} Pcs` : `${order.estimated_pcs} Pcs`}</strong>
            </div>
          )}
        </div>

        {/* ─── Order Tracking QR ─── */}
        <div style={{ borderTop: "1px dashed #999", paddingTop: "6px", marginBottom: "6px", textAlign: "center" }}>
          <p style={{ fontWeight: 700, margin: "0 0 4px 0" }}>Scan untuk Lacak Order:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(order.order_number)}&bgcolor=ffffff&color=000000`}
            alt={order.order_number}
            style={{ width: "28mm", height: "28mm", display: "block", margin: "0 auto" }}
          />
          <p style={{ fontSize: "9px", margin: "2px 0 0" }}>{order.order_number}</p>
        </div>

        {/* ─── Notes ─── */}
        {order.notes && (
          <div style={{ borderTop: "1px dashed #999", paddingTop: "6px", marginBottom: "6px", fontSize: "10px" }}>
            <strong>Catatan:</strong> {order.notes}
          </div>
        )}

        {/* ─── Footer ─── */}
        <div style={{ borderTop: "1px dashed #999", paddingTop: "6px", textAlign: "center", fontSize: "10px", color: "#555" }}>
          Terima kasih telah mempercayakan cucian Anda!<br />
          LUNDRY.id · Jember
        </div>
      </div>
    </>
  );
}
