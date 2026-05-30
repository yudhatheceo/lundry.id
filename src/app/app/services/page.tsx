"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ServiceItem {
  id: number;
  category: string;
  service_name: string;
  duration: string;
  price: number;
  unit: string;
  is_active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    service_name: "",
    duration: "",
    price: "",
    unit: "",
    is_active: true,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res: any = await api.get("/v1/services");
      const items = res.data?.data || res.data || res;
      setServices(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Gagal mengambil data layanan", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenModal = (service?: ServiceItem) => {
    if (service) {
      setEditingId(service.id);
      setFormData({
        category: service.category,
        service_name: service.service_name,
        duration: service.duration,
        price: service.price.toString(),
        unit: service.unit,
        is_active: service.is_active,
      });
    } else {
      setEditingId(null);
      setFormData({
        category: "",
        service_name: "",
        duration: "",
        price: "",
        unit: "",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseInt(formData.price),
      };

      if (editingId) {
        await api.put(`/v1/services/${editingId}`, payload);
      } else {
        await api.post("/v1/services", payload);
      }
      handleCloseModal();
      fetchServices();
      alert("Layanan berhasil disimpan!");
    } catch (error: any) {
      console.error("Gagal menyimpan layanan", error);
      alert("Error: " + (error.response?.data?.message || "Gagal menyimpan data layanan"));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus layanan ini?")) {
      try {
        await api.delete(`/v1/services/${id}`);
        fetchServices();
      } catch (error) {
        console.error("Gagal menghapus layanan", error);
      }
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Link href="/app" className="hover:text-blue-600 transition-colors flex items-center gap-1 text-sm font-medium">
              <ArrowLeft size={16} /> Kembali ke Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kelola Layanan</h1>
          <p className="text-slate-500 mt-1">Atur pricelist layanan laundry untuk sinkronisasi POS & Outlet secara terpusat.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200">
          <Plus size={16} /> Tambah Layanan Baru
        </Button>
      </div>

      <Card className="overflow-hidden border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Kategori</th>
                <th className="px-6 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Nama Layanan</th>
                <th className="px-6 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Durasi</th>
                <th className="px-6 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Harga</th>
                <th className="px-6 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Satuan</th>
                <th className="px-6 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-500 font-medium animate-pulse">Memuat data layanan...</p>
                    </div>
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-4 bg-slate-100 rounded-full mb-2">
                        <Plus className="text-slate-400" size={24} />
                      </div>
                      <p className="text-slate-600 font-medium">Belum ada layanan</p>
                      <p className="text-slate-400 text-sm">Tambahkan layanan pertama Anda sekarang.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-900">{svc.category}</td>
                    <td className="px-6 py-4 text-slate-700">{svc.service_name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200">{svc.duration}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600">Rp {svc.price.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4 text-slate-500">{svc.unit}</td>
                    <td className="px-6 py-4">
                      {svc.is_active ? (
                        <span className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold px-2.5 py-1 bg-emerald-100 rounded-full w-max border border-emerald-200">
                          <CheckCircle size={14} className="text-emerald-600" /> Aktif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-700 text-xs font-bold px-2.5 py-1 bg-rose-100 rounded-full w-max border border-rose-200">
                          <XCircle size={14} className="text-rose-600" /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50" onClick={() => handleOpenModal(svc)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50" onClick={() => handleDelete(svc.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? "Ubah Detail Layanan" : "Tambah Layanan Baru"}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kategori Layanan</label>
                <input required type="text" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900" placeholder="Contoh: Cuci, Kering, Setrika"
                  value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nama Layanan</label>
                  <input required type="text" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900" placeholder="Contoh: Reguler"
                    value={formData.service_name} onChange={(e) => setFormData({...formData, service_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Durasi Penyelesaian</label>
                  <input required type="text" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900" placeholder="Contoh: 2 Hari"
                    value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tarif (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-500 font-medium">Rp</span>
                    <input required type="number" className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-bold" placeholder="6000"
                      value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Satuan</label>
                  <input required type="text" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900" placeholder="Contoh: per Kg"
                    value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-sm font-bold text-slate-700">Status Aktif</span>
                </label>
              </div>

              <div className="flex gap-3 pt-6 mt-2 border-t border-slate-100">
                <Button type="button" variant="outline" className="flex-1 rounded-xl h-11 font-semibold" onClick={handleCloseModal}>Batal</Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold shadow-lg shadow-blue-200">
                  {editingId ? "Simpan Perubahan" : "Simpan Layanan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
