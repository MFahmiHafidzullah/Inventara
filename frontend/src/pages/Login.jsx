import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState(null);

    // Dynamic state untuk data demo widget (Poin 1)
    const [stats, setStats] = useState({
        warehouseCapacity: 74,
        status: "Optimal",
    });

    useEffect(() => {
        const fetchLogoAndStats = async () => {
            try {
                const response = await axios.get("/api/settings");
                if (response.data && response.data.logo) {
                    const logoUrl = response.data.logo.startsWith("http")
                        ? response.data.logo
                        : `${window.location.origin}/storage/${response.data.logo}`;
                    setLogo(logoUrl);
                }

                // Mengambil angka kapasitas real dari API jika tersedia (Fallback ke demo data 74%)
                if (response.data && response.data.warehouseCapacity) {
                    setStats({
                        warehouseCapacity: response.data.warehouseCapacity,
                        status: response.data.status || "Optimal",
                    });
                }
            } catch (error) {
                console.log(
                    "Setting/Stats belum diset, menggunakan demo preview.",
                );
            }
        };

        fetchLogoAndStats();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("/api/login", formData);
            const { token, user, access_token } = response.data;
            const finalToken = token || access_token;

            if (finalToken) {
                localStorage.setItem("token", finalToken);
                if (user) {
                    localStorage.setItem("user", JSON.stringify(user));
                }
                axios.defaults.headers.common["Authorization"] =
                    `Bearer ${finalToken}`;
                toast.success(`Selamat datang, ${user?.name || "Admin"}!`);
                navigate("/dashboard", { replace: true });
            } else {
                toast.error("Login gagal: Token tidak ditemukan.");
            }
        } catch (error) {
            const message =
                error.response?.data?.message || "Email atau password salah.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200/60">
                {/* Panel Dekoratif (Desktop Only - Poin 3) */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-10 flex-col justify-between relative overflow-hidden">
                    {/* Hiasan Blur Light */}
                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Logo & Header Panel Kiri */}
                    <div className="relative z-10 flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-wider text-white">
                            INVENTARA
                        </span>
                    </div>

                    {/* Content & Mini Dashboard Preview */}
                    <div className="relative z-10 my-auto py-6">
                        <h1 className="text-3xl font-extrabold text-white leading-tight">
                            Smart Inventory.
                            <br />
                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                                Better Decisions.
                            </span>
                        </h1>
                        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                            Pantau pergerakan stok, analisis transaksi gudang,
                            dan optimalkan efisiensi operasional dalam satu
                            platform.
                        </p>

                        {/* Visual Preview Mini Dashboard dengan Data State (Poin 1) */}
                        <div className="mt-6 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm shadow-inner space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></div>
                                    <span className="text-xs font-medium text-slate-300">
                                        Status Gudang Utama (Demo)
                                    </span>
                                </div>
                                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    {stats.status}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[11px] text-slate-400">
                                    <span>Kapasitas Stok</span>
                                    <span>{stats.warehouseCapacity}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${stats.warehouseCapacity}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Panel Kiri Disesuaikan (Poin 2) */}
                    <div className="relative z-10 text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>© 2026 Inventara</span>
                        <span className="text-slate-500 hidden sm:inline">
                            •
                        </span>
                        <span className="text-slate-500">
                            Warehouse Management System
                        </span>
                    </div>
                </div>

                {/* Form Login Panel (Mobile Responsif Aman - Poin 3) */}
                <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
                    <div className="text-center md:text-left mb-6 sm:mb-8">
                        <div className="flex justify-center md:justify-start">
                            {logo ? (
                                <div className="h-14 sm:h-16 w-14 sm:w-16 mb-4 flex items-center justify-center">
                                    <img
                                        src={logo}
                                        alt="Company Logo"
                                        className="max-h-16 max-w-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="h-12 sm:h-14 w-12 sm:w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg md:hidden">
                                    <svg
                                        className="h-7 sm:h-8 w-7 sm:w-8 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            Selamat Datang
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Silakan masuk ke akun{" "}
                            <span className="font-semibold text-slate-800">
                                Inventara
                            </span>{" "}
                            kamu
                        </p>
                    </div>

                    <form
                        className="space-y-4 sm:space-y-5"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-slate-700 mb-1.5"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@inventara.com"
                                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-slate-700 mb-1.5"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            />
                        </div>

                        <div className="flex items-center justify-end">
                            <a
                                href="#"
                                className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toast("Fitur ini belum tersedia", {
                                        icon: "ℹ️",
                                    });
                                }}
                            >
                                Lupa password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99]"
                        >
                            {loading ? (
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            ) : (
                                "Masuk"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs text-slate-400 md:hidden space-y-1">
                        <p>© 2026 Inventara</p>
                        <p className="text-slate-400">
                            Warehouse Management System
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
