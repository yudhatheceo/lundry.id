"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  UserPlus, 
  Shirt, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Check, 
  ArrowLeft,
  QrCode,
  DollarSign,
  Tag,
  Calendar,
  Truck,
  FileText,
  Sparkles,
  Printer,
  LogOut,
  UserCheck,
  AlertCircle,
  ClipboardList,
  Package,
  SplitSquareVertical,
  Info
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Customer, MembershipTier, OrderCheckoutPayload, PaymentPayload } from "@/types";
import { ReceiptCard } from "@/components/ReceiptCard";

// Standard Services from Pricing data
const AVAILABLE_SERVICES = [
  { id: 1, name: "Cuci Setrika Regular", price: 8000, type: "kiloan", info: "2-3 Hari Selesai" },
  { id: 2, name: "Cuci Setrika Express", price: 16000, type: "kiloan", info: "1 Hari Selesai" },
  { id: 3, name: "Cuci Setrika 3 Jam Kilat", price: 25000, type: "kiloan", info: "3 Jam Selesai" },
  { id: 4, name: "Setrika Saja", price: 6000, type: "kiloan", info: "1-2 Hari Selesai" },
  { id: 5, name: "Cuci Jas / Blazer", price: 35000, type: "satuan", info: "Pembersihan Professional" },
  { id: 6, name: "Cuci Gaun / Dress", price: 60000, type: "satuan", info: "Bahan Sensitif" },
  { id: 7, name: "Cuci Seragam Formal", price: 25000, type: "satuan", info: "Presisi & Rapi" },
];

export default function POSKasir() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // POS States
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cart, setCart] = useState<{ service_id: number; service_name: string; price_per_unit: number; quantity: number }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [pickupMethod, setPickupMethod] = useState<"self" | "courier">("self");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris" | "bank_transfer" | "prepaid_balance">("cash");
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [cashReceived, setCashReceived] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [thermalError, setThermalError] = useState("");

  // Sprint 2: Pcs & Split Bag States
  const [estimatedPcs, setEstimatedPcs] = useState<number | "">("");
  const [splitBags, setSplitBags] = useState<{ weight: number; pcs: number | null }[]>([]);
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [splitConfirmed, setSplitConfirmed] = useState(false);

  // Services & Category UI
  const [services, setServices] = useState<any[]>([]);
  const [beratKiloan, setBeratKiloan] = useState<number>(0);

  // Modals & Errors
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Shift Closing States
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [expectedBalance, setExpectedBalance] = useState(0);
  const [actualBalance, setActualBalance] = useState("");
  const [isClosingShift, setIsClosingShift] = useState(false);

  // Logout handler
  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  // Fetch Services from API
  useEffect(() => {
    api.get("/v1/services").then(res => {
      const data = res.data?.data || res.data || [];
      setServices(Array.isArray(data) ? data : []);
    }).catch(err => console.error("Failed to fetch services"));
  }, []);

  // Search customer via API with debounce, fallback ke mock
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setCustomers([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/v1/customers?search=${encodeURIComponent(searchQuery)}`);
        setCustomers(res.data?.data || res.data || []);
      } catch {
        setCustomers([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Keyboard Shortcuts (F1, F2, F9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        // Focus search query
        const searchInput = document.getElementById("customer-search");
        if (searchInput) searchInput.focus();
      } else if (e.key === "F2") {
        e.preventDefault();
        // Redirect to QR Scanner
        window.location.href = "/app/scan";
      } else if (e.key === "F9") {
        e.preventDefault();
        // Trigger Checkout
        handleCheckoutSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCustomer, cart, discount, pickupMethod, splitBags, splitConfirmed, estimatedPcs, notes, paymentMethod]);

  // Handle Close Shift Click
  const handleOpenCloseShift = async () => {
    try {
      const res = await api.get("/v1/register-closing/current");
      setExpectedBalance(res.data.data.expected_closing_balance);
      setActualBalance("");
      setShowCloseShift(true);
    } catch (e) {
      alert("Gagal memuat data kasir.");
    }
  };

  const submitCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actualBalance === "") return;
    setIsClosingShift(true);
    try {
      await api.post("/v1/register-closing", { actual_closing_balance: parseFloat(actualBalance) });
      alert("Shift berhasil ditutup. Terima kasih!");
      setShowCloseShift(false);
    } catch (error) {
      alert("Terjadi kesalahan saat menutup shift.");
    } finally {
      setIsClosingShift(false);
    }
  };

  // Customers sudah di-filter dari API / useEffect di atas
  const filteredCustomers = customers;

  // Add Item to Cart
  const addToCart = (service: any, qty: number) => {
    const existing = cart.find((item) => item.service_id === service.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.service_id === service.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          service_id: service.id,
          service_name: service.service_name,
          price_per_unit: service.price,
          quantity: qty,
        },
      ]);
    }
  };

  // Adjust quantity (for satuan only)
  const updateQuantity = (name: string, amt: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.service_name === name) {
            const newQty = Math.max(1, item.quantity + amt);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item
  const removeFromCart = (name: string) => {
    setCart(cart.filter((item) => item.service_name !== name));
  };

  const kiloanWeight = beratKiloan;

  const subtotal = cart.reduce((acc, item) => {
    const service = services.find(s => s.id === item.service_id);
    const unit = service?.unit?.toLowerCase() || "kg";
    const isKiloan = unit.includes("kg") || unit.includes("kilo");
    const billedQty = isKiloan ? (beratKiloan > 0 ? Math.max(4, beratKiloan) : 0) : item.quantity;
    return acc + (item.price_per_unit * billedQty);
  }, 0);
  
  // Total weight for tracking is actual kilos + 0.2 per pcs
  const totalWeight = beratKiloan + cart.reduce((acc, item) => {
    const service = services.find(s => s.id === item.service_id);
    const unit = service?.unit?.toLowerCase() || "kg";
    const isKiloan = unit.includes("kg") || unit.includes("kilo");
    return acc + (isKiloan ? 0 : item.quantity * 0.2);
  }, 0);

  const finalAmount = Math.max(0, subtotal - discount);

  /**
   * Sprint 2 — Balanced Split Algorithm (mirrors PHP backend logic).
   * Runs client-side so cashier sees the split *before* submitting.
   */
  const computeAutoSplit = (weight: number, totalPcs: number | ""): { weight: number; pcs: number | null }[] => {
    const MAX = 8, MIN = 4;
    let count = Math.max(1, Math.ceil(weight / MAX));
    while (count > 1 && weight / count < MIN) count--;
    const base = parseFloat((weight / count).toFixed(2));
    const splits: { weight: number; pcs: number | null }[] = [];
    let remaining = weight;
    let pcsLeft = typeof totalPcs === "number" ? totalPcs : null;
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const w = isLast ? parseFloat(remaining.toFixed(2)) : base;
      remaining -= base;
      let pcs: number | null = null;
      if (pcsLeft !== null) {
        pcs = isLast ? pcsLeft : Math.floor(pcsLeft / (count - i));
        if (!isLast) pcsLeft -= pcs;
      }
      splits.push({ weight: w, pcs });
    }
    return splits;
  };

  // Auto-open split dialog when weight exceeds 8 kg and not already confirmed
  useEffect(() => {
    if (totalWeight > 8 && !splitConfirmed && cart.length > 0) {
      const auto = computeAutoSplit(totalWeight, estimatedPcs);
      setSplitBags(auto);
      setShowSplitDialog(true);
    }
    if (totalWeight <= 8) {
      setSplitConfirmed(false);
      setSplitBags([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalWeight, estimatedPcs]);

  // Add new customer — POST ke API, fallback local
  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone) return;

    try {
      const res = await api.post("/v1/customers", {
        outlet_id: user?.outlet_id || undefined,
        name: newCustomerName,
        phone: newCustomerPhone,
        address: newCustomerAddress || null,
      });
      const createdCustomer = (res.data?.data || res.data) as Customer;
      setSelectedCustomer(createdCustomer);
    } catch (err: any) {
      console.error("Add customer error:", err);
      const errResponse = err.response?.data || err;
      if (err.response?.status === 422 || errResponse.code === 422) {
        // Gabungkan pesan error agar bisa ditampilkan
        const messages = errResponse.errors 
            ? Object.values(errResponse.errors).flat().join(", ")
            : errResponse.message || "Validasi gagal";
        alert(`Gagal: ${messages}`);
        return;
      }
      alert(`Gagal menambah pelanggan: ${errResponse.message || err.message}`);
      return;
    }

    setShowAddCustomer(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerAddress("");
  };

  // Checkout submit to live / mock API
  const handleCheckoutSubmit = async () => {
    if (!selectedCustomer) {
      alert("Pilih Pelanggan Terlebih Dahulu!");
      return;
    }
    if (cart.length === 0) {
      alert("Keranjang Belanja Kosong!");
      return;
    }

    if (paymentMethod === "cash" && cashReceived < finalAmount) {
      setErrors({ payment: ["Uang tunai yang diterima kurang dari total tagihan."] });
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Payload as per OrderCheckoutPayload specs (Sprint 2 extended)
    const payload: OrderCheckoutPayload = {
      outlet_id: selectedCustomer.outlet_id || user?.outlet_id || "01krxvceaqfftv04hsbmwn7vya",
      customer_id: selectedCustomer.id,
      estimated_weight: Math.round(totalWeight),
      estimated_pcs: typeof estimatedPcs === "number" ? estimatedPcs : null,
      discount_amount: discount,
      pickup_delivery_method: pickupMethod,
      estimated_completion_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: notes || null,
      // Sprint 2: send bag split plan (manual or auto-calculated) when weight > 8kg
      ...(splitBags.length > 0 && splitConfirmed
        ? { bags: splitBags.map(b => ({ estimated_weight: Math.round(b.weight), estimated_pcs: b.pcs })) }
        : {}),
      items: cart.map(item => {
        const service = services.find(s => s.id === item.service_id);
        const unit = service?.unit?.toLowerCase() || "kg";
        const isKiloan = unit.includes("kg") || unit.includes("kilo");
        return {
          service_id: item.service_id,
          quantity: isKiloan ? (beratKiloan > 0 ? Math.max(4, beratKiloan) : 0) : item.quantity,
        };
      }),
    };

    try {
      // Step 1: Create Order via API
      const response = await api.post("/v1/orders", payload);
      const orderData = response.data?.data || response.data;
      const orderNumber = orderData?.order_number || `LND-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderId = orderData?.id;

      // Step 2: Create Payment record
      let changeAmount = 0;
      if (orderId) {
        try {
          const paymentPayload: any = {
            payment_method: paymentMethod,
            amount: finalAmount,
          };
          // Tambah cash_received untuk cash payment
          if (paymentMethod === "cash") {
            paymentPayload.cash_received = cashReceived;
          }
          // Tambah transaction_reference untuk QRIS/transfer
          if (paymentMethod === "qris" || paymentMethod === "bank_transfer") {
            paymentPayload.transaction_reference = null;
          }
          const payRes = await api.post(`/v1/orders/${orderId}/pay`, paymentPayload);
          const payData = payRes.data?.data || {};
          changeAmount = payData?.change_amount || (paymentMethod === "cash" ? Math.max(0, cashReceived - finalAmount) : 0);
        } catch (paymentErr: any) {
          const errMsg = paymentErr?.message || paymentErr?.response?.data?.message || "Gagal mencatat pembayaran.";
          
          // Jika ada errors spesifik per field dari backend, gabungkan ke errMsg
          let detailErrors = "";
          if (paymentErr?.errors) {
            const firstError = Object.values(paymentErr.errors)[0] as string[];
            if (firstError && firstError.length > 0) {
              detailErrors = " " + firstError[0];
            }
          }
          
          setErrors({ payment: [errMsg + detailErrors] });
          setIsLoading(false);
          return;
        }
      }

      // Step 3: Fetch Full Order for Receipt
      let fullOrder = null;
      if (orderId) {
        try {
          const orderRes = await api.get(`/v1/orders/${orderId}`);
          const resData = orderRes.data || orderRes;
          fullOrder = resData.data || resData;
        } catch (e) {
          console.error("Failed to fetch full order", e);
        }
      }

      setCheckoutResult({
        order_number: orderNumber,
        order_id: orderId,
        status: "success",
        total: finalAmount,
        payment_method: paymentMethod,
        change_amount: changeAmount,
        full_order: fullOrder,
      });
      setIsCheckoutSuccess(true);
    } catch (err: any) {
      // Handle standard 422 validations per-field
      if (err.code === 422 && err.errors) {
        setErrors(err.errors);
      } else if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: ["Gagal membuat pesanan. Pastikan server berjalan."] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden print:overflow-visible pb-12">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4DA8FF]/5 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl -z-0" />

      {/* POS Top Bar */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/app" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <div className="relative h-6 w-6 mr-1">
                  <Image src="/logo-small.png" alt="LUNDRY.id" fill className="object-contain drop-shadow-[0_0_8px_rgba(77,168,255,0.5)]" />
                </div>
                <span className="font-heading text-base md:text-lg font-black tracking-tight">POS Kasir Utama</span>
              </div>
              <p className="text-[10px] text-slate-400">Jember Pusat · Versi POS 2.1</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Quick Shortcut Keys Badge — visible on desktop */}
            <div className="hidden xl:flex items-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white text-[10px]">F1</kbd> Cari Customer</span>
              <span className="flex items-center gap-1.5"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white text-[10px]">F2</kbd> Scan QR Kantong</span>
              <span className="flex items-center gap-1.5"><kbd className="bg-white/10 px-2 py-0.5 rounded text-white text-[10px]">F9</kbd> Simpan Order</span>
            </div>

            {/* User Info + Logout */}
            {user && (
              <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-white/10">
                <button onClick={handleOpenCloseShift} className="hidden sm:flex items-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-md transition-colors text-amber-400 font-bold text-[11px]">
                  Tutup Shift
                </button>
                <Link href="/app/orders" className="hidden sm:flex items-center gap-2 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-md transition-colors">
                  <ClipboardList className="h-4 w-4 text-purple-400" />
                  <span className="text-[11px] font-bold text-white">Daftar Order</span>
                </Link>
                <div className="hidden sm:flex items-center gap-2.5 bg-white/5 border border-white/10 px-3 py-2 rounded-md">
                  <UserCheck className="h-4 w-4 text-[#4DA8FF]" />
                  <div>
                    <p className="text-[11px] font-bold text-white leading-none">{user.name}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="h-10 w-10 rounded-md border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 relative z-10">
        {!isCheckoutSuccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
            
            {/* Left/Middle Column (8 cols): Catalog, Customer, Cart */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Step 1: Customer Selection */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-md space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-black text-white flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-[#4DA8FF]/20 text-[#4DA8FF] flex items-center justify-center text-xs font-black">1</span>
                    Pilih Pelanggan
                  </h3>
                  <Button 
                    onClick={() => setShowAddCustomer(true)}
                    className="rounded-full bg-secondary hover:bg-secondary/90 text-white font-bold text-xs gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Tambah Pelanggan Baru
                  </Button>
                </div>

                {!selectedCustomer ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <Input
                        id="customer-search"
                        placeholder="Cari Nama Pelanggan atau Nomor WhatsApp (F1)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#4DA8FF] rounded-md text-white text-base"
                      />
                      {isSearching && (
                        <div className="absolute right-4 top-4">
                          <div className="h-5 w-5 border-2 border-[#4DA8FF]/30 border-t-[#4DA8FF] rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {searchQuery && searchQuery.length >= 2 && (
                      <div className="bg-slate-900 border border-white/10 rounded-lg p-2 max-h-60 overflow-y-auto divide-y divide-white/5">
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((cust) => (
                            <div 
                              key={cust.id} 
                              onClick={() => {
                                setSelectedCustomer(cust);
                                setSearchQuery("");
                              }}
                              className="p-4 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors rounded-md active:bg-white/10"
                            >
                              <div>
                                <p className="font-bold text-sm text-white">{cust.name}</p>
                                <p className="text-xs text-slate-400">{cust.phone}</p>
                              </div>
                              <span className="px-2 py-0.5 bg-secondary/10 border border-secondary/20 rounded-md text-[9px] font-black text-secondary uppercase">
                                {cust.membership_tier}
                              </span>
                            </div>
                          ))
                        ) : !isSearching ? (
                          <p className="p-4 text-xs text-slate-400 italic text-center">Pelanggan tidak ditemukan.</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 rounded-lg bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-lg text-white">{selectedCustomer.name}</h4>
                        <span className="px-2.5 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-[9px] font-black text-yellow-400 uppercase tracking-widest">
                          {selectedCustomer.membership_tier} Tier
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{selectedCustomer.phone}</p>
                      {selectedCustomer.address && <p className="text-xs text-slate-500">{selectedCustomer.address}</p>}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">Saldo Deposit</p>
                        <p className="text-lg font-black text-emerald-400">Rp {(selectedCustomer.prepaid_balance || 0).toLocaleString("id-ID")}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedCustomer(null)}
                        className="rounded-md border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        Ganti
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Catalog Selection */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-md space-y-6">
                <h3 className="font-heading text-lg font-black text-white flex items-center gap-2">
                  <span className="h-6 w-6 rounded bg-[#4DA8FF]/20 text-[#4DA8FF] flex items-center justify-center text-xs font-black">2</span>
                  Kategori Layanan
                </h3>

                <div className="space-y-4">
                  {/* Kiloan Categories */}
                  {[
                    { label: 'FULL SERVICE', subtitle: '(Per Kg)', dbCategory: 'Cuci, Kering, Setrika' },
                    { label: 'CUCI LIPAT', subtitle: '(Per Kg)', dbCategory: 'Cuci, Kering, Lipat' },
                    { label: 'JASA SETRIKA', subtitle: '(Per Kg)', dbCategory: 'Hanya Setrika' }
                  ].map(cat => {
                    const categoryServices = services.filter(s => s.category === cat.dbCategory);
                    if (categoryServices.length === 0) return null;
                    return (
                      <div key={cat.label} className="flex flex-col md:flex-row md:items-center gap-4 bg-black/20 border border-white/5 p-4 rounded-lg">
                        <div className="w-full md:w-1/4">
                          <h4 className="font-black text-sm text-white">{cat.label}</h4>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{cat.subtitle}</p>
                        </div>
                        <div className="w-full md:w-3/4 grid grid-cols-2 lg:grid-cols-4 gap-2">
                          {categoryServices.map(svc => {
                            const isSelected = cart.some(item => item.service_id === svc.id);
                            return (
                              <button
                                key={svc.id}
                                onClick={() => {
                                  const newCart = cart.filter(item => {
                                    const itemSvc = services.find(s => s.id === item.service_id);
                                    return itemSvc?.category !== cat.dbCategory;
                                  });
                                  if (!isSelected) {
                                    newCart.push({
                                      service_id: svc.id,
                                      service_name: svc.service_name,
                                      price_per_unit: svc.price,
                                      quantity: 1, // Ignored for kiloan calculations
                                    });
                                  }
                                  setCart(newCart);
                                }}
                                className={`p-2 text-xs font-bold rounded flex flex-col sm:flex-row items-center gap-2 border transition-all ${
                                  isSelected 
                                    ? "bg-[#4DA8FF]/20 border-[#4DA8FF] text-[#4DA8FF]" 
                                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                }`}
                              >
                                <div className={`h-3 w-3 rounded flex-shrink-0 ${isSelected ? "bg-[#4DA8FF]" : "bg-white/10"}`} />
                                <span className="text-center sm:text-left leading-tight">
                                  {svc.service_name.replace(/ \(.+\)/, '')}
                                  <br/>
                                  <span className="font-normal text-[10px]">Rp {(svc.price/1000)}k</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Satuan Category */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4 bg-black/20 border border-white/5 p-4 rounded-lg">
                    <div className="w-full md:w-1/4">
                      <h4 className="font-black text-sm text-white">CUCI SATUAN</h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">(Per Pcs)</p>
                    </div>
                    <div className="w-full md:w-3/4">
                       <select 
                         className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white outline-none focus:border-[#4DA8FF]"
                         onChange={(e) => {
                           if (!e.target.value) return;
                           const svc = services.find(s => s.id === Number(e.target.value));
                           if (svc) {
                             const existing = cart.find(i => i.service_id === svc.id);
                             if (existing) {
                               updateQuantity(svc.service_name, 1);
                             } else {
                               setCart([...cart, {
                                 service_id: svc.id,
                                 service_name: svc.service_name,
                                 price_per_unit: svc.price,
                                 quantity: 1,
                               }]);
                             }
                           }
                           e.target.value = "";
                         }}
                         value=""
                       >
                         <option value="" disabled className="bg-slate-900 text-slate-400">
                           + Tambah Item Satuan (Kemeja, Jas, Bedcover, dll)
                         </option>
                         {services.filter(s => s.category === 'Satuan' || (s.unit && s.unit.toLowerCase() !== 'kg')).map(svc => (
                           <option key={svc.id} value={svc.id} className="bg-slate-900 text-white">
                             {svc.service_name} - Rp {(svc.price).toLocaleString("id-ID")}
                           </option>
                         ))}
                       </select>
                    </div>
                  </div>

                  {services.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-slate-400 text-xs animate-pulse">Memuat katalog layanan...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Shopping Cart */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-md space-y-6">
                <h3 className="font-heading text-lg font-black text-white flex items-center gap-2">
                  <span className="h-6 w-6 rounded bg-[#4DA8FF]/20 text-[#4DA8FF] flex items-center justify-center text-xs font-black">3</span>
                  Keranjang Belanja POS
                </h3>

                {cart.length > 0 ? (
                  <div className="space-y-4">
                    <div className="divide-y divide-white/5">
                      {cart.map((item) => (
                        <div key={item.service_name} className="py-4 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-white">{item.service_name}</h4>
                            <p className="text-xs text-slate-400">Rp {item.price_per_unit.toLocaleString("id-ID")}</p>
                          </div>

                          <div className="flex items-center gap-6">
                            {/* Quantity Adjuster */}
                            {(() => {
                              const svc = services.find(s => s.id === item.service_id);
                              const isKiloan = svc?.unit?.toLowerCase().includes("kg") || svc?.unit?.toLowerCase().includes("kilo");
                              return isKiloan ? (
                                <span className="font-black text-sm w-16 text-center text-slate-400 bg-white/5 py-1.5 rounded-md border border-white/5">
                                  {beratKiloan} Kg
                               </span>
                              ) : (
                                <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-md border border-white/5">
                                  <button 
                                    onClick={() => updateQuantity(item.service_name, -1)}
                                    className="h-8 w-8 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="font-black text-sm w-12 text-center text-white">
                                    {item.quantity} {svc?.unit || "pcs"}
                                  </span>
                                  <button 
                                    onClick={() => updateQuantity(item.service_name, 1)}
                                    className="h-8 w-8 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              );
                            })()}

                            {/* Total per Item */}
                            <p className="font-black text-sm text-emerald-400 w-24 text-right">
                              Rp {(item.price_per_unit * (
                                (() => {
                                  const service = services.find(s => s.id === item.service_id);
                                  const unit = service?.unit?.toLowerCase() || "kg";
                                  const isKiloan = unit.includes("kg") || unit.includes("kilo");
                                  return isKiloan ? (beratKiloan > 0 ? Math.max(4, beratKiloan) : 0) : item.quantity;
                                })()
                              )).toLocaleString("id-ID")}
                            </p>

                            {/* Remove item button */}
                            <button 
                              onClick={() => removeFromCart(item.service_name)}
                              className="text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-slate-600 mb-3" />
                    <p className="text-slate-400 text-xs italic">Keranjang belanja kosong. Pilih layanan di atas.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (4 cols): Calculation, Checkout Panel */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-lg sticky top-28 shadow-2xl backdrop-blur-md space-y-6">
                <h3 className="font-heading text-lg font-black text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary" />
                  Rincian Transaksi
                </h3>

                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Shirt className="h-3.5 w-3.5 text-secondary" /> BERAT TIMBANGAN (KG)</span>
                    </label>
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 p-2 rounded-lg">
                      <button 
                        onClick={() => setBeratKiloan(prev => prev > 0 ? prev - 1 : 0)}
                        className="h-10 w-10 bg-white/5 hover:bg-white/10 rounded border border-white/10 flex items-center justify-center transition-colors text-white"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <div className="text-center">
                        <span className="text-2xl font-black text-white">{beratKiloan}</span>
                        <span className="text-xs text-slate-400 ml-1">Kg</span>
                      </div>
                      <button 
                        onClick={() => setBeratKiloan(prev => prev + 1)}
                        className="h-10 w-10 bg-[#4DA8FF]/20 hover:bg-[#4DA8FF]/30 border border-[#4DA8FF]/30 text-[#4DA8FF] rounded flex items-center justify-center transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 italic">*Klik tombol untuk menambah/mengurangi tepat 1 Kg.</p>
                  </div>
                  
                  {beratKiloan > 0 && beratKiloan < 4 && (
                    <div className="flex items-center justify-between text-xs mt-1 bg-amber-500/10 border border-amber-500/20 p-2 rounded">
                      <span className="text-amber-400 font-semibold">Berat Kiloan Ditagih <span className="text-amber-500/70 font-normal">(min 4kg)</span></span>
                      <span className="font-black text-amber-400">4 Kg</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                    <span>Total Berat Kalkulasi Tracking</span>
                    <span className="font-bold text-white">{totalWeight.toFixed(2)} kg</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Shirt className="h-3.5 w-3.5 text-secondary" />
                      Jumlah Pcs Pakaian (Estimasi)
                    </label>
                    <Input 
                      type="number"
                      placeholder="Contoh: 15 Pcs"
                      value={estimatedPcs}
                      onChange={(e) => {
                        const val = e.target.value === "" ? "" : Math.max(1, parseInt(e.target.value) || 1);
                        setEstimatedPcs(val);
                      }}
                      className="h-10 bg-white/5 border-white/10 rounded-md text-white text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Perencanaan Bag / Load</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${totalWeight > 8 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}>
                        {splitBags.length > 0 ? `${splitBags.length} Bag` : "1 Bag"}
                      </span>
                      <Button
                        type="button"
                        onClick={() => {
                          // Initialize splits if empty
                          if (splitBags.length === 0) {
                            setSplitBags(computeAutoSplit(totalWeight, estimatedPcs));
                          }
                          setShowSplitDialog(true);
                        }}
                        className="h-7 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold border border-white/5 flex items-center gap-1"
                      >
                        <SplitSquareVertical className="h-3.5 w-3.5" />
                        Detail Split
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Pengiriman</span>
                    <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5">
                      <button 
                        onClick={() => setPickupMethod("self")}
                        className={`px-3 py-1 rounded text-[10px] font-bold ${pickupMethod === "self" ? "bg-secondary text-white" : "text-slate-400"}`}
                      >
                        Ambil Sendiri
                      </button>
                      <button 
                        onClick={() => setPickupMethod("courier")}
                        className={`px-3 py-1 rounded text-[10px] font-bold ${pickupMethod === "courier" ? "bg-secondary text-white" : "text-slate-400"}`}
                      >
                        Kurir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Diskon / Voucher */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-secondary" />
                    Potongan Harga / Diskon (Rp)
                  </label>
                  <Input 
                    type="number"
                    placeholder="Contoh: 10000"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 bg-white/5 border-white/10 rounded-md"
                  />
                </div>

                {/* Catatan Cucian */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Catatan Khusus</label>
                  <Input 
                    placeholder="Contoh: Baju putih pisahkan"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-10 bg-white/5 border-white/10 rounded-md"
                  />
                </div>

                {/* Billing details */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex justify-between items-center text-sm text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-bold">Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-400">
                    <span>Potongan</span>
                    <span className="font-bold text-red-400">- Rp {discount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-base font-black">Total Akhir</span>
                    <span className="text-2xl font-black text-[#4DA8FF]">Rp {finalAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["cash", "qris", "bank_transfer", "prepaid_balance"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method as any)}
                        className={`p-3 rounded-md border text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          paymentMethod === method
                            ? "bg-secondary/15 border-secondary text-[#4DA8FF] shadow-lg shadow-secondary/5"
                            : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        {method.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>

                  {/* Input Uang Diterima — hanya tampil saat cash */}
                  {paymentMethod === "cash" && (
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                        Uang Diterima (Rp)
                      </label>
                      <Input
                        type="number"
                        placeholder={`Min. Rp ${finalAmount.toLocaleString("id-ID")}`}
                        value={cashReceived || ""}
                        onChange={(e) => setCashReceived(Math.max(0, parseInt(e.target.value) || 0))}
                        className="h-11 bg-white/5 border-white/10 rounded-md text-white font-bold"
                      />
                      {cashReceived >= finalAmount && cashReceived > 0 && (
                        <div className="flex justify-between items-center p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-xs font-bold text-emerald-400">Kembalian</span>
                          <span className="font-black text-emerald-400 text-base">
                            Rp {(cashReceived - finalAmount).toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                      {cashReceived > 0 && cashReceived < finalAmount && (
                        <p className="text-[10px] text-red-400 font-bold">
                          ⚠ Uang kurang Rp {(finalAmount - cashReceived).toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Validation Errors — per-field sesuai Guide Section 4 */}
                {Object.keys(errors).length > 0 && (
                  <div className="p-4 rounded-lg bg-red-950/20 border border-red-500/30 space-y-2">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Validasi Gagal:
                    </p>
                    {Object.entries(errors).map(([field, errs]) => {
                      // Map field name ke label yang readable
                      const fieldLabels: Record<string, string> = {
                        estimated_weight: "Estimasi Berat",
                        customer_id: "Pelanggan",
                        outlet_id: "Outlet",
                        "items.0.service_name": "Nama Layanan (baris 1)",
                        "items.0.price_per_unit": "Harga Layanan (baris 1)",
                        "items.0.quantity": "Jumlah/Berat (baris 1)",
                        bags_count: "Jumlah Kantong",
                        discount_amount: "Potongan Harga",
                        notes: "Catatan",
                        payment_method: "Metode Pembayaran",
                        amount: "Jumlah Pembayaran",
                        name: "Nama Pelanggan",
                        phone: "Nomor WhatsApp",
                      };
                      const label = fieldLabels[field] || field;
                      return (
                        <div key={field} className="flex items-start gap-2 text-[11px]">
                          <span className="text-red-400 font-bold shrink-0">{label}:</span>
                          <span className="text-red-300">{errs[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Submit button — large for tablet touch */}
                <Button 
                  onClick={handleCheckoutSubmit}
                  disabled={isLoading || cart.length === 0}
                  className="w-full h-16 md:h-14 rounded-lg bg-[#4DA8FF] hover:bg-[#4DA8FF]/90 text-slate-950 font-black tracking-widest uppercase text-sm md:text-xs shadow-xl shadow-secondary/10 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Simpan & Bayar (F9)"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Step 4: Checkout Success & Thermal Printer Trigger screen */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto py-16"
          >
            <Card className="bg-slate-900 border-white/10 text-white rounded-[40px] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4DA8FF]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <CardContent className="p-8 md:p-12 text-center space-y-8">
                <div className="h-20 w-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Check className="h-10 w-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-black">Order Sukses Dibuat!</h3>
                  <p className="text-slate-400 text-xs md:text-sm">
                    Transaksi berhasil dicatat ke API Live Server.
                  </p>
                </div>

                {/* Receipt Preview */}
                {checkoutResult?.full_order ? (
                  <ReceiptCard 
                    order={checkoutResult.full_order} 
                    changeAmount={checkoutResult.change_amount} 
                  />
                ) : (
                  <div className="p-6 bg-slate-950 rounded-lg border border-white/5 text-center text-slate-400">
                    Loading Receipt...
                  </div>
                )}

                {thermalError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-4">
                    <p className="font-bold mb-1">Gagal Cetak Thermal</p>
                    <p>{thermalError}</p>
                    {/* Open isolated receipt page — prevents dashboard layout from cutting the print */}
                    <Button 
                      onClick={() => {
                        if (checkoutResult?.order_id) {
                          window.open(`/app/orders/${checkoutResult.order_id}/receipt-print`, "_blank", "width=400,height=700");
                        } else {
                          window.print();
                        }
                      }}
                      className="mt-3 bg-red-500 text-white hover:bg-red-600 rounded-lg text-xs"
                    >
                      🖨️ Cetak via Browser (Fallback)
                    </Button>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={async () => {
                        setIsPrinting(true);
                        setThermalError("");
                        try {
                          await api.post(`/v1/orders/${checkoutResult.order_id}/print`);
                          alert("Struk berhasil dikirim ke printer thermal!");
                        } catch (err: any) {
                          setThermalError(err.response?.data?.message || "Printer thermal offline atau gagal terhubung.");
                        } finally {
                          setIsPrinting(false);
                        }
                      }}
                      disabled={isPrinting}
                      className="flex-1 h-14 rounded-lg bg-[#4DA8FF] hover:bg-[#4DA8FF]/90 text-white font-bold gap-2 text-xs"
                    >
                      {isPrinting ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Printer className="h-5 w-5" />
                      )}
                      {isPrinting ? "Mencetak..." : "Cetak Struk Transaksi"}
                    </Button>

                    <Button 
                      onClick={() => {
                        if (checkoutResult?.order_id) {
                          window.open(`/app/orders/${checkoutResult.order_id}/production-receipt`, "_blank", "width=400,height=700");
                        }
                      }}
                      className="flex-1 h-14 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold gap-2 text-xs"
                    >
                      <Printer className="h-5 w-5" />
                      Cetak Struk Produksi
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      // Reset POS
                      setSelectedCustomer(null);
                      setCart([]);
                      setDiscount(0);
                      setNotes("");
                      setIsCheckoutSuccess(false);
                      setCheckoutResult(null);
                    }}
                    variant="outline"
                    className="w-full h-14 rounded-lg border-white/10 hover:bg-white/10 text-white font-bold text-xs"
                  >
                    Tutup & Kembali ke Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Slide-over/Dialog for Add Customer */}
      <AnimatePresence>
        {showAddCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 bg-slate-900 border border-white/10 rounded-lg shadow-2xl relative"
            >
              <h4 className="font-heading text-lg font-black mb-6">Tambah Pelanggan Baru</h4>
              <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap</label>
                  <Input 
                    required
                    placeholder="Contoh: Rendi Wijaya"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nomor WhatsApp</label>
                  <Input 
                    required
                    placeholder="Contoh: 628123456xxx"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alamat Lengkap</label>
                  <Input 
                    placeholder="Contoh: Jl. Mastrip No. 12, Jember"
                    value={newCustomerAddress}
                    onChange={(e) => setNewCustomerAddress(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-md"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowAddCustomer(false)}
                    className="flex-1 h-12 rounded-md bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 font-bold text-xs transition-all"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 rounded-md bg-[#4DA8FF] hover:bg-[#4DA8FF]/90 text-slate-950 font-black tracking-widest uppercase text-xs shadow-lg shadow-[#4DA8FF]/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Tambah Pelanggan
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Split Load Dialog (Sprint 2) */}
      <AnimatePresence>
        {showSplitDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg p-6 md:p-8 bg-slate-900 border border-white/10 rounded-lg shadow-2xl relative my-8"
            >
              {/* Header */}
              <div className="mb-6">
                <div className="h-12 w-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <SplitSquareVertical className="h-6 w-6 text-amber-400" />
                </div>
                <h4 className="font-heading text-xl font-black text-white">Rencana Pembagian Bag (Split Load)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Aturan SOP LUNDRY.id: Beban ideal per mesin/bag adalah 5-8 kg. Minimum ekonomis 4 kg, toleransi maksimal 9 kg.
                </p>
              </div>

              {/* Totals Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-white/5 border border-white/5 mb-6 text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Timbangan</p>
                  <p className="text-lg font-black text-[#4DA8FF]">{totalWeight.toFixed(2)} kg</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Estimasi Pcs</p>
                  <p className="text-lg font-black text-[#4DA8FF]">{estimatedPcs || 0} Pcs</p>
                </div>
              </div>

              {/* Bags List */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 divide-y divide-white/5">
                {splitBags.map((bag, idx) => {
                  const isUnderLoad = bag.weight > 0 && bag.weight < 4;
                  const isOverLoad = bag.weight > 9;

                  return (
                    <div key={idx} className="pt-4 first:pt-0 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Bag #{idx + 1}</span>
                        {splitBags.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...splitBags];
                              copy.splice(idx, 1);
                              setSplitBags(copy);
                            }}
                            className="text-red-400 hover:text-red-300 text-[10px] font-bold flex items-center gap-1 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Hapus Bag
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Weight Input */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Berat (kg)</label>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={bag.weight || ""}
                              onChange={(e) => {
                                const copy = [...splitBags];
                                copy[idx].weight = parseFloat(e.target.value) || 0;
                                setSplitBags(copy);
                              }}
                              className={`bg-white/5 rounded-md text-sm ${
                                isUnderLoad ? "border-amber-500/50 text-amber-300 focus:border-amber-500" :
                                isOverLoad ? "border-red-500/50 text-red-300 focus:border-red-500" :
                                "border-white/10 text-white"
                              }`}
                            />
                            {isUnderLoad && (
                              <span className="text-[9px] text-amber-400 font-bold block mt-1">Underload (&lt;4kg)</span>
                            )}
                            {isOverLoad && (
                              <span className="text-[9px] text-red-400 font-bold block mt-1">Overload (&gt;9kg)</span>
                            )}
                          </div>
                        </div>

                        {/* Pcs Input */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Pcs</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={bag.pcs === null ? "" : bag.pcs}
                            onChange={(e) => {
                              const copy = [...splitBags];
                              copy[idx].pcs = e.target.value === "" ? null : parseInt(e.target.value) || 0;
                              setSplitBags(copy);
                            }}
                            className="bg-white/5 border-white/10 rounded-md text-sm text-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Validation & Actions Panel */}
              {(() => {
                const totalSplitWeight = parseFloat(splitBags.reduce((sum, b) => sum + b.weight, 0).toFixed(2));
                const totalSplitPcs = splitBags.reduce((sum, b) => sum + (b.pcs || 0), 0);
                const weightDiff = parseFloat((totalWeight - totalSplitWeight).toFixed(2));
                const pcsDiff = (typeof estimatedPcs === "number" ? estimatedPcs : 0) - totalSplitPcs;

                const isWeightMismatch = Math.abs(weightDiff) >= 0.01;
                const isPcsMismatch = estimatedPcs !== "" && pcsDiff !== 0;

                return (
                  <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                    {/* Status Info / Errors */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Total Terbagi:</span>
                        <span className="font-bold text-white">
                          {totalSplitWeight} kg / {totalSplitPcs} Pcs
                        </span>
                      </div>
                      
                      {isWeightMismatch && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center justify-between text-amber-400">
                          <span className="flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            Selisih Berat: {weightDiff > 0 ? `Kurang ${weightDiff}` : `Kelebihan ${Math.abs(weightDiff)}`} kg
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (splitBags.length > 0) {
                                const copy = [...splitBags];
                                copy[copy.length - 1].weight = parseFloat((copy[copy.length - 1].weight + weightDiff).toFixed(2));
                                setSplitBags(copy);
                              }
                            }}
                            className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[9px] hover:bg-amber-400 transition-all uppercase tracking-wider"
                          >
                            Sesuaikan Terakhir
                          </button>
                        </div>
                      )}

                      {isPcsMismatch && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center justify-between text-amber-400">
                          <span className="flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            Selisih Pcs: {pcsDiff > 0 ? `Kurang ${pcsDiff}` : `Kelebihan ${Math.abs(pcsDiff)}`} Pcs
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (splitBags.length > 0) {
                                const copy = [...splitBags];
                                const lastIdx = copy.length - 1;
                                copy[lastIdx].pcs = (copy[lastIdx].pcs || 0) + pcsDiff;
                                setSplitBags(copy);
                              }
                            }}
                            className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[9px] hover:bg-amber-400 transition-all uppercase tracking-wider"
                          >
                            Sesuaikan Terakhir
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions Row 1: Manage Bags count */}
                    <div className="flex gap-3 justify-between items-center">
                      <Button
                        type="button"
                        onClick={() => {
                          setSplitBags([...splitBags, { weight: 0, pcs: 0 }]);
                        }}
                        className="bg-white/5 hover:bg-white/10 text-white rounded-md text-xs h-9 px-4 border border-white/5 flex items-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" /> Tambah Bag
                      </Button>

                      <Button
                        type="button"
                        onClick={() => {
                          const auto = computeAutoSplit(totalWeight, estimatedPcs);
                          setSplitBags(auto);
                        }}
                        className="bg-white/5 hover:bg-white/10 text-slate-300 rounded-md text-xs h-9 px-4 border border-white/5"
                      >
                        Reset ke Otomatis
                      </Button>
                    </div>

                    {/* Actions Row 2: Submit or Cancel */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowSplitDialog(false);
                        }}
                        className="flex-1 h-12 rounded-md bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 font-bold text-xs"
                      >
                        Batal
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setSplitConfirmed(true);
                          setShowSplitDialog(false);
                        }}
                        disabled={isWeightMismatch || isPcsMismatch}
                        className="flex-1 h-12 rounded-md bg-[#4DA8FF] hover:bg-[#4DA8FF]/90 text-slate-950 font-black tracking-widest uppercase text-xs shadow-lg shadow-[#4DA8FF]/20 transition-all disabled:opacity-40 disabled:scale-100"
                      >
                        Simpan &amp; Terapkan
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}

        {/* Close Shift Modal */}
        {showCloseShift && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-amber-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" /> Tutup Shift (Handover)
              </h2>
              <p className="text-sm text-slate-400 mb-6">Pastikan uang fisik di laci kasir sesuai dengan sistem.</p>

              <form onSubmit={submitCloseShift} className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Total Tunai Sistem</p>
                  <p className="text-2xl font-black text-white">Rp {expectedBalance.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Hanya mencakup pembayaran metode tunai/cash pada shift ini.</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-300 block mb-2">Total Fisik Uang di Laci (Actual Cash)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-500 font-bold">Rp</span>
                    <Input
                      type="number"
                      required
                      min="0"
                      value={actualBalance}
                      onChange={(e) => setActualBalance(e.target.value)}
                      placeholder="Contoh: 150000"
                      className="pl-12 bg-white/5 border-white/10 text-white text-lg rounded-xl h-14 font-bold"
                    />
                  </div>
                  {actualBalance !== "" && parseFloat(actualBalance) < expectedBalance && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 items-start">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <div className="text-xs text-red-400">
                        <p className="font-bold">Selisih Kasir Terdeteksi!</p>
                        <p>Kekurangan sejumlah <b>Rp {(expectedBalance - parseFloat(actualBalance)).toLocaleString('id-ID')}</b> akan otomatis dipotong dari gaji Anda pada siklus penggajian bulan ini.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setShowCloseShift(false)} className="flex-1 rounded-xl border-white/10 text-slate-300 hover:text-white">
                    Batal
                  </Button>
                  <Button type="submit" disabled={isClosingShift} className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black">
                    {isClosingShift ? "Menyimpan..." : "Tutup Shift & Simpan"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
