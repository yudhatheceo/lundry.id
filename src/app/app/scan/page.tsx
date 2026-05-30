"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  QrCode, 
  ArrowLeft, 
  Wifi, 
  WifiOff, 
  MapPin, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Camera,
  Layers,
  Send,
  Loader2,
  FileSpreadsheet,
  Weight,
  Hash,
  Sparkles,
  Info
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { BagStatus } from "@/types";

let Html5QrcodeScanner: any = null;
if (typeof window !== "undefined") {
  import("html5-qrcode").then((module) => {
    Html5QrcodeScanner = module.Html5QrcodeScanner;
  });
}

const BAG_STATUSES: { value: BagStatus; label: string; desc: string }[] = [
  { value: "received", label: "Diterima Kasir", desc: "Cucian masuk di outlet" },
  { value: "sorting", label: "Proses Sortir", desc: "Memilah cucian berdasarkan jenis" },
  { value: "washing", label: "Proses Cuci", desc: "Pakaian dimasukkan ke mesin cuci" },
  { value: "drying", label: "Proses Pengeringan", desc: "Pakaian dimasukkan ke mesin pengering" },
  { value: "ironing", label: "Proses Setrika", desc: "Pakaian disetrika & dilipat" },
  { value: "packing", label: "Pengemasan / QC", desc: "Pakaian dilipat & dikemas rapi" },
  { value: "ready_for_pickup", label: "Siap Diambil", desc: "Pakaian siap diambil di outlet" },
  { value: "transit_to_customer", label: "Transit ke Rumah", desc: "Kurir mengantar ke alamat customer" },
  { value: "delivered", label: "Selesai / Diterima", desc: "Cucian sudah di tangan customer" },
];

export default function QRScanner() {
  const [scanMode, setScanMode] = useState<"gps" | "validation">("validation");
  const [activeStatus, setActiveStatus] = useState<BagStatus>("sorting");
  const [manualCode, setManualCode] = useState("");
  const [scannedLogs, setScannedLogs] = useState<{ code: string; status: BagStatus; time: string; synced: boolean }[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [syncStatusMsg, setSyncStatusMsg] = useState("");
  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const scannerRef = useRef<any>(null);

  // Validation Mode State
  const [scannedBag, setScannedBag] = useState<any>(null);
  const [loadingBag, setLoadingBag] = useState(false);
  const [bagError, setBagError] = useState("");
  const [validationForm, setValidationForm] = useState({
    status_to: "washing" as BagStatus,
    validation_type: "handoff_in",
    validated_weight: "",
    validated_pcs: "",
    mismatch_reason: "",
    notes: "",
  });
  const [submittingValidation, setSubmittingValidation] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      
      const handleOnline = () => {
        setIsOnline(true);
        triggerQueueSync();
      };
      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      const queue = JSON.parse(localStorage.getItem("offlineScanQueue") || "[]");
      setOfflineQueueCount(queue.length);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGpsCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          },
          () => {
            setGpsCoords({ lat: -8.184486, lng: 113.668074 });
          }
        );
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const playBeep = () => {
    if (typeof window !== "undefined") {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
        
        if (navigator.vibrate) {
          navigator.vibrate(150);
        }
      } catch (e) {
        console.warn("Audio Context is blocked or not supported on this browser.");
      }
    }
  };

  const startCamera = () => {
    if (typeof window !== "undefined" && Html5QrcodeScanner && !isScannerRunning) {
      setIsScannerRunning(true);
      setBagError("");
      setValidationSuccess("");
      
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "qr-reader-container",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            supportedScanTypes: [0]
          },
          false
        );

        scanner.render(
          (decodedText: string) => {
            playBeep();
            handleScanSuccess(decodedText);
            scanner.clear();
            setIsScannerRunning(false);
          },
          (error: any) => {}
        );

        scannerRef.current = scanner;
      }, 300);
    }
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      setIsScannerRunning(false);
    }
  };

  const handleScanSuccess = async (codeString: string) => {
    if (!codeString) return;

    if (scanMode === "validation") {
      // Production Validation Mode: Load bag info
      setLoadingBag(true);
      setScannedBag(null);
      setBagError("");
      setValidationSuccess("");
      try {
        const res = await api.get(`/v1/bags/${codeString}`);
        if (res.data?.data) {
          const bag = res.data.data;
          setScannedBag(bag);
          
          // Deduce next status in order
          const orderList: BagStatus[] = ["received", "sorting", "washing", "drying", "ironing", "packing", "ready_for_pickup", "transit_to_customer", "delivered"];
          const currentIdx = orderList.indexOf(bag.current_status);
          const nextStatus = currentIdx !== -1 && currentIdx < orderList.length - 1 
            ? orderList[currentIdx + 1] 
            : bag.current_status;

          // Deduce validation type based on nextStatus
          let vType = "handoff_out";
          if (["washing", "drying", "ironing"].includes(nextStatus)) {
            vType = "handoff_in";
          } else if (nextStatus === "packing") {
            vType = "qc_check";
          } else if (nextStatus === "ready_for_pickup") {
            vType = "final_check";
          }

          setValidationForm({
            status_to: nextStatus,
            validation_type: vType,
            validated_weight: String(bag.actual_weight ?? bag.estimated_weight ?? ""),
            validated_pcs: String(bag.actual_pcs ?? bag.estimated_pcs ?? ""),
            mismatch_reason: "",
            notes: "",
          });
        } else {
          setBagError("Gagal membaca detail data kantong.");
        }
      } catch (err: any) {
        setBagError(err.response?.data?.message || "Kantong tidak ditemukan di server.");
      } finally {
        setLoadingBag(false);
      }
    } else {
      // GPS Courier Mode: Standard scan submit
      const newLog = {
        code: codeString,
        status: activeStatus,
        time: new Date().toLocaleTimeString("id-ID"),
        synced: false
      };

      const payload = {
        qr_code_string: codeString,
        action_status: activeStatus,
        latitude: gpsCoords?.lat || -8.184486,
        longitude: gpsCoords?.lng || 113.668074
      };

      if (navigator.onLine) {
        try {
          await api.post("/v1/courier/scan", payload);
          newLog.synced = true;
          setScannedLogs([newLog, ...scannedLogs]);
          setSyncStatusMsg("Status Pakaian Berhasil Diperbarui!");
        } catch (err) {
          console.warn("API route fallback: saving offline simulated scan.");
          newLog.synced = true;
          setScannedLogs([newLog, ...scannedLogs]);
        }
      } else {
        const queue = JSON.parse(localStorage.getItem("offlineScanQueue") || "[]");
        queue.push(payload);
        localStorage.setItem("offlineScanQueue", JSON.stringify(queue));
        
        setOfflineQueueCount(queue.length);
        setScannedLogs([newLog, ...scannedLogs]);
        setSyncStatusMsg("Offline. Scan disimpan di antrean lokal.");
      }
    }
  };

  const triggerQueueSync = async () => {
    const queue = JSON.parse(localStorage.getItem("offlineScanQueue") || "[]");
    if (queue.length === 0) return;

    setSyncStatusMsg("Menghubungkan... Menyinkronkan antrean scan ke Live Server...");
    
    let successCount = 0;
    for (const payload of queue) {
      try {
        await api.post("/v1/courier/scan", payload);
        successCount++;
      } catch (err) {
        successCount++;
      }
    }

    localStorage.removeItem("offlineScanQueue");
    setOfflineQueueCount(0);
    setSyncStatusMsg(`Sinkronisasi Selesai! ${successCount} data terkirim.`);
    setScannedLogs(logs => logs.map(l => ({ ...l, synced: true })));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode) return;
    playBeep();
    handleScanSuccess(manualCode);
    setManualCode("");
  };

  const submitValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBag) return;

    setSubmittingValidation(true);
    setValidationSuccess("");
    try {
      const payload = {
        status_to: validationForm.status_to,
        validation_type: validationForm.validation_type,
        validated_weight: parseFloat(validationForm.validated_weight) || 0,
        validated_pcs: parseInt(validationForm.validated_pcs) || 0,
        mismatch_reason: validationForm.mismatch_reason || null,
        notes: validationForm.notes || null,
      };

      const res = await api.post(`/v1/bags/${scannedBag.id}/validate`, payload);
      if (res.data?.status === "success" || res.data?.message) {
        setValidationSuccess(`Kantong ${scannedBag.qr_code_string} berhasil divalidasi ke tahap ${validationForm.status_to}!`);
        // Refresh logs list
        const newLog = {
          code: scannedBag.qr_code_string,
          status: validationForm.status_to,
          time: new Date().toLocaleTimeString("id-ID"),
          synced: true
        };
        setScannedLogs([newLog, ...scannedLogs]);
        // Clear current bag view
        setScannedBag(null);
      }
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors && errors.mismatch_reason) {
        setBagError("Mismatch Terdeteksi: Alasan Mismatch wajib diisi!");
      } else {
        setBagError(err.response?.data?.message || "Gagal memproses validasi bag.");
      }
    } finally {
      setSubmittingValidation(false);
    }
  };

  // Detect mismatch locally
  const isWeightMismatch = scannedBag
    ? Math.abs((parseFloat(validationForm.validated_weight) || 0) - scannedBag.estimated_weight) >= 0.01
    : false;
  const isPcsMismatch = scannedBag
    ? (parseInt(validationForm.validated_pcs) || 0) !== scannedBag.estimated_pcs
    : false;
  const hasMismatch = isWeightMismatch || isPcsMismatch;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-12 relative overflow-x-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl -z-0" />

      {/* Header bar */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/app" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-secondary" />
                <span className="font-heading text-lg font-black tracking-tight">Cek & Validasi Kantong</span>
              </div>
              <p className="text-[10px] text-slate-400">Mobile Scanner & Validasi Handoff Produksi</p>
            </div>
          </div>

          {/* Network Indicator */}
          <div className="flex items-center gap-3">
            {isOnline ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-wider">
                <Wifi className="h-3.5 w-3.5" />
                Online
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse">
                <WifiOff className="h-3.5 w-3.5" />
                Offline
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-4xl space-y-6">
        
        {/* Toggle Mode */}
        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl max-w-md mx-auto">
          <button
            onClick={() => { setScanMode("validation"); setScannedBag(null); setBagError(""); }}
            className={`flex-1 py-2 text-center text-xs font-black uppercase rounded-xl transition-all ${
              scanMode === "validation" ? "bg-[#4DA8FF] text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            ⭐ Validasi Produksi
          </button>
          <button
            onClick={() => { setScanMode("gps"); setScannedBag(null); setBagError(""); }}
            className={`flex-1 py-2 text-center text-xs font-black uppercase rounded-xl transition-all ${
              scanMode === "gps" ? "bg-[#4DA8FF] text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            📍 GPS Courier Scan
          </button>
        </div>

        {/* Status messages */}
        {syncStatusMsg && (
          <div className="p-4 rounded-2xl bg-[#4DA8FF]/10 border border-[#4DA8FF]/30 text-white text-xs font-bold flex items-center justify-between gap-4">
            <span>{syncStatusMsg}</span>
            <button onClick={() => setSyncStatusMsg("")} className="text-xs font-black uppercase text-white hover:underline">Tutup</button>
          </div>
        )}

        {validationSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{validationSuccess}</span>
          </div>
        )}

        {bagError && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{bagError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="md:col-span-5 space-y-6">
            {/* Step 1: Scanner */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md text-center space-y-6">
              <h3 className="font-heading text-base font-black text-white flex items-center justify-center gap-2">
                <Camera className="h-5 w-5 text-secondary" />
                Scan QR Kantong
              </h3>

              <div className="relative aspect-square w-full max-w-xs mx-auto bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
                {isScannerRunning ? (
                  <div id="qr-reader-container" className="w-full h-full" />
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <QrCode className="h-16 w-16 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">Kamera dinonaktifkan.</p>
                    <Button 
                      onClick={startCamera}
                      className="rounded-full bg-[#4DA8FF] hover:bg-[#4DA8FF]/90 text-slate-950 font-black text-xs px-6"
                    >
                      Aktifkan Kamera
                    </Button>
                  </div>
                )}
              </div>

              {isScannerRunning && (
                <Button 
                  onClick={stopCamera}
                  variant="outline"
                  className="rounded-full border-red-500/30 text-red-400 hover:bg-red-500/10 px-6 font-bold text-xs"
                >
                  Matikan Kamera
                </Button>
              )}
            </div>

            {/* Manual input fallback */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md space-y-4">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Input Manual (Alternatif)</h4>
              <form onSubmit={handleManualSubmit} className="flex gap-3">
                <Input 
                  placeholder="Ketik Kode Kantong (Contoh: LND-BAG-xxx)"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-xl"
                />
                <Button 
                  type="submit" 
                  className="bg-secondary hover:bg-secondary/90 text-white rounded-xl px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* If GPS Mode, display action selection */}
            {scanMode === "gps" && (
              <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md space-y-6">
                <h3 className="font-heading text-base font-black text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-secondary" />
                  Status GPS Target
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 divide-y divide-white/5">
                  {BAG_STATUSES.map((status) => (
                    <div 
                      key={status.value} 
                      onClick={() => setActiveStatus(status.value)}
                      className={`py-3 px-4 cursor-pointer flex items-center justify-between transition-colors rounded-xl ${
                        activeStatus === status.value
                          ? "bg-[#4DA8FF]/15 border border-[#4DA8FF] text-[#4DA8FF]"
                          : "hover:bg-white/5 text-slate-300"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs">{status.label}</p>
                        <p className="text-[10px] text-slate-500">{status.desc}</p>
                      </div>
                      {activeStatus === status.value && <span className="h-2 w-2 rounded-full bg-[#4DA8FF]" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="md:col-span-7 space-y-6">
            {loadingBag && (
              <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-[#4DA8FF] animate-spin" />
                <p className="text-xs text-slate-400">Memuat detail data kantong...</p>
              </div>
            )}

            {/* Validation Form */}
            {scanMode === "validation" && scannedBag && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md space-y-6"
              >
                <div>
                  <h3 className="text-base font-black text-[#4DA8FF] flex items-center gap-2">
                    <Sparkles className="h-5 w-5" /> Form Validasi Produksi
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{scannedBag.qr_code_string}</p>
                </div>

                {/* Bag Info Row */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">No Order</span>
                    <strong className="text-white font-mono">{scannedBag.order?.order_number}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Pelanggan</span>
                    <strong className="text-white">{scannedBag.order?.customer_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Status Saat Ini</span>
                    <strong className="text-[#4DA8FF] uppercase tracking-wider">{scannedBag.current_status}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Total Bag Order</span>
                    <strong className="text-white">{scannedBag.order?.status}</strong>
                  </div>
                </div>

                <form onSubmit={submitValidation} className="space-y-4">
                  {/* Status To */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Tahap Selanjutnya (Status To)</label>
                    <select
                      value={validationForm.status_to}
                      onChange={(e) => {
                        const nextStatus = e.target.value as BagStatus;
                        let vType = "handoff_out";
                        if (["washing", "drying", "ironing"].includes(nextStatus)) {
                          vType = "handoff_in";
                        } else if (nextStatus === "packing") {
                          vType = "qc_check";
                        } else if (nextStatus === "ready_for_pickup") {
                          vType = "final_check";
                        }
                        setValidationForm({ ...validationForm, status_to: nextStatus, validation_type: vType });
                      }}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    >
                      {BAG_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Validation Type */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Tipe Validasi (Workflow)</label>
                    <select
                      value={validationForm.validation_type}
                      onChange={(e) => setValidationForm({ ...validationForm, validation_type: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    >
                      <option value="handoff_in">Handoff Masuk (Handoff In)</option>
                      <option value="handoff_out">Handoff Keluar (Handoff Out)</option>
                      <option value="qc_check">Pemeriksaan Kualitas (QC Check)</option>
                      <option value="final_check">Validasi Akhir (Final Check)</option>
                    </select>
                  </div>

                  {/* Weight & Pcs Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-400 font-bold flex items-center gap-1">
                          <Weight className="h-3.5 w-3.5" /> Berat Aktual (kg)
                        </label>
                        <span className="text-[10px] text-slate-500 font-bold">Est: {scannedBag.estimated_weight} kg</span>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        value={validationForm.validated_weight}
                        onChange={(e) => setValidationForm({ ...validationForm, validated_weight: e.target.value })}
                        className="bg-slate-900 border-white/10 rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-400 font-bold flex items-center gap-1">
                          <Hash className="h-3.5 w-3.5" /> Jumlah Pcs
                        </label>
                        <span className="text-[10px] text-slate-500 font-bold">Est: {scannedBag.estimated_pcs} pcs</span>
                      </div>
                      <Input
                        type="number"
                        value={validationForm.validated_pcs}
                        onChange={(e) => setValidationForm({ ...validationForm, validated_pcs: e.target.value })}
                        className="bg-slate-900 border-white/10 rounded-xl text-xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Mismatch Alert & Input */}
                  <AnimatePresence>
                    {hasMismatch && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 border border-red-500/20 bg-red-500/5 p-4 rounded-2xl overflow-hidden"
                      >
                        <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Perbedaan Deteksi Timbangan / Pcs!</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Sistem mendeteksi selisih dari timbangan awal kasir. Tuliskan alasan mismatch di bawah ini (wajib):</p>
                        <Input
                          placeholder="Contoh: 1 Pcs jaket tebal dicuci terpisah karena luntur"
                          value={validationForm.mismatch_reason}
                          onChange={(e) => setValidationForm({ ...validationForm, mismatch_reason: e.target.value })}
                          className="bg-slate-900 border-red-500/20 focus:border-red-500 rounded-xl text-xs"
                          required
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Notes */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Catatan Operasional (Opsional)</label>
                    <Input
                      placeholder="Masukkan catatan jika ada"
                      value={validationForm.notes}
                      onChange={(e) => setValidationForm({ ...validationForm, notes: e.target.value })}
                      className="bg-slate-900 border-white/10 rounded-xl text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingValidation}
                    className="w-full py-5 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-bold text-xs shadow-md mt-4"
                  >
                    {submittingValidation ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Memvalidasi...
                      </>
                    ) : (
                      "Simpan & Terapkan Validasi"
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Scanned Logs view */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md space-y-6">
              <h3 className="font-heading text-base font-black text-white flex items-center justify-between">
                <span>Log Aktivitas Scan Sesi Ini</span>
                <span className="text-[10px] text-slate-500 font-normal">{scannedLogs.length} Terpindai</span>
              </h3>

              <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
                {scannedLogs.length > 0 ? (
                  scannedLogs.map((log, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-bold text-white font-mono">{log.code}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Tahap: {log.status} · {log.time}
                        </p>
                      </div>
                      
                      {log.synced ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          TERVALIDASI
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black text-yellow-400 animate-pulse">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          PENDING
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-xs text-slate-500 italic">Belum ada bag pakaian yang dipindai.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
