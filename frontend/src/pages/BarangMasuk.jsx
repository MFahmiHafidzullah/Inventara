import { useEffect, useState } from "react";
import { ArrowDownToLine, Plus, Search, X, Package } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function BarangMasuk() {
    const [transaksi, setTransaksi] = useState([]);
    const [barangList, setBarangList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        barang_id: "",
        jumlah: "",
        tanggal: new Date().toISOString().split("T")[0],
        keterangan: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [transaksiRes, barangRes] = await Promise.all([
                api.get("/barang-masuk"),
                api.get("/barang"),
            ]);
            setTransaksi(transaksiRes.data);
            setBarangList(barangRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/barang-masuk", formData);
            setShowModal(false);
            setFormData({
                barang_id: "",
                jumlah: "",
                tanggal: new Date().toISOString().split("T")[0],
                keterangan: "",
            });
            fetchData();
            toast.success("Barang masuk berhasil ditambahkan!");
        } catch (error) {
            toast.error("Gagal menambahkan barang masuk");
        }
    };

    // Filter transaksi berdasarkan search term
    const filteredTransaksi = transaksi.filter(
        (item) =>
            item.barang?.nama_barang
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            item.barang?.kode_barang
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            item.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">
                        Memuat data barang masuk...
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
                        Barang Masuk
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Catat semua transaksi barang masuk ke gudang
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 md:px-5 md:py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
                >
                    <Plus size={18} />
                    <span className="font-medium">Tambah Barang Masuk</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4">
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Search size={18} className="text-emerald-600" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama barang, kode, atau keterangan..."
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
                {filteredTransaksi.length > 0 ? (
                    filteredTransaksi.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            {item.barang?.kode_barang || "-"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(
                                                item.tanggal,
                                            ).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 truncate">
                                        {item.barang?.nama_barang ||
                                            "Barang Tidak Ditemukan"}
                                    </h3>
                                </div>
                                <div className="text-right ml-3">
                                    <p className="text-xs text-gray-500">
                                        Jumlah
                                    </p>
                                    <p className="text-lg font-bold text-emerald-600">
                                        +{item.jumlah}
                                    </p>
                                </div>
                            </div>

                            {item.keterangan && (
                                <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600">
                                    <span className="font-medium text-gray-700">
                                        Keterangan:
                                    </span>{" "}
                                    {item.keterangan}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Package size={32} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">
                                    Tidak ada transaksi
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {searchTerm
                                        ? "Coba ubah kata kunci pencarian"
                                        : "Mulai dengan menambahkan barang masuk"}
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
                                    "Tanggal",
                                    "Kode Barang",
                                    "Nama Barang",
                                    "Jumlah",
                                    "Keterangan",
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
                            {filteredTransaksi.length > 0 ? (
                                filteredTransaksi.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-emerald-50/30 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {new Date(
                                                item.tanggal,
                                            ).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 font-mono">
                                            {item.barang?.kode_barang || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                            {item.barang?.nama_barang || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <ArrowDownToLine size={14} />
                                                <span>+{item.jumlah}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                            {item.keterangan || "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Package
                                                    size={32}
                                                    className="text-gray-400"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 font-medium">
                                                    Tidak ada transaksi
                                                </p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    {searchTerm
                                                        ? "Coba ubah kata kunci pencarian"
                                                        : "Mulai dengan menambahkan barang masuk"}
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
                                    Tambah Barang Masuk
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Catat transaksi barang masuk
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
                                    Barang
                                </label>
                                <select
                                    value={formData.barang_id}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            barang_id: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                                    required
                                >
                                    <option value="">Pilih Barang</option>
                                    {barangList.map((barang) => (
                                        <option
                                            key={barang.id}
                                            value={barang.id}
                                        >
                                            {barang.kode_barang} -{" "}
                                            {barang.nama_barang}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Jumlah
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.jumlah}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                jumlah: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                                        required
                                        min="1"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tanggal
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.tanggal}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                tanggal: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Keterangan
                                </label>
                                <textarea
                                    value={formData.keterangan}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            keterangan: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm resize-none"
                                    rows="3"
                                    placeholder="Catatan tambahan (opsional)"
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
        </div>
    );
}
