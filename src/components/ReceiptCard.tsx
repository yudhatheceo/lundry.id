import React from "react";
import { Order } from "@/types";

interface ReceiptCardProps {
  order: Order;
  changeAmount?: number;
}

/**
 * Derive the prominent service category label from item name.
 * Shown as a large bold header on both screen (POS modal) and print.
 */
function getServiceCategoryLabel(items: Order["items"]): string {
  const name = ((items ?? [])[0]?.service_name ?? "").toLowerCase();
  if (name.includes("kilat") || name.includes("3 jam") || name.includes("super")) return "SUPER EKSPRESS";
  if (name.includes("prioritas")) return "PRIORITAS";
  if (name.includes("express") || name.includes("ekspress") || name.includes("1 hari")) return "EKSPRESS";
  return "REGULER";
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "PRIORITAS":      { bg: "#ef4444", text: "#fff" },
  "SUPER EKSPRESS": { bg: "#f97316", text: "#fff" },
  "EKSPRESS":       { bg: "#eab308", text: "#1a1a1a" },
  "REGULER":        { bg: "#22c55e", text: "#fff" },
};

export function ReceiptCard({ order, changeAmount = 0 }: ReceiptCardProps) {
  const items     = order.items    ?? [];
  const payments  = order.payments ?? [];
  const qrBags    = (order as any).qr_bags ?? (order as any).qrBags ?? [];
  const customer  = order.customer;
  const mainPayment = payments[0] ?? null;

  const categoryLabel = getServiceCategoryLabel(items);
  const categoryStyle = CATEGORY_COLORS[categoryLabel] ?? CATEGORY_COLORS["REGULER"];

  return (
    <>
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body * { visibility: hidden; }
          .receipt-card, .receipt-card * { visibility: visible; }
          .receipt-card {
            position: fixed;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 4mm !important;
            margin: 0 !important;
            border: none !important;
            background: white !important;
            color: black !important;
            font-size: 11px !important;
          }
          .receipt-card span,
          .receipt-card p,
          .receipt-card div { color: black !important; border-color: #999 !important; }
          .receipt-service-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Prevent mid-element page breaks */
          .receipt-card { page-break-inside: avoid; break-inside: avoid; }
        }
      `}</style>

      <div className="p-5 bg-slate-950 rounded-2xl border border-white/5 text-left font-mono space-y-3 text-xs receipt-card">

        {/* ══ Service Category Badge (owner requirement: big + bold header) ══ */}
        <div
          className="receipt-service-badge"
          style={{
            backgroundColor: categoryStyle.bg,
            color: categoryStyle.text,
            textAlign: "center",
            fontWeight: 900,
            fontSize: "16px",
            letterSpacing: "2px",
            padding: "6px 4px",
            borderRadius: "6px",
            marginBottom: "4px",
          }}
        >
          ★ {categoryLabel} ★
        </div>

        {/* Store header */}
        <div className="text-center pb-3 border-b border-dashed border-white/10">
          <p className="font-bold text-sm">LUNDRY.id Receipt</p>
          <p className="text-[10px] text-slate-500">Jember Pusat</p>
        </div>

        {/* Order meta */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>No Order:</span>
            <span className="font-bold text-white">{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Pelanggan:</span>
            <span className="text-white">{customer?.name ?? "Tanpa Nama"}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span className="text-slate-400">
              {new Date(order.created_at).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-b border-dashed border-white/10 py-3 space-y-2">
          {items.map((item, i) => (
            <div key={item.id ?? i} className="flex justify-between">
              <span>{item.service_name} × {item.quantity}</span>
              <span className="text-white">Rp {parseFloat(String(item.subtotal)).toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>Rp {parseFloat(String(order.total_amount)).toLocaleString("id-ID")}</span>
          </div>
          {parseFloat(String(order.discount_amount)) > 0 && (
            <div className="flex justify-between text-red-400">
              <span>Potongan:</span>
              <span>- Rp {parseFloat(String(order.discount_amount)).toLocaleString("id-ID")}</span>
            </div>
          )}
          <div className="flex justify-between text-emerald-400 font-bold text-sm">
            <span>Total Bayar:</span>
            <span>Rp {parseFloat(String(order.final_amount)).toLocaleString("id-ID")}</span>
          </div>

          {mainPayment && (
            <div className="flex justify-between text-slate-400">
              <span>Metode:</span>
              <span className="uppercase">{mainPayment.payment_method.replace(/_/g, " ")}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-300">
            <span>Status Bayar:</span>
            <strong className="uppercase">{order.payment_status}</strong>
          </div>

          {changeAmount > 0 && (
            <div className="flex justify-between font-black text-yellow-400 text-sm border-t border-dashed border-white/10 pt-2 mt-1">
              <span>💵 Kembalian:</span>
              <span>Rp {changeAmount.toLocaleString("id-ID")}</span>
            </div>
          )}
        </div>

        {/* Order Reference QR (Customer Receipt) */}
        <div className="border-t border-dashed border-white/10 py-3 flex flex-col items-center justify-center space-y-2">
          <p className="font-bold text-center mb-1">Scan untuk Lacak Order:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(order.order_number)}&bgcolor=ffffff&color=000000`}
            alt={order.order_number}
            className="w-20 h-20 bg-white p-1 rounded-md"
          />
          <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded">
            {order.order_number}
          </span>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="border-t border-dashed border-white/10 py-3 space-y-1">
            <p className="font-bold mb-1">Catatan:</p>
            <p className="text-[10px] text-slate-400">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-dashed border-white/10 text-[10px] text-slate-500 leading-normal">
          Terima kasih telah mencuci di LUNDRY.id!<br />
          PT NAWASENA ADIKARYA PRATAMA
        </div>
      </div>
    </>
  );
}
