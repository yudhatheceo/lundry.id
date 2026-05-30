"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Order } from "@/types";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "PRIORITAS":      { bg: "#ef4444", text: "#fff" },
  "SUPER EKSPRESS": { bg: "#f97316", text: "#fff" },
  "EKSPRESS":       { bg: "#eab308", text: "#1a1a1a" },
  "REGULER":        { bg: "#22c55e", text: "#fff" },
};

function getServiceCategoryLabel(items: Order["items"]): string {
  const name = ((items ?? [])[0]?.service_name ?? "").toLowerCase();
  if (name.includes("kilat") || name.includes("3 jam") || name.includes("super")) return "SUPER EKSPRESS";
  if (name.includes("prioritas")) return "PRIORITAS";
  if (name.includes("express") || name.includes("ekspress") || name.includes("1 hari")) return "EKSPRESS";
  return "REGULER";
}

export default function ProductionReceiptPrintPage() {
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

  useEffect(() => {
    if (order) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [order]);

  if (error) return <div className="p-8 text-center text-red-500 font-mono">{error}</div>;
  if (!order) return <div className="p-8 text-center font-mono text-gray-400">Memuat struk produksi...</div>;

  const items = order.items || [];
  const qrBags = (order as any).qr_bags || (order as any).qrBags || [];
  const customer = order.customer;
  
  const categoryLabel = getServiceCategoryLabel(items);
  const categoryStyle = CATEGORY_COLORS[categoryLabel] ?? CATEGORY_COLORS["REGULER"];

  return (
    <>
      <style>{`
        @media screen {
          body { background: #f1f5f9; margin: 0; padding: 16px; display: flex; justify-content: center; }
        }
        @media print {
          @page { size: 80mm auto; margin: 0; }
          html, body { width: 80mm; margin: 0; padding: 0; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .receipt-wrapper { width: 80mm; margin: 0; padding: 0; background: white !important; color: black !important; }
          .receipt-wrapper * { color: black !important; border-color: #999 !important; }
        }
      `}</style>

      <div className="no-print mb-4 flex gap-3 justify-center">
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition">🖨️ Cetak Produksi</button>
        <button onClick={() => window.close()} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-bold hover:bg-gray-300 transition">✕ Tutup</button>
      </div>

      <div className="receipt-wrapper" style={{ width: "80mm", fontFamily: "monospace", fontSize: "12px", color: "#000", background: "#fff", padding: "4mm" }}>
        <div style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text, textAlign: "center", fontWeight: 900, fontSize: "16px", padding: "6px 4px", marginBottom: "8px", borderRadius: "4px" }}>
          ★ {categoryLabel} ★
        </div>

        <div style={{ textAlign: "center", borderBottom: "1px dashed #999", paddingBottom: "6px", marginBottom: "6px" }}>
          <p style={{ fontWeight: 700, fontSize: "13px", margin: 0 }}>LUNDRY.id</p>
          <p style={{ margin: 0, fontSize: "10px", color: "#555" }}>Resi Produksi Internal</p>
        </div>

        <div style={{ marginBottom: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>No Order:</span><strong>{order.order_number}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Pelanggan:</span><span>{customer?.name ?? "—"}</span></div>
          {order.estimated_completion_at && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#ef4444", fontWeight: "bold" }}>
              <span>Deadline:</span><span>{new Date(order.estimated_completion_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          )}
        </div>

        {/* ─── Items Tanpa Harga ─── */}
        <div style={{ borderTop: "1px dashed #999", borderBottom: "1px dashed #999", padding: "6px 0", marginBottom: "6px" }}>
          <p style={{ fontWeight: 700, margin: "0 0 4px 0" }}>Layanan (Tanpa Harga):</p>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
              <span>{item.service_name}</span>
              <strong>{item.quantity}</strong>
            </div>
          ))}
        </div>

        {/* ─── Weight & Pcs Summary ─── */}
        <div style={{ marginBottom: "6px" }}>
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

        {/* ─── QR Bags ─── */}
        {qrBags.length > 0 && (
          <div style={{ borderTop: "1px dashed #999", paddingTop: "6px", marginBottom: "6px" }}>
            <p style={{ fontWeight: 700, margin: "0 0 4px 0", textAlign: "center" }}>QR Bags ({qrBags.length} Kantong):</p>
            {qrBags.map((bag: any, i: number) => {
              const weightStr = bag.actual_weight !== null && bag.actual_weight !== undefined
                ? `${bag.actual_weight}kg`
                : `${bag.estimated_weight ?? 0}kg`;
              const pcsStr = bag.actual_pcs !== null && bag.actual_pcs !== undefined
                ? `${bag.actual_pcs}pcs`
                : `${bag.estimated_pcs ?? 0}pcs`;

              return (
                <div key={bag.id} style={{ textAlign: "center", marginBottom: "12px", paddingBottom: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: "bold", marginBottom: "2px" }}>
                    <span>Bag #{i + 1}</span>
                    <span>{weightStr} | {pcsStr}</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(bag.qr_code_string)}&bgcolor=ffffff&color=000000`}
                    alt={bag.qr_code_string}
                    style={{ width: "28mm", height: "28mm", display: "block", margin: "0 auto" }}
                  />
                  <p style={{ fontSize: "9px", margin: "2px 0 0", wordBreak: "break-all" }}>{bag.qr_code_string}</p>
                </div>
              );
            })}
          </div>
        )}

        {order.notes && (
          <div style={{ borderTop: "1px dashed #999", paddingTop: "6px", marginBottom: "6px", fontSize: "10px" }}>
            <strong>Catatan:</strong> {order.notes}
          </div>
        )}
      </div>
    </>
  );
}
