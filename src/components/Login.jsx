import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.jsx";
import Swal from 'sweetalert2';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    /* Login Logic code */
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Swal.fire({
                title: 'success',
                text: 'You are Login',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {
                window.location.href = "/dashboard";
            });
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: 'Oops',
                text: 'username or password is invalid',
                icon: 'error',
                confirmButtonText: 'Ok'
            }).then(() => {
                window.location.href = "/";
            });
        };
    }

    return (
        <div className="flex min-h-screen font-sans">
            {/* Left: Login Form */}
            <div className="flex flex-col justify-center w-full md:w-1/2 px-8 py-12 bg-white">
                <div className="mx-auto w-full max-w-md">
                    {/* Clinic Logo / Icon */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-teal-500 rounded-full p-3 shadow-lg">
                            {/* Simple cross/medical icon using SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11 2h2v7h7v2h-7v7h-2v-7H4v-2h7z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-1 tracking-tight">
                    MedLink Clinic
                    </h2>
                    <p className="text-center text-gray-500 text-sm mb-8">Sign in to your account</p>
                </div>

                <div className="mx-auto w-full max-w-md bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
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
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition"
                                placeholder="youremail@domain.com"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-lg bg-teal-500 px-4 py-2.5 font-semibold text-white shadow hover:bg-teal-600 active:bg-teal-700 transition-all"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        © {new Date().getFullYear()} MediCare Clinic Management System
                    </p>
                </div>
            </div>

            {/* Right: Clinic Image */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-teal-50 relative overflow-hidden">
                {/* Decorative circles */}
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