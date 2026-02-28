import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.jsx";
import Swal from 'sweetalert2';

const DEMO_ACCOUNTS = [
  { label: "Admin",        icon: "🛡️", email: "admin@gmail.com",        password: "123456789", color: "#7c3aed", bg: "#f5f3ff", border: "#e9d5ff" },
  { label: "Doctor",       icon: "🩺", email: "doctor@gmail.com",       password: "123456789", color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" },
  { label: "Receptionist", icon: "🗃️", email: "receptionist@gmail.com", password: "123456789", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  { label: "Patient",      icon: "🏥", email: "patient@gmail.com",      password: "123456789", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
];

function Login() {
    const [email,      setEmail]      = useState("");
    const [password,   setPassword]   = useState("");
    const [loading,    setLoading]    = useState(false);
    const [activeDemo, setActiveDemo] = useState(null);

    /* Quick fill demo account */
    const fillDemo = (acc) => {
        setEmail(acc.email);
        setPassword(acc.password);
        setActiveDemo(acc.label);
    };

    /* Login Logic */
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Swal.fire({
                title: 'Success!',
                text: 'You are logged in.',
                icon: 'success',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#14b8a6',
            }).then(() => {
                window.location.href = "/dashboard";
            });
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: 'Oops',
                text: 'Email or password is invalid.',
                icon: 'error',
                confirmButtonText: 'Try Again',
                confirmButtonColor: '#14b8a6',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen font-sans">

            {/* ── Left: Login Form ── */}
            <div className="flex flex-col justify-center w-full md:w-1/2 px-8 py-12 bg-white overflow-y-auto">
                <div className="mx-auto w-full max-w-md">

                    {/* Logo */}
                    <div className="flex items-center justify-center mb-5">
                        <div className="bg-teal-500 rounded-full p-3 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11 2h2v7h7v2h-7v7h-2v-7H4v-2h7z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-1 tracking-tight">
                        MedLink Clinic
                    </h2>
                    <p className="text-center text-gray-500 text-sm mb-7">Sign in to your account</p>

                    {/* ── Demo Quick Login Buttons ── */}
                    <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-400 text-center uppercase tracking-widest mb-3">
                            🎯 Quick Demo Login
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                            {DEMO_ACCOUNTS.map((acc) => (
                                <button
                                    key={acc.label}
                                    type="button"
                                    onClick={() => fillDemo(acc)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                                    style={{
                                        background: activeDemo === acc.label ? acc.color : acc.bg,
                                        color:      activeDemo === acc.label ? "#fff"    : acc.color,
                                        border:     `1.5px solid ${activeDemo === acc.label ? acc.color : acc.border}`,
                                        boxShadow:  activeDemo === acc.label ? `0 4px 14px ${acc.color}45` : "none",
                                        transform:  activeDemo === acc.label ? "translateY(-1px)" : "none",
                                    }}
                                >
                                    <span className="text-base">{acc.icon}</span>
                                    <span>Login as {acc.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Hint text when a demo is selected */}
                        {activeDemo ? (
                            <p className="text-center text-xs text-teal-500 font-semibold mt-2.5">
                                ✓ {activeDemo} credentials filled — click Sign In below
                            </p>
                        ) : (
                            <p className="text-center text-xs text-gray-400 mt-2.5">
                                Click a role above to auto-fill credentials
                            </p>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-gray-200"/>
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">or enter manually</span>
                        <div className="flex-1 h-px bg-gray-200"/>
                    </div>

                    {/* ── Form ── */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-7">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setActiveDemo(null); }}
                                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition"
                                    placeholder="youremail@domain.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setActiveDemo(null); }}
                                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 font-semibold text-white shadow hover:bg-teal-600 active:bg-teal-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : "Sign In"}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-xs text-gray-400">
                            © {new Date().getFullYear()} MediCare Clinic Management System
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Right: Clinic Image ── */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-teal-50 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-72 h-72 bg-teal-100 rounded-full opacity-60" />
                <div className="absolute -bottom-20 -left-10 w-96 h-96 bg-teal-200 rounded-full opacity-40" />
                <div className="relative z-10 text-center px-8">
                    <img
                        src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=800&q=80"
                        alt="Clinic"
                        className="max-h-[70vh] max-w-full rounded-3xl shadow-2xl object-cover mx-auto"
                    />
                    <h3 className="mt-6 text-2xl font-bold text-teal-800">Your Health, Our Priority</h3>
                    <p className="text-teal-600 mt-2 text-sm">Providing quality care with a modern management system</p>
                </div>
            </div>

        </div>
    );
}

export default Login;