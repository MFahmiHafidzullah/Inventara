import { useState, useEffect } from "react";
import {
    Upload,
    Save,
    Image as ImageIcon,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Settings() {
    const [logo, setLogo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentLogo, setCurrentLogo] = useState(null);

    useEffect(() => {
        fetchLogo();
    }, []);

    const fetchLogo = async () => {
        try {
            const res = await api.get("/settings");
            if (res.data.logo_url) {
                setCurrentLogo(res.data.logo_url);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi ukuran file (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Ukuran file maksimal 2MB");
                return;
            }
            setLogo(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!logo) {
            toast.error("Pilih file logo dulu!");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("logo", logo);

        try {
            await api.post("/settings/logo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Logo berhasil diganti!");
            fetchLogo();
            setLogo(null);
            setPreview(null);
        } catch (e) {
            toast.error("Gagal upload logo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    Pengaturan Aplikasi
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Custom branding untuk Inventara
                </p>
            </div>

            {/* Logo Upload Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 max-w-2xl">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                        <ImageIcon size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Ganti Logo Aplikasi
                        </h2>
                        <p className="text-sm text-gray-500">
                            Upload logo perusahaan Anda
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Preview Logo Saat Ini */}
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
                        <p className="text-sm font-medium text-gray-600 mb-4">
                            Logo Saat Ini
                        </p>
                        {currentLogo ? (
                            <div className="relative">
                                <img
                                    src={currentLogo}
                                    alt="Current Logo"
                                    className="h-20 object-contain"
                                />
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <CheckCircle
                                        size={14}
                                        className="text-white"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                                I
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-3">
                            {currentLogo
                                ? "Logo custom aktif"
                                : "Menggunakan logo default"}
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3">
                        <AlertCircle
                            size={20}
                            className="text-blue-600 flex-shrink-0 mt-0.5"
                        />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">
                                Rekomendasi Format
                            </p>
                            <ul className="text-xs space-y-1 text-blue-700">
                                <li>• Format: PNG, JPG, atau SVG</li>
                                <li>• Ukuran maksimal: 2MB</li>
                                <li>
                                    • Resolusi ideal: 512x512px atau lebih besar
                                </li>
                                <li>
                                    • Background transparan direkomendasikan
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Form Upload */}
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Upload Logo Baru
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-indigo-50 file:text-indigo-700 hover:file:from-blue-100 hover:file:to-indigo-100 file:cursor-pointer file:transition-all file:duration-200 border border-gray-200 rounded-xl p-2"
                                />
                            </div>
                        </div>

                        {/* Preview Logo Baru */}
                        {preview && (
                            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl">
                                <div className="relative">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="h-16 object-contain"
                                    />
                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <CheckCircle
                                            size={12}
                                            className="text-white"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-emerald-900">
                                        Preview Logo Baru
                                    </p>
                                    <p className="text-xs text-emerald-700 mt-0.5">
                                        Logo siap diupload
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !logo}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Mengupload...</span>
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    <span>Simpan Logo</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Additional Settings (Placeholder untuk masa depan) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 max-w-2xl opacity-60">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Save size={20} className="text-gray-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-700">
                            Pengaturan Lainnya
                        </h2>
                        <p className="text-sm text-gray-500">
                            Fitur tambahan akan segera hadir
                        </p>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">
                        🚧 Dalam pengembangan: Pengaturan notifikasi, tema
                        warna, dan preferensi user
                    </p>
                </div>
            </div>
        </div>
    );
}
