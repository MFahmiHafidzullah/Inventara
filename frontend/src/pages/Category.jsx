import { useEffect, useState } from "react";
import { Tag, Plus, Pencil, Trash2, X, Search, Package } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

export default function Category() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        nama_kategori: "",
        deskripsi: "",
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setCategories((await api.get("/categories")).data);
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
                await api.put(`/categories/${editingItem.id}`, formData);
                toast.success("Kategori berhasil diupdate");
            } else {
                await api.post("/categories", formData);
                toast.success("Kategori baru berhasil ditambahkan");
            }
            setShowModal(false);
            fetchCategories();
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
            await api.delete(`/categories/${deleteId}`);
            fetchCategories();
            toast.success("Kategori berhasil dihapus");
        } catch (e) {
            toast.error("Gagal menghapus");
        } finally {
            setShowConfirm(false);
        }
    };

    // Filter kategori berdasarkan search term
    const filteredCategories = categories.filter(
        (c) =>
            c.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">
                        Memuat data kategori...
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
                        Data Kategori
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Kelola kategori atau jenis barang
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null);
                        setFormData({ nama_kategori: "", deskripsi: "" });
                        setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 md:px-5 md:py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
                >
                    <Plus size={18} />
                    <span className="font-medium">Tambah Kategori</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4">
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Search size={18} className="text-indigo-600" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama kategori atau deskripsi..."
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
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((c) => (
                        <div
                            key={c.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        <Tag size={12} className="mr-1.5" />
                                        {c.nama_kategori}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1 ml-3">
                                    <button
                                        onClick={() => {
                                            setEditingItem(c);
                                            setFormData({
                                                nama_kategori: c.nama_kategori,
                                                deskripsi: c.deskripsi || "",
                                            });
                                            setShowModal(true);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            {c.deskripsi && (
                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">
                                    {c.deskripsi}
                                </p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Tag size={32} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">
                                    Tidak ada kategori
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {searchTerm
                                        ? "Coba ubah kata kunci pencarian"
                                        : "Mulai dengan menambahkan kategori pertama"}
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
                                {["Nama Kategori", "Deskripsi", "Aksi"].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                        >
                                            {h}
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="hover:bg-indigo-50/30 transition-colors duration-150 group"
                                    >
                                        <td className="px-6 py-4 text-sm">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                <Tag
                                                    size={14}
                                                    className="mr-1.5"
                                                />
                                                {c.nama_kategori}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                                            {c.deskripsi || (
                                                <span className="text-gray-400 italic">
                                                    Tidak ada deskripsi
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(c);
                                                        setFormData({
                                                            nama_kategori:
                                                                c.nama_kategori,
                                                            deskripsi:
                                                                c.deskripsi ||
                                                                "",
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
                                                        handleDelete(c.id)
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
                                        colSpan="3"
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Tag
                                                    size={32}
                                                    className="text-gray-400"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 font-medium">
                                                    Tidak ada kategori
                                                </p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    {searchTerm
                                                        ? "Coba ubah kata kunci pencarian"
                                                        : "Mulai dengan menambahkan kategori pertama"}
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
                                        ? "Edit Kategori"
                                        : "Tambah Kategori"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {editingItem
                                        ? "Perbarui informasi kategori"
                                        : "Buat kategori baru untuk barang"}
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
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    value={formData.nama_kategori}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nama_kategori: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                                    placeholder="Contoh: Elektronik, ATK, Makanan"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={formData.deskripsi}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            deskripsi: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm resize-none"
                                    rows="3"
                                    placeholder="Deskripsi singkat kategori (opsional)"
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
                title="Hapus Kategori"
                message="Yakin ingin menghapus kategori ini? Tindakan ini tidak bisa dibatalkan."
                onConfirm={confirmDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
}
