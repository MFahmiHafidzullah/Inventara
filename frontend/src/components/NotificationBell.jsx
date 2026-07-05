import { useState, useEffect, useRef } from "react";
import {
    Bell,
    Check,
    Trash2,
    AlertTriangle,
    Package,
    Loader,
} from "lucide-react";
import api from "../services/api";

export default function NotificationBell() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();

        // Polling setiap 30 detik
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get("/notifications");
            setNotifications(response.data.all);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post("/notifications/read-all");
            fetchNotifications();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            fetchNotifications();
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const getNotificationIcon = (type) => {
        if (type === "low_stock" || type === "stok_menipis") {
            return (
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-red-600" size={16} />
                </div>
            );
        }
        return (
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={16} />
            </div>
        );
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Baru saja";
        if (diffInSeconds < 3600)
            return `${Math.floor(diffInSeconds / 60)} menit lalu`;
        if (diffInSeconds < 86400)
            return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
        if (diffInSeconds < 604800)
            return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`relative p-2 rounded-xl transition-all duration-200 ${
                    showDropdown
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-gray-100 text-gray-600"
                }`}
            >
                <Bell
                    size={20}
                    className={unreadCount > 0 ? "animate-pulse" : ""}
                />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-md ring-2 ring-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="fixed sm:absolute top-16 sm:top-auto left-4 right-4 sm:left-auto sm:right-0 sm:mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[500px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 sm:w-96">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-blue-50/30">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-gray-900">
                                Notifikasi
                            </h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                    {unreadCount} baru
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 hover:bg-blue-50 rounded-lg"
                            >
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Loader
                                    size={32}
                                    className="mx-auto mb-3 text-blue-500 animate-spin"
                                />
                                <p className="text-sm text-gray-500">
                                    Memuat notifikasi...
                                </p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell size={32} className="text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-600">
                                    Tidak ada notifikasi
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Anda akan mendapat notifikasi di sini
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors duration-150 group ${
                                            !notif.read_at
                                                ? "bg-blue-50/30"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                {getNotificationIcon(
                                                    notif.data?.type ||
                                                        notif.data?.tipe,
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`text-sm leading-relaxed ${!notif.read_at ? "text-gray-900 font-medium" : "text-gray-700"}`}
                                                >
                                                    {notif.data?.pesan ||
                                                        notif.data?.message ||
                                                        (notif.data?.tipe ===
                                                        "stok_menipis"
                                                            ? `Stok ${notif.data.nama_barang} menipis! Sisa: ${notif.data.stok} unit`
                                                            : notif.data
                                                                    ?.barang_keluar_id
                                                              ? `Ada permintaan barang keluar: ${notif.data.barang_nama || "Unknown"}`
                                                              : "Notifikasi baru")}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1.5">
                                                    {formatTimeAgo(
                                                        notif.created_at,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                {!notif.read_at && (
                                                    <button
                                                        onClick={() =>
                                                            handleMarkAsRead(
                                                                notif.id,
                                                            )
                                                        }
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Tandai sudah dibaca"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        handleDelete(notif.id)
                                                    }
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
                            <button
                                onClick={() => setShowDropdown(false)}
                                className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
