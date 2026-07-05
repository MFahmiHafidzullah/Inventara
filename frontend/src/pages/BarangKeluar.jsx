import { useEffect, useState } from 'react';
import { 
  ArrowUpFromLine, Plus, CheckCircle, XCircle, Clock, X, 
  Filter, Package, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

export default function BarangKeluar() {
    const [transaksi, setTransaksi] = useState([]);
    const [barangList, setBarangList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [actionId, setActionId] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [formData, setFormData] = useState({
        barang_id: '',
        jumlah: '',
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [transaksiRes, barangRes] = await Promise.all([
                api.get('/barang-keluar'),
                api.get('/barang'),
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
            await api.post('/barang-keluar', formData);
            setShowModal(false);
            setFormData({
                barang_id: '',
                jumlah: '',
                tanggal: new Date().toISOString().split('T')[0],
                keterangan: ''
            });
            fetchData();
            toast.success('Permintaan barang keluar berhasil dibuat!');
        } catch (error) {
            toast.error('Gagal membuat permintaan');
        }
    };

    const handleApprove = (id) => {
        setActionId(id);
        setConfirmAction('approve');
        setShowConfirm(true);
    };

    const handleReject = (id) => {
        setActionId(id);
        setConfirmAction('reject');
        setShowConfirm(true);
    };

    const executeAction = async () => {
        try {
            if (confirmAction === 'approve') {
                await api.post(`/barang-keluar/${actionId}/approve`);
                toast.success('Barang keluar disetujui!');
            } else {
                await api.post(`/barang-keluar/${actionId}/reject`);
                toast.success('Barang keluar ditolak');
            }
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memproses');
        } finally {
            setShowConfirm(false);
            setActionId(null);
            setConfirmAction(null);
        }
    };

    const cancelAction = () => {
        setShowConfirm(false);
        setActionId(null);
        setConfirmAction(null);
    };

    // Filter transaksi berdasarkan status
    const filteredTransaksi = activeFilter === 'all' 
        ? transaksi 
        : transaksi.filter(t => t.status === activeFilter);

    // Hitung jumlah per status untuk badge filter
    const countByStatus = {
        all: transaksi.length,
        pending: transaksi.filter(t => t.status === 'pending').length,
        approved: transaksi.filter(t => t.status === 'approved').length,
        rejected: transaksi.filter(t => t.status === 'rejected').length,
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: { 
                label: 'Pending', 
                icon: Clock, 
                bg: 'bg-amber-50', 
                text: 'text-amber-700', 
                border: 'border-amber-200',
                dot: 'bg-amber-500'
            },
            approved: { 
                label: 'Disetujui', 
                icon: CheckCircle, 
                bg: 'bg-emerald-50', 
                text: 'text-emerald-700', 
                border: 'border-emerald-200',
                dot: 'bg-emerald-500'
            },
            rejected: { 
                label: 'Ditolak', 
                icon: XCircle, 
                bg: 'bg-red-50', 
                text: 'text-red-700', 
                border: 'border-red-200',
                dot: 'bg-red-500'
            },
        };
        return configs[status] || configs.pending;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">Memuat data barang keluar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Barang Keluar</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola permintaan dan persetujuan barang keluar</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 md:px-5 md:py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
                >
                    <Plus size={18} />
                    <span className="font-medium">Request Barang Keluar</span>
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 md:p-3">
                <div className="flex items-center space-x-2 overflow-x-auto">
                    <Filter size={16} className="text-gray-400 flex-shrink-0 ml-1" />
                    {[
                        { key: 'all', label: 'Semua' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'approved', label: 'Disetujui' },
                        { key: 'rejected', label: 'Ditolak' },
                    ].map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                            className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center space-x-2 ${
                                activeFilter === filter.key
                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span>{filter.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                activeFilter === filter.key 
                                    ? 'bg-indigo-100 text-indigo-700' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {countByStatus[filter.key]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* MOBILE: Card View */}
            <div className="md:hidden space-y-3">
                {filteredTransaksi.length > 0 ? (
                    filteredTransaksi.map((item) => {
                        const statusConfig = getStatusConfig(item.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                                <StatusIcon size={12} />
                                                <span>{statusConfig.label}</span>
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900 truncate">
                                            {item.barang?.nama_barang || 'Barang Tidak Ditemukan'}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5 font-mono">
                                            {item.barang?.kode_barang || '-'}
                                        </p>
                                    </div>
                                    <div className="text-right ml-3">
                                        <p className="text-xs text-gray-500">Jumlah</p>
                                        <p className="text-lg font-bold text-red-600">-{item.jumlah}</p>
                                    </div>
                                </div>
                                
                                {item.keterangan && (
                                    <div className="bg-gray-50 rounded-lg p-2 mb-3 text-xs text-gray-600">
                                        <span className="font-medium text-gray-700">Keterangan:</span> {item.keterangan}
                                    </div>
                                )}

                                {item.status === 'pending' && (
                                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => handleApprove(item.id)}
                                            className="flex-1 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                                        >
                                            <CheckCircle size={16} />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={() => handleReject(item.id)}
                                            className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                                        >
                                            <XCircle size={16} />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                )}
                                {item.status === 'approved' && (
                                    <div className="pt-3 border-t border-gray-100 text-center">
                                        <span className="text-xs font-medium text-emerald-600">✓ Disetujui</span>
                                    </div>
                                )}
                                {item.status === 'rejected' && (
                                    <div className="pt-3 border-t border-gray-100 text-center">
                                        <span className="text-xs font-medium text-red-600">✗ Ditolak</span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Package size={32} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">Tidak ada transaksi</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {activeFilter !== 'all' ? 'Coba ubah filter status' : 'Mulai dengan membuat request barang keluar'}
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
                                {['Tanggal', 'Kode Barang', 'Nama Barang', 'Jumlah', 'Keterangan', 'Status', 'Aksi'].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransaksi.length > 0 ? (
                                filteredTransaksi.map((item) => {
                                    const statusConfig = getStatusConfig(item.status);
                                    const StatusIcon = statusConfig.icon;
                                    return (
                                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID', { 
                                                    day: 'numeric', 
                                                    month: 'short', 
                                                    year: 'numeric' 
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 font-mono">
                                                {item.barang?.kode_barang || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                {item.barang?.nama_barang || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                                    -{item.jumlah}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {item.keterangan || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                                    <StatusIcon size={14} />
                                                    <span>{statusConfig.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {item.status === 'pending' ? (
                                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button
                                                            onClick={() => handleApprove(item.id)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                                            title="Setujui"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(item.id)}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Tolak"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>
                                                ) : item.status === 'approved' ? (
                                                    <span className="text-xs font-medium text-emerald-600">✓ Disetujui</span>
                                                ) : (
                                                    <span className="text-xs font-medium text-red-600"> Ditolak</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Package size={32} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 font-medium">Tidak ada transaksi</p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    {activeFilter !== 'all' ? 'Coba ubah filter status' : 'Mulai dengan membuat request barang keluar'}
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Request Barang Keluar</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Isi detail permintaan barang</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Barang</label>
                                <select
                                    value={formData.barang_id}
                                    onChange={(e) => setFormData({ ...formData, barang_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                                    required
                                >
                                    <option value="">Pilih Barang</option>
                                    {barangList.map((barang) => (
                                        <option key={barang.id} value={barang.id}>
                                            {barang.kode_barang} - {barang.nama_barang} (Stok: {barang.stok})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah</label>
                                    <input
                                        type="number"
                                        value={formData.jumlah}
                                        onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                                        required
                                        min="1"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                                    <input
                                        type="date"
                                        value={formData.tanggal}
                                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Keterangan</label>
                                <textarea
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm resize-none"
                                    rows="3"
                                    placeholder="Alasan permintaan barang keluar (opsional)"
                                ></textarea>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm">
                                    Batal
                                </button>
                                <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm shadow-md hover:shadow-lg">
                                    Kirim Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi */}
            <ConfirmModal
                isOpen={showConfirm}
                title={confirmAction === 'approve' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
                message={
                    confirmAction === 'approve'
                        ? 'Apakah Anda yakin ingin menyetujui barang keluar ini? Stok akan otomatis berkurang.'
                        : 'Apakah Anda yakin ingin menolak permintaan barang keluar ini?'
                }
                confirmText={confirmAction === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
                type={confirmAction === 'approve' ? 'warning' : 'danger'}
                onConfirm={executeAction}
                onCancel={cancelAction}
            />
        </div>
    );
}