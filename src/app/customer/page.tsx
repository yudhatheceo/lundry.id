"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, User, Phone, Key, Check, Share2, Copy, 
  Plus, Minus, ShoppingBag, Award, History, Sparkles, 
  ChevronRight, CreditCard, Truck, ChevronLeft, LogOut, 
  Compass, Gift, QrCode, Info, Star, RefreshCw, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface UserProfile {
  name: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  profile_completed: boolean;
  referred_by?: string;
}

interface Order {
  id: string;
  service: string;
  type: "kiloan" | "satuan";
  amount: number;
  estimatedWeight?: number;
  itemsCount?: number;
  status: "order_created" | "courier_pickup" | "washing" | "drying" | "ironing" | "ready" | "completed";
  paymentMethod: string;
  deliveryMethod: "drop_off" | "pickup_delivery";
  date: string;
}

interface Voucher {
  id: string;
  code: string;
  title: string;
  points: number;
  type: "discount" | "free_item" | "merchandise";
  value: number;
  isUsed: boolean;
}

// Fallback Mock Map Locations for Pinpoint Simulation
const MOCK_LOCATIONS = [
  { lat: -8.1724, lng: 113.7018, name: "Jl. Kalimantan No. 37, Kampus UNEJ, Sumbersari, Jember" },
  { lat: -8.1735, lng: 113.7122, name: "Jl. Mastrip No. 12, Sumbersari, Jember" },
  { lat: -8.1654, lng: 113.6890, name: "Jl. Gajah Mada No. 154, Kaliwates, Jember" },
  { lat: -8.1890, lng: 113.7001, name: "Jl. Karimata No. 88, Sumbersari, Jember" },
  { lat: -8.1588, lng: 113.7210, name: "Jl. Danau Toba No. 42, Jember" }
];

export default function CustomerPrototype() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"home" | "order" | "vouchers" | "profile">("home");
  
  // App States (Loaded from LocalStorage)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Pelanggan Baru",
    email: "",
    address: "",
    latitude: -8.1724,
    longitude: 113.7018,
    profile_completed: false
  });
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [referralCode, setReferralCode] = useState<string>("LND-K7A9X2");
  const [orders, setOrders] = useState<Order[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // UI Flow States
  const [loginStep, setLoginStep] = useState<"phone" | "otp">("phone");
  const [otpInput, setOtpInput] = useState<string>("");
  const [otpSent, setOtpSent] = useState<string>("");
  const [showToast, setShowToast] = useState<{ message: string; points?: number } | null>(null);
  const [referralInput, setReferralInput] = useState<string>("");
  const [referralApplied, setReferralApplied] = useState<boolean>(false);
  
  // Order Selection States
  const [orderType, setOrderType] = useState<"kiloan" | "satuan">("kiloan");
  const [selectedService, setSelectedService] = useState<string>("Cuci Setrika Komplit");
  const [weightEstimate, setWeightEstimate] = useState<number>(3.0);
  const [satuanItems, setSatuanItems] = useState<{ [key: string]: number }>({
    "Kemeja / Kaos": 0,
    "Celana Panjang": 0,
    "Jaket / Jaket Kulit": 0,
    "Selimut / Bedcover": 0,
    "Jas Set": 0
  });
  const [deliveryMethod, setDeliveryMethod] = useState<"drop_off" | "pickup_delivery">("pickup_delivery");
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");

  // Google Maps Integration States
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(false);
  const [googleMapError, setGoogleMapError] = useState<boolean>(false);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  const googleMapInstance = useRef<any>(null);
  const googleMarkerInstance = useRef<any>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("laundry_customer_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setIsAuthenticated(parsed.isAuthenticated ?? false);
        setPhone(parsed.phone ?? "");
        setUserProfile(parsed.userProfile ?? {
          name: "Pelanggan Baru",
          email: "",
          address: "",
          latitude: -8.1724,
          longitude: 113.7018,
          profile_completed: false
        });
        setCoinBalance(parsed.coinBalance ?? 0);
        setReferralCode(parsed.referralCode ?? "LND-K7A9X2");
        setOrders(parsed.orders ?? []);
        setVouchers(parsed.vouchers ?? []);
        setActiveOrder(parsed.activeOrder ?? null);
        setReferralApplied(parsed.referralApplied ?? false);
      } catch (e) {
        console.error("Failed to parse customer data", e);
      }
    } else {
      // Default initial mock order to look realistic
      const initialOrders: Order[] = [
        {
          id: "LND-20260524-0002",
          service: "Cuci Kering Express (Kiloan)",
          type: "kiloan",
          amount: 25000,
          estimatedWeight: 2.5,
          status: "completed",
          paymentMethod: "cod",
          deliveryMethod: "drop_off",
          date: "24 Mei 2026"
        }
      ];
      setOrders(initialOrders);
    }
  }, []);

  // Save state to localStorage on state change
  const saveState = (updates: any) => {
    const current = {
      isAuthenticated,
      phone,
      userProfile,
      coinBalance,
      referralCode,
      orders,
      vouchers,
      activeOrder,
      referralApplied,
      ...updates
    };
    localStorage.setItem("laundry_customer_data", JSON.stringify(current));
  };

  // Google Maps API Loader
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API Key not found in env variables. Falling back to offline map.");
      setGoogleMapError(true);
      return;
    }

    if (window.hasOwnProperty("google")) {
      setGoogleMapsLoaded(true);
      return;
    }

    const scriptId = "google-maps-api-script";
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleMapsLoaded(true);
      };
      script.onerror = () => {
        console.error("Error loading Google Maps API script.");
        setGoogleMapError(true);
      };
      document.head.appendChild(script);
    } else {
      setGoogleMapsLoaded(true);
    }
  }, []);

  // Initialize Google Map once script is loaded and we are on the profile page
  useEffect(() => {
    if (
      googleMapsLoaded && 
      !googleMapError && 
      mapRef.current && 
      (isAuthenticated && !userProfile.profile_completed || activeTab === "profile")
    ) {
      try {
        const google = (window as any).google;
        const initialLatLng = { lat: userProfile.latitude, lng: userProfile.longitude };

        const map = new google.maps.Map(mapRef.current, {
          center: initialLatLng,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        googleMapInstance.current = map;

        // Custom marker setup using a cyan design pin
        const marker = new google.maps.Marker({
          position: initialLatLng,
          map: map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          title: "Lokasi Penjemputan Cucian"
        });

        googleMarkerInstance.current = marker;

        // Add drag event listener
        google.maps.event.addListener(marker, "dragend", () => {
          const position = marker.getPosition();
          const lat = position.lat();
          const lng = position.lng();
          
          handleCoordsChange(lat, lng);
        });

        // Add click event on map to reposition marker
        google.maps.event.addListener(map, "click", (event: any) => {
          const latLng = event.latLng;
          marker.setPosition(latLng);
          handleCoordsChange(latLng.lat(), latLng.lng());
        });

        setMapInitialized(true);
      } catch (err) {
        console.error("Error initializing Google Maps:", err);
        setGoogleMapError(true);
      }
    }
  }, [googleMapsLoaded, googleMapError, isAuthenticated, userProfile.profile_completed, activeTab]);

  // Handle Coordinate changes and reverse geocode
  const handleCoordsChange = (lat: number, lng: number) => {
    const google = (window as any).google;
    if (!google) return;

    const geocoder = new google.maps.Geocoder();
    const latLng = { lat, lng };

    geocoder.geocode({ location: latLng }, (results: any, status: any) => {
      let addressString = `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      if (status === "OK" && results && results[0]) {
        addressString = results[0].formatted_address;
      }

      const updated = {
        ...userProfile,
        address: addressString,
        latitude: lat,
        longitude: lng
      };
      
      setUserProfile(updated);
      saveState({ userProfile: updated });
    });
  };

  // Trigger Toast Notification
  const triggerToast = (message: string, points?: number) => {
    setShowToast({ message, points });
    setTimeout(() => {
      setShowToast(null);
    }, 4000);
  };

  // Auth Handlers
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    // Simulate OTP generation
    const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpSent(simulatedOtp);
    setLoginStep("otp");
    
    console.log(`[PROTOTYPE] WhatsApp OTP Sent to ${phone}: ${simulatedOtp}`);
    triggerToast(`OTP dikirim via WhatsApp! Masukkan kode ${simulatedOtp} untuk demo.`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === otpSent || otpInput === "123456") {
      setIsAuthenticated(true);
      
      let initialCoins = coinBalance;
      let appliedRef = referralApplied;
      
      if (referralInput && !appliedRef) {
        initialCoins += 25;
        appliedRef = true;
        setReferralApplied(true);
        triggerToast("Referral berhasil digunakan! Dapatkan +25 Koin.", 25);
      }

      setIsAuthenticated(true);
      setCoinBalance(initialCoins);
      
      saveState({ 
        isAuthenticated: true, 
        coinBalance: initialCoins, 
        referralApplied: appliedRef 
      });
      triggerToast("Login berhasil! Selamat datang di LUNDRY.id.");
    } else {
      triggerToast("Kode OTP salah. Coba masukkan '123456' atau kode dari WhatsApp.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginStep("phone");
    setOtpInput("");
    setPhone("");
    setUserProfile({
      name: "Pelanggan Baru",
      email: "",
      address: "",
      latitude: -8.1724,
      longitude: 113.7018,
      profile_completed: false
    });
    setCoinBalance(0);
    setOrders([
      {
        id: "LND-20260524-0002",
        service: "Cuci Kering Express (Kiloan)",
        type: "kiloan",
        amount: 25000,
        estimatedWeight: 2.5,
        status: "completed",
        paymentMethod: "cod",
        deliveryMethod: "drop_off",
        date: "24 Mei 2026"
      }
    ]);
    setActiveOrder(null);
    setVouchers([]);
    setReferralInput("");
    setReferralApplied(false);
    setMapInitialized(false);
    
    localStorage.removeItem("laundry_customer_data");
    triggerToast("Anda telah keluar.");
  };

  // Profile Completion Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    let bonusPoints = 0;
    let completedStatus = userProfile.profile_completed;

    if (!completedStatus) {
      bonusPoints = 100;
      completedStatus = true;
      setCoinBalance(prev => prev + 100);
      triggerToast("Profil & alamat lengkap disimpan! Anda mendapat bonus profil.", 100);
    } else {
      triggerToast("Profil berhasil diperbarui!");
    }

    const updatedProfile = {
      ...userProfile,
      profile_completed: completedStatus
    };
    setUserProfile(updatedProfile);
    saveState({ 
      userProfile: updatedProfile,
      coinBalance: coinBalance + bonusPoints 
    });
    setActiveTab("home");
  };

  // Interactive Fallback Map click handler
  const handleFallbackMapClick = (index: number) => {
    const loc = MOCK_LOCATIONS[index];
    const updated = {
      ...userProfile,
      address: loc.name,
      latitude: loc.lat,
      longitude: loc.lng
    };
    setUserProfile(updated);
    saveState({ userProfile: updated });
    triggerToast(`Lokasi dipinpoint ke: ${loc.name}`);
  };

  // Add Item Satuan Counter
  const adjustItemCount = (name: string, delta: number) => {
    setSatuanItems(prev => ({
      ...prev,
      [name]: Math.max(0, prev[name] + delta)
    }));
  };

  // Reset Order Form
  const resetOrderForm = () => {
    setWeightEstimate(3.0);
    setSatuanItems({
      "Kemeja / Kaos": 0,
      "Celana Panjang": 0,
      "Jaket / Jaket Kulit": 0,
      "Selimut / Bedcover": 0,
      "Jas Set": 0
    });
  };

  // Place Order Handler
  const handlePlaceOrder = () => {
    if (!userProfile.address) {
      triggerToast("Silakan lengkapi profil & pinpoint alamat Anda terlebih dahulu!");
      setActiveTab("profile");
      return;
    }

    let amount = 0;
    let itemsCount = 0;
    
    if (orderType === "kiloan") {
      const pricePerKg = selectedService.includes("Express") ? 10000 : 7000;
      amount = Math.round(weightEstimate * pricePerKg);
    } else {
      const prices: { [key: string]: number } = {
        "Kemeja / Kaos": 10000,
        "Celana Panjang": 12000,
        "Jaket / Jaket Kulit": 25000,
        "Selimut / Bedcover": 30000,
        "Jas Set": 45000
      };
      
      Object.keys(satuanItems).forEach(key => {
        const qty = satuanItems[key];
        if (qty > 0) {
          amount += qty * prices[key];
          itemsCount += qty;
        }
      });

      if (itemsCount === 0) {
        triggerToast("Silakan pilih minimal 1 item satuan!");
        return;
      }
    }

    if (deliveryMethod === "pickup_delivery") {
      amount += 10000; // Flat Rp10.000 courier delivery fee
    }

    const orderId = `LND-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.floor(1000 + Math.random()*9000)}`;

    const newOrder: Order = {
      id: orderId,
      service: orderType === "kiloan" ? `${selectedService} (Kiloan)` : "Pakaian Satuan Premium",
      type: orderType,
      amount,
      estimatedWeight: orderType === "kiloan" ? weightEstimate : undefined,
      itemsCount: orderType === "satuan" ? itemsCount : undefined,
      status: "order_created",
      paymentMethod,
      deliveryMethod,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    };

    const earnedCoins = Math.floor(amount / 10000);

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    setActiveOrder(newOrder);
    setCoinBalance(prev => prev + earnedCoins);

    saveState({ 
      orders: updatedOrders, 
      activeOrder: newOrder,
      coinBalance: coinBalance + earnedCoins
    });

    triggerToast(`Pesanan berhasil dikirim! Anda mendapat +${earnedCoins} Koin.`, earnedCoins);
    resetOrderForm();
  };

  // Auto Tracker simulation
  const advanceTrackerStatus = () => {
    if (!activeOrder) return;

    const stages: Order["status"][] = [
      "order_created", 
      "courier_pickup", 
      "washing", 
      "drying", 
      "ironing", 
      "ready", 
      "completed"
    ];
    
    const currentIndex = stages.indexOf(activeOrder.status);
    if (currentIndex < stages.length - 1) {
      const nextStatus = stages[currentIndex + 1];
      const updatedOrder = {
        ...activeOrder,
        status: nextStatus
      };
      
      const updatedOrders = orders.map(o => o.id === activeOrder.id ? updatedOrder : o);
      
      setActiveOrder(updatedOrder);
      setOrders(updatedOrders);
      saveState({ activeOrder: updatedOrder, orders: updatedOrders });
      
      triggerToast(`Status pesanan diperbarui ke: ${getStatusLabel(nextStatus)}`);
    } else {
      triggerToast("Cucian sudah sampai di status akhir (Selesai).");
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "order_created": return "Pesanan Dibuat";
      case "courier_pickup": return "Penjemputan Kurir";
      case "washing": return "Proses Pencucian";
      case "drying": return "Proses Pengeringan";
      case "ironing": return "Proses Penyetrikaan";
      case "ready": return "Siap Diantar / Diambil";
      case "completed": return "Selesai";
      default: return "";
    }
  };

  const getStatusDesc = (status: Order["status"]) => {
    switch (status) {
      case "order_created": return "Cucian Anda telah dicatat, menunggu kurir menjemput.";
      case "courier_pickup": return "Kurir sedang menuju lokasi Anda untuk menjemput kantong laundry.";
      case "washing": return "Cucian masuk proses pencucian dengan pembersih ramah serat kain.";
      case "drying": return "Pengerian pakaian menggunakan mesin pengering suhu terkontrol.";
      case "ironing": return "Pakaian disetrika rapi dan disemprot parfum laundry pilihan.";
      case "ready": return "Cucian wangi, rapi, dan siap dikirim balik ke tempat Anda.";
      case "completed": return "Transaksi selesai. Terima kasih telah mencuci di LUNDRY.id!";
      default: return "";
    }
  };

  const getStatusProgress = (status: Order["status"]) => {
    const stages = ["order_created", "courier_pickup", "washing", "drying", "ironing", "ready", "completed"];
    return (stages.indexOf(status) / (stages.length - 1)) * 100;
  };

  // Points Redemption Store Handlers
  const MOCK_REWARDS = [
    { id: "rew_1", title: "Diskon Belanja Rp10.000", points: 100, type: "discount" as const, value: 10000, desc: "Potongan harga langsung untuk order kiloan / satuan berikutnya." },
    { id: "rew_2", title: "Potongan Gratis 2 KG Cuci", points: 200, type: "free_item" as const, value: 14000, desc: "Potongan setara dengan harga 2kg cuci kiloan standard." },
    { id: "rew_3", title: "Exclusive Tumblr LUNDRY.id", points: 150, type: "merchandise" as const, value: 0, desc: "Tumblr minuman premium berlogo LUNDRY.id. Ambil di outlet." },
    { id: "rew_4", title: "Diskon Belanja Rp25.000", points: 220, type: "discount" as const, value: 25000, desc: "Potongan harga besar untuk cucian tumpuk akhir bulan." }
  ];

  const handleRedeemReward = (reward: typeof MOCK_REWARDS[0]) => {
    if (coinBalance < reward.points) {
      triggerToast("Koin Anda tidak mencukupi untuk melakukan penukaran ini!");
      return;
    }

    const voucherCode = `RDM-${reward.type.toUpperCase().slice(0,3)}-${Math.floor(100000 + Math.random()*900000)}`;
    const newVoucher: Voucher = {
      id: Math.random().toString(),
      code: voucherCode,
      title: reward.title,
      points: reward.points,
      type: reward.type,
      value: reward.value,
      isUsed: false
    };

    const newBalance = coinBalance - reward.points;
    const updatedVouchers = [newVoucher, ...vouchers];

    setCoinBalance(newBalance);
    setVouchers(updatedVouchers);
    saveState({ coinBalance: newBalance, vouchers: updatedVouchers });

    triggerToast(`Penukaran berhasil! Kode voucher: ${voucherCode}`, -reward.points);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center p-0 md:p-6 font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 z-50 flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-[0_10px_35px_rgba(59,130,246,0.15)] border border-blue-100 text-slate-900 max-w-sm text-sm"
          >
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              {showToast.points && showToast.points > 0 ? <Sparkles className="h-5 w-5 animate-pulse" /> : <Info className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{showToast.message}</p>
              {showToast.points !== undefined && (
                <p className={`text-xs font-bold ${showToast.points > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {showToast.points > 0 ? `+${showToast.points} Koin` : `${showToast.points} Koin`}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Mobile App Frame - Clean Bright Theme */}
      <div className="w-full max-w-md min-h-screen md:min-h-[840px] md:h-[840px] bg-slate-50 md:rounded-3xl border-0 md:border border-slate-200/80 shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Status Bar Mockup */}
        <div className="bg-white px-6 py-2.5 flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 shrink-0">
          <span className="font-bold">19:16</span>
          <div className="flex items-center gap-1.5 font-bold text-blue-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>LUNDRY.id Customer</span>
          </div>
        </div>

        {/* Dynamic Container Screen */}
        <div className="flex-1 bg-slate-50 overflow-y-auto pb-24 flex flex-col">
          {!isAuthenticated ? (
            /* ================= LOGIN SCREEN ================= */
            <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white">
              <div className="text-center mb-8">
                <div className="mb-4">
                  {/* BRANDING LOGO COMPONENT */}
                  <img 
                    src="/logo.webp" 
                    alt="LUNDRY.id Logo" 
                    className="h-16 mx-auto object-contain filter drop-shadow-sm" 
                  />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pemesanan Online</h1>
                <p className="text-slate-500 text-sm mt-1">Cepat, bersih, wangi, jemput langsung ke depan pintu</p>
              </div>

              {loginStep === "phone" ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nomor WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <input 
                        type="tel"
                        placeholder="Contoh: 08123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-700">💡 Kode Referral Pendaftaran (Opsional):</p>
                    <input 
                      type="text" 
                      placeholder="Masukkan kode referral jika ada" 
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Kirim OTP via WhatsApp
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Kode OTP 6-digit dikirim ke nomor WA:</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{phone}</p>
                    <button 
                      type="button" 
                      onClick={() => setLoginStep("phone")} 
                      className="text-xs text-blue-600 hover:underline mt-1 block mx-auto font-semibold"
                    >
                      Ubah Nomor
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">Kode Verifikasi (OTP)</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Contoh: 123456"
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-center text-slate-900 placeholder-slate-400 font-mono tracking-widest text-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 text-center mt-2">Gunakan OTP dari WhatsApp, atau ketik &apos;123456&apos; untuk demo.</p>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Verifikasi & Masuk
                  </button>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Tidak menerima kode?</span>
                    <button 
                      type="button" 
                      onClick={handleRequestOtp}
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="h-3 w-3 animate-spin-slow" /> Kirim Ulang
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : !userProfile.profile_completed ? (
            /* ================= PROFILE COMPLETION SCREEN (Pinpoint Google Maps / Fallback) ================= */
            <div className="p-6 space-y-6 bg-white flex-1">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Lengkapi Profil & Alamat</h2>
                <p className="text-slate-500 text-xs mt-1">Dapatkan bonus <span className="text-blue-600 font-bold">100 Koin Reward</span> setelah memetakan koordinat jemput pakaian Anda.</p>
              </div>

              {/* MAP INTERACTIVE PANEL (Google Maps / Fallback) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Pinpoint Lokasi Rumah Anda</label>
                <div className="relative bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden h-56 shadow-inner">
                  
                  {/* Google Maps Container */}
                  <div 
                    ref={mapRef} 
                    className={`w-full h-full ${(!googleMapsLoaded || googleMapError) ? "hidden" : "block"}`}
                  />

                  {/* Fallback Map Grid (If Google API fails or is loading) */}
                  {(!googleMapsLoaded || googleMapError) && (
                    <div className="w-full h-full relative">
                      <svg className="w-full h-full opacity-70 bg-slate-50" viewBox="0 0 400 220">
                        <defs>
                          <pattern id="grid-light" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid-light)" />
                        <line x1="0" y1="110" x2="400" y2="110" stroke="#cbd5e1" strokeWidth="6" />
                        <line x1="180" y1="0" x2="180" y2="220" stroke="#cbd5e1" strokeWidth="6" />
                        <line x1="20" y1="40" x2="380" y2="200" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="5,5" />
                        <rect x="30" y="20" width="80" height="60" rx="10" fill="#a7f3d0" opacity="0.4" />
                        <rect x="220" y="140" width="120" height="60" rx="10" fill="#a7f3d0" opacity="0.4" />
                        <circle cx="180" cy="110" r="10" fill="#3b82f6" opacity="0.8" />
                        <text x="180" y="95" fill="#2563eb" fontSize="8" textAnchor="middle" fontWeight="bold">LUNDRY.id Outlet</text>

                        {MOCK_LOCATIONS.map((loc, idx) => (
                          <g key={idx} className="cursor-pointer" onClick={() => handleFallbackMapClick(idx)}>
                            <circle cx={100 + (idx * 60)} cy={40 + (idx * 30)} r="9" fill={userProfile.address === loc.name ? "#06b6d4" : "#e2e8f0"} stroke="#3b82f6" strokeWidth="1.5" />
                            <text x={100 + (idx * 60)} y={37 + (idx * 30)} fill="#ffffff" fontSize="6" textAnchor="middle" fontWeight="bold">📌</text>
                          </g>
                        ))}
                      </svg>
                      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-slate-500 border border-slate-200 font-semibold shadow-sm">
                        Offline Fallback Map
                      </div>
                    </div>
                  )}

                  {/* Top Notification overlay for real Google Map */}
                  {googleMapsLoaded && !googleMapError && (
                    <div className="absolute top-2 left-2 right-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] text-slate-600 border border-slate-100 flex items-center justify-between shadow-sm z-10 pointer-events-none">
                      <span className="font-bold text-blue-600 flex items-center gap-1">📍 Google Maps Aktif</span>
                      <span>Geser pin merah ke lokasi Anda</span>
                    </div>
                  )}

                  {/* Coordinates indicator overlay */}
                  {userProfile.address && (
                    <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200 flex items-start gap-2 shadow-md z-10">
                      <MapPin className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-[10px] text-slate-800">
                        <p className="font-bold text-slate-900">Alamat Terpeta:</p>
                        <p className="text-slate-500 line-clamp-1">{userProfile.address}</p>
                        <p className="text-blue-600 font-semibold">Lat: {userProfile.latitude.toFixed(6)} | Lng: {userProfile.longitude.toFixed(6)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Masukkan nama Anda"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Alamat Email</label>
                  <input 
                    type="email"
                    placeholder="Contoh: user@laundry.id"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Detail Alamat Catatan (Gedung/Blok/No Rumah)</label>
                  <textarea 
                    placeholder="Contoh: Kosan Melati, Kamar 5A, Jl. Kalimantan No. 37, Jember"
                    value={userProfile.address}
                    onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 h-20 resize-none focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm shadow-sm"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all"
                >
                  Simpan & Dapatkan 100 Koin
                </button>
              </form>
            </div>
          ) : (
            /* ================= BRIGHT LIGHT THEME DASHBOARD ================= */
            <>
              {/* Tab 1: HOME/DASHBOARD */}
              {activeTab === "home" && (
                <div className="p-5 space-y-6">
                  {/* Bright Logo Header */}
                  <div className="flex justify-between items-center py-1">
                    <img 
                      src="/logo.webp" 
                      alt="LUNDRY.id Logo" 
                      className="h-8 object-contain" 
                    />
                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Mitra Utama Jember
                    </span>
                  </div>

                  {/* Header Profile Info Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-28 w-28 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-lg"></div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-500/10">
                          {userProfile.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-slate-900 text-base">{userProfile.name}</h3>
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-amber-200">
                              <Star className="h-2 w-2 fill-current" /> VIP
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs font-semibold">{phone}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-red-500 p-1.5 bg-slate-50 rounded-lg border border-slate-100 transition-colors"
                        title="Logout"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Coins & Balance Display */}
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Koin Reward</span>
                        <div className="flex items-center gap-1.5">
                          <Award className="h-5 w-5 text-amber-500" />
                          <span className="text-lg font-black text-slate-800">{coinBalance} <span className="text-xs text-slate-500 font-medium">pts</span></span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Saldo Deposit</span>
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <span className="text-lg font-black text-slate-800">Rp0 <span className="text-[9px] text-blue-600 font-bold bg-blue-50 border border-blue-100 px-1 py-0.5 rounded ml-1 cursor-pointer">Topup</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Referral Link Sharing Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50/40 p-4 rounded-xl border border-blue-100/80 flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Gift className="h-4 w-4 text-pink-500" /> Bagikan Kode Referral
                      </h4>
                      <p className="text-[10px] text-slate-500">Teman mendaftar dapat +25 Koin, Anda dapat +50 Koin.</p>
                      <p className="font-mono text-xs text-blue-600 font-bold bg-white inline-block px-2 py-0.5 rounded border border-blue-100 mt-1">{referralCode}</p>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`http://customer.lundry.id/register?ref=${referralCode}`);
                        triggerToast("Link referral disalin ke clipboard!");
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2.5 rounded-lg transition-colors shrink-0 shadow-sm shadow-blue-500/10"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Live Active Order Tracking Widget */}
                  {activeOrder && (
                    <div className="bg-white border border-blue-100 rounded-2xl p-4 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
                          <span className="text-xs font-extrabold text-blue-600">Lacak Status Cucian</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">{activeOrder.id}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-800">{getStatusLabel(activeOrder.status)}</span>
                          <span className="text-blue-600">{Math.round(getStatusProgress(activeOrder.status))}%</span>
                        </div>
                        {/* Status bar */}
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${getStatusProgress(activeOrder.status)}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{getStatusDesc(activeOrder.status)}</p>
                      </div>

                      {/* Demo tools inside tracking widget */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-semibold">🔧 Simulasi Tahapan POS:</span>
                        <button 
                          onClick={advanceTrackerStatus}
                          className="bg-blue-600 text-white font-extrabold px-3 py-1.5 rounded hover:bg-blue-700 transition-colors shadow-sm text-[9px]"
                        >
                          Lanjut Status
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Order CTA */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pesan Laundry</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => { setOrderType("kiloan"); setActiveTab("order"); }}
                        className="bg-white p-4 rounded-xl border border-slate-100 text-left hover:border-blue-300 hover:bg-slate-50/50 transition-all flex flex-col justify-between h-28 shadow-sm"
                      >
                        <ShoppingBag className="h-6 w-6 text-blue-600" />
                        <div>
                          <h5 className="text-sm font-bold text-slate-800">Cuci Kiloan</h5>
                          <p className="text-[10px] text-slate-500 mt-0.5">Hemat harian untuk pakaian casual</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => { setOrderType("satuan"); setActiveTab("order"); }}
                        className="bg-white p-4 rounded-xl border border-slate-100 text-left hover:border-cyan-400 hover:bg-slate-50/50 transition-all flex flex-col justify-between h-28 shadow-sm"
                      >
                        <Award className="h-6 w-6 text-cyan-600" />
                        <div>
                          <h5 className="text-sm font-bold text-slate-800">Cuci Satuan</h5>
                          <p className="text-[10px] text-slate-500 mt-0.5">Jas, gaun pesta, boneka, bedcover</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* History List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Riwayat Pesanan</h4>
                    
                    <div className="space-y-3">
                      {orders.map((o) => (
                        <div key={o.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-850">{o.service}</p>
                            <p className="text-[10px] text-slate-500">{o.date} • {o.deliveryMethod === "drop_off" ? "Drop-off" : "Kurir Outlet"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-800">Rp {o.amount.toLocaleString("id-ID")}</p>
                            <span className={`inline-block text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded mt-1 border ${
                              o.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                              "bg-blue-50 text-blue-700 border-blue-100 animate-pulse"
                            }`}>
                              {getStatusLabel(o.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: ORDER / CHECKOUT SCREEN */}
              {activeTab === "order" && (
                <div className="p-5 space-y-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Buat Pesanan Online</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Pesan kilat dan kurir kami siap mengambil cucian kotor Anda.</p>
                  </div>

                  {/* Order Type Toggle */}
                  <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200/20">
                    <button 
                      onClick={() => setOrderType("kiloan")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${orderType === "kiloan" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
                    >
                      Kiloan
                    </button>
                    <button 
                      onClick={() => setOrderType("satuan")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${orderType === "satuan" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
                    >
                      Satuan
                    </button>
                  </div>

                  {orderType === "kiloan" ? (
                    /* Kiloan Form */
                    <div className="space-y-5">
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Pilih Paket Layanan Kiloan</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Cuci Setrika Komplit", 
                            "Cuci Kering Saja", 
                            "Setrika Saja Rapi", 
                            "Cuci Setrika Express"
                          ].map((svc) => (
                            <button
                              key={svc}
                              type="button"
                              onClick={() => setSelectedService(svc)}
                              className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all ${
                                selectedService === svc 
                                  ? "bg-blue-50 border-blue-400 text-blue-700" 
                                  : "bg-slate-50/50 border-slate-100 text-slate-500"
                              }`}
                            >
                              {svc}
                              <span className="block text-[8px] font-normal text-slate-500 mt-1">
                                {svc.includes("Express") ? "Rp10.000/kg • 6 Jam" : "Rp7.000/kg • 2 Hari"}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex justify-between text-xs">
                          <label className="font-bold text-slate-700 uppercase tracking-wider">Estimasi Berat Laundry</label>
                          <span className="text-blue-600 font-bold text-sm">{weightEstimate.toFixed(1)} kg</span>
                        </div>
                        <input 
                          type="range"
                          min="1"
                          max="15"
                          step="0.5"
                          value={weightEstimate}
                          onChange={(e) => setWeightEstimate(parseFloat(e.target.value))}
                          className="w-full accent-blue-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400">Berat final ditimbang menggunakan timbangan digital presisi di outlet.</p>
                      </div>
                    </div>
                  ) : (
                    /* Satuan Form */
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Pilih Pakaian Per Item (Pcs)</label>
                      
                      <div className="divide-y divide-slate-100 space-y-3.5">
                        {Object.keys(satuanItems).map((key, idx) => (
                          <div key={key} className={`flex justify-between items-center ${idx > 0 ? "pt-3.5" : ""}`}>
                            <div className="space-y-0.5">
                              <h6 className="text-xs font-bold text-slate-800">{key}</h6>
                              <p className="text-[9px] text-slate-500">
                                {key.includes("Jas") ? "Rp45.000/pcs" : key.includes("Selimut") ? "Rp30.000/pcs" : key.includes("Jaket") ? "Rp25.000/pcs" : "Rp10.000/pcs"}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => adjustItemCount(key, -1)}
                                className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center hover:border-red-500 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-extrabold text-slate-800 w-4 text-center">{satuanItems[key]}</span>
                              <button 
                                onClick={() => adjustItemCount(key, 1)}
                                className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center hover:border-blue-500 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery & Payment Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Delivery Method */}
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Metode Antar</span>
                      
                      <div className="space-y-1.5">
                        <button
                          onClick={() => setDeliveryMethod("pickup_delivery")}
                          className={`w-full py-2 px-2.5 rounded text-left text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            deliveryMethod === "pickup_delivery" 
                              ? "bg-blue-50 border-blue-400 text-blue-700" 
                              : "bg-slate-50/50 border-slate-100 text-slate-500"
                          }`}
                        >
                          <Truck className="h-3.5 w-3.5" /> Kurir Penjemput
                        </button>
                        <button
                          onClick={() => setDeliveryMethod("drop_off")}
                          className={`w-full py-2 px-2.5 rounded text-left text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            deliveryMethod === "drop_off" 
                              ? "bg-blue-50 border-blue-400 text-blue-700" 
                              : "bg-slate-50/50 border-slate-100 text-slate-500"
                          }`}
                        >
                          <Compass className="h-3.5 w-3.5" /> Antar Sendiri
                        </button>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Metode Bayar</span>
                      
                      <div className="space-y-1.5">
                        <button
                          onClick={() => setPaymentMethod("cod")}
                          className={`w-full py-2 px-2.5 rounded text-left text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            paymentMethod === "cod" 
                              ? "bg-blue-50 border-blue-400 text-blue-700" 
                              : "bg-slate-50/50 border-slate-100 text-slate-500"
                          }`}
                        >
                          💵 Bayar di Tempat
                        </button>
                        <button
                          onClick={() => setPaymentMethod("wallet")}
                          className={`w-full py-2 px-2.5 rounded text-left text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            paymentMethod === "wallet" 
                              ? "bg-blue-50 border-blue-400 text-blue-700" 
                              : "bg-slate-50/50 border-slate-100 text-slate-500"
                          }`}
                        >
                          💳 Saldo Deposit
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary Address info */}
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div className="text-xs">
                      <p className="text-slate-800 font-bold">Alamat Penjemputan:</p>
                      <p className="text-slate-500 line-clamp-1">{userProfile.address}</p>
                    </div>
                  </div>

                  {/* Order Button CTA */}
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black py-4 rounded-xl shadow-xl flex justify-between items-center px-6 transition-transform active:scale-95 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/10"
                  >
                    <span>Pesan Sekarang</span>
                    <span className="flex items-center gap-1">
                      Kirim Order <ChevronRight className="h-4 w-4" />
                    </span>
                  </button>
                </div>
              )}

              {/* Tab 3: REDEEM VOUCHER STORE */}
              {activeTab === "vouchers" && (
                <div className="p-5 space-y-6">
                  {/* Point summary */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Saldo Poin Saya</span>
                      <div className="flex items-center gap-1.5">
                        <Award className="h-6 w-6 text-amber-500" />
                        <span className="text-2xl font-black text-slate-800">{coinBalance} <span className="text-xs text-slate-500 font-semibold">Koin</span></span>
                      </div>
                    </div>
                    <div className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                      <Sparkles className="h-3 w-3 animate-pulse" /> Earning Active
                    </div>
                  </div>

                  {/* Voucher List Catalogue */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Katalog Penukaran Poin</h4>
                    
                    <div className="space-y-4">
                      {MOCK_REWARDS.map((rew) => (
                        <div key={rew.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-start gap-4 shadow-sm">
                          <div className="space-y-1.5">
                            <span className="bg-blue-50 text-blue-700 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-blue-100">
                              {rew.type === "discount" ? "Potongan Belanja" : rew.type === "free_item" ? "Gratis Item" : "Merchandise"}
                            </span>
                            <h5 className="text-xs font-bold text-slate-800">{rew.title}</h5>
                            <p className="text-[10px] text-slate-500 leading-relaxed">{rew.desc}</p>
                          </div>
                          
                          <button
                            onClick={() => handleRedeemReward(rew)}
                            className="bg-amber-450 hover:bg-amber-500 text-slate-900 font-bold text-[10px] px-3.5 py-2.5 rounded-lg transition-colors shrink-0 flex flex-col items-center gap-0.5 shadow-sm border border-amber-200/50"
                          >
                            <span>Tukarkan</span>
                            <span className="text-[9px] font-black text-slate-700">{rew.points} pts</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* My Vouchers Section */}
                  {vouchers.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Voucher Saya ({vouchers.length})</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {vouchers.map((v) => (
                          <div key={v.id} className="bg-white p-3 rounded-xl border border-slate-100 space-y-2 relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 right-0 h-10 w-10 bg-blue-50 rounded-full blur-md"></div>
                            <span className="text-[8px] font-extrabold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded uppercase border border-blue-100">{v.type}</span>
                            <h6 className="text-[11px] font-bold text-slate-800 line-clamp-1">{v.title}</h6>
                            <div className="bg-slate-50 p-1.5 rounded font-mono text-[9px] text-center text-slate-700 font-extrabold select-all cursor-pointer flex items-center justify-center gap-1 border border-slate-200">
                              <QrCode className="h-3 w-3 text-blue-600" />
                              {v.code}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: USER ACCOUNT PROFILE */}
              {activeTab === "profile" && (
                <div className="p-5 space-y-6">
                  <div className="text-center py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="inline-block p-4 rounded-full bg-blue-50 border border-blue-100 text-blue-600 mb-3 shadow-inner">
                      <User className="h-8 w-8" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-850">{userProfile.name}</h4>
                    <p className="text-slate-500 text-xs mt-0.5 font-semibold">{phone}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Akun Customer terverifikasi WhatsApp</p>
                  </div>

                  {/* Profile Form (Edit Mode) */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Detail Informasi Profil</h5>
                    
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nama Lengkap</label>
                        <input 
                          type="text" 
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Email</label>
                        <input 
                          type="email" 
                          value={userProfile.email}
                          onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Alamat Pengantaran</label>
                        <textarea 
                          value={userProfile.address}
                          onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 text-xs h-16 resize-none focus:outline-none focus:border-blue-500 focus:bg-white"
                          required
                        />
                      </div>

                      <div className="text-[9px] text-slate-400 flex justify-between font-mono">
                        <span>Latitude: {userProfile.latitude.toFixed(6)}</span>
                        <span>Longitude: {userProfile.longitude.toFixed(6)}</span>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-md shadow-blue-500/10"
                      >
                        Perbarui Profil
                      </button>
                    </form>
                  </div>

                  {/* Dev Note / About */}
                  <div className="bg-slate-100/60 p-4 rounded-xl border border-slate-200 text-[10px] text-slate-500 space-y-1.5 leading-relaxed">
                    <p className="font-bold text-slate-700 flex items-center gap-1">ℹ️ Google Maps Pintar Terintegrasi:</p>
                    <p>Halaman pinpoint di profil Anda memanggil Google Maps API secara langsung menggunakan kunci API aman Anda. Jika Anda memindahkan pin merah di peta, koordinat dan alamat Anda otomatis ter-geodecode secara real-time.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ================= BOTTOM NAVIGATION BAR (Only when logged in) ================= */}
        {isAuthenticated && userProfile.profile_completed && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3.5 flex justify-between items-center text-xs shrink-0 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
            <button 
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "home" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-650"}`}
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Beranda</span>
            </button>

            <button 
              onClick={() => setActiveTab("order")}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "order" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-650"}`}
            >
              <Compass className="h-5 w-5" />
              <span>Pesan</span>
            </button>

            <button 
              onClick={() => setActiveTab("vouchers")}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "vouchers" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-650"}`}
            >
              <Gift className="h-5 w-5" />
              <span>Tukar Poin</span>
            </button>

            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "profile" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-650"}`}
            >
              <User className="h-5 w-5" />
              <span>Profil</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
