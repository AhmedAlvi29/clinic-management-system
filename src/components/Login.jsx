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
                window.location.href = "/home";
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
        <div className="flex min-h-screen">
            {/* login page coding */}
            <div className="flex flex-col justify-center w-full md:w-1/2 px-8 py-12 bg-gradient-to-br from-[#22223B] via-[#37306B] to-[#1A1A2E]">
                <div className="mx-auto w-full max-w-md">
                    <img
                        alt="PitchCraft"
                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                        className="mx-auto h-12 w-12 mb-4"
                    />
                    <h2 className="text-3xl font-bold text-center tracking-tight text-white mb-10" style={{ textShadow: '0 5px 32px #191733' }}>Sign in to your account</h2>
                </div>
                <div className="mx-auto w-full max-w-md bg-white/10 rounded-xl shadow-xl p-8 backdrop-blur-lg">
                    <form onSubmit={handleLogin} className="space-y-8">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-purple-100 mb-1">
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
                                className="block w-full rounded-lg bg-[#191733] border border-[#5551b5] px-4 py-2 text-base text-white placeholder:text-purple-300 focus:border-[#836FFF] focus:ring-[#836FFF] focus:outline-none transition"
                                placeholder="johndoe@email.com"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-purple-100">
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
                                className="block w-full rounded-lg bg-[#191733] border border-[#5551b5] px-4 py-2 text-base text-white placeholder:text-purple-300 focus:border-[#836FFF] focus:ring-[#836FFF] focus:outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-lg bg-gradient-to-r from-[#836FFF] via-[#37306B] to-[#2C2C54] px-4 py-2 font-semibold text-white shadow-lg hover:from-[#b49eff] hover:to-[#836FFF] hover:shadow-indigo-500/30 transition-all"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                    <p className="mt-10 text-center text-xs text-purple-300">
                        Do you want Join Us?{' '}
                        <a href="/signup" className="font-semibold text-[#836FFF] hover:text-indigo-300 transition">
                            SignUp
                        </a>
                    </p>
                </div>
            </div>
            {/* image coding */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-tr from-[#1A1A2E] via-[#37306B] to-[#836FFF]">
                <img
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                    alt="Cool night cityscape"
                    className="max-h-[80vh] max-w-full rounded-3xl shadow-2xl object-cover transition duration-700"
                />
            </div>
        </div>
    )
}

export default Login;