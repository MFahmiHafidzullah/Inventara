import { useEffect, useState } from "react";
import {
    Truck,
    Plus,
    Pencil,
    Trash2,
    X,
    Search,
    Package,
    MapPin,
    Phone,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

export default function Supplier() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        nama_supplier: "",
        kontak: "",
        alamat: "",
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setSuppliers((await api.get("/suppliers")).data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/suppliers/${editingItem.id}`, formData);
                toast.success("Supplier berhasil diupdate");
            } else {
                await api.post("/suppliers", formData);
                toast.success("Supplier baru berhasil ditambahkan");
            }
            setShowModal(false);
            fetchSuppliers();
        } catch (e) {
            toast.error("Gagal menyimpan data");
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/suppliers/${deleteId}`);
            fetchSuppliers();
            toast.success("Supplier berhasil dihapus");
        } catch (e) {
            toast.error("Gagal menghapus");
        } finally {
            setShowConfirm(false);
        }
    };

    // Filter supplier berdasarkan search term
    const filteredSuppliers = suppliers.filter(
        (s) =>
            s.nama_supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.kontak?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.alamat?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">
                        Memuat data supplier...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                        Data Supplier
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Kelola daftar supplier atau vendor Anda
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null);
                        setFormData({
                            nama_supplier: "",
                            kontak: "",
                            alamat: "",
                        });
                        setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 md:px-5 md:py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
                >
                    <Plus size={18} />
                    <span className="font-medium">Tambah Supplier</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4">
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Search size={18} className="text-slate-600" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama supplier, kontak, atau alamat..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full outline-none text-gray-800 placeholder-gray-400 text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                        >
                            <X size={16} className="text-gray-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* MOBILE: Card View */}
            <div className="md:hidden space-y-3">
                {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((s) => (
                        <div
                            key={s.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-2">
                                        <Truck size={12} className="mr-1.5" />
                                        {s.nama_supplier}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1 ml-3">
                                    <button
                                        onClick={() => {
                                            setEditingItem(s);
                                            setFormData({
                                                nama_supplier: s.nama_supplier,
                                                kontak: s.kontak || "",
                                                alamat: s.alamat || "",
                                            });
                                            setShowModal(true);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {s.kontak && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Phone
                                            size={14}
                                            className="text-gray-400 mr-2 flex-shrink-0"
                                        />
                                        <span className="truncate">
                                            {s.kontak}
                                        </span>
                                    </div>
                                )}
                                {s.alamat && (
                                    <div className="flex items-start text-sm text-gray-600">
                                        <MapPin
                                            size={14}
                                            className="text-gray-400 mr-2 mt-0.5 flex-shrink-0"
                                        />
                                        <span className="leading-relaxed">
                                            {s.alamat}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Truck size={32} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">
                                    Tidak ada supplier
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {searchTerm
                                        ? "Coba ubah kata kunci pencarian"
                                        : "Mulai dengan menambahkan supplier pertama"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* DESKTOP: Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                            <tr>
                                {[
                                    "Nama Supplier",
                                    "Kontak",
                                    "Alamat",
                                    "Aksi",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredSuppliers.length > 0 ? (
                                filteredSuppliers.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="hover:bg-slate-50/50 transition-colors duration-150 group"
                                    >
                                        <td className="px-6 py-4 text-sm">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                <Truck
                                                    size={14}
                                                    className="mr-1.5"
                                                />
                                                {s.nama_supplier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {s.kontak || (
                                                <span className="text-gray-400 italic">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate"
                                            title={s.alamat}
                                        >
                                            {s.alamat || (
                                                <span className="text-gray-400 italic">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(s);
                                                        setFormData({
                                                            nama_supplier:
                                                                s.nama_supplier,
                                                            kontak:
                                                                s.kontak || "",
                                                            alamat:
                                                                s.alamat || "",
                                                        });
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(s.id)
                                                    }
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Truck
                                                    size={32}
                                                    className="text-gray-400"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 font-medium">
                                                    Tidak ada supplier
                                                </p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    {searchTerm
                                                        ? "Coba ubah kata kunci pencarian"
                                                        : "Mulai dengan menambahkan supplier pertama"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingItem
                                        ? "Edit Supplier"
                                        : "Tambah Supplier"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {editingItem
                                        ? "Perbarui informasi supplier"
                                        : "Tambahkan vendor atau pemasok baru"}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nama Supplier
                                </label>
                                <input
                                    type="text"
                                    value={formData.nama_supplier}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nama_supplier: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                                    placeholder="Contoh: PT. Maju Jaya"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Kontak (No HP / Email)
                                </label>
                                <input
                                    type="text"
                                    value={formData.kontak}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            kontak: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                                    placeholder="0812-xxxx-xxxx atau email@supplier.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Alamat
                                </label>
                                <textarea
                                    value={formData.alamat}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            alamat: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm resize-none"
                                    rows="3"
                                    placeholder="Alamat lengkap supplier (opsional)"
                                ></textarea>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            <ConfirmModal
                isOpen={showConfirm}
                title="Hapus Supplier"
                message="Yakin ingin menghapus supplier ini? Tindakan ini tidak bisa dibatalkan."
                onConfirm={confirmDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
}
