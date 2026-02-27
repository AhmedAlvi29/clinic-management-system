import { useState, useEffect } from "react";
import { auth } from "../firebase.jsx";
import Swal from 'sweetalert2';


import { onAuthStateChanged } from "firebase/auth";
import {setDoc, getDoc, doc } from "firebase/firestore";


import { db } from "../firebase.jsx";
import { generatePitch } from "../gemeni.jsx";

function Logo() {

    const [pitchInput, setPitchInput] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGeneratePitch = async () => {
        if (!pitchInput.trim()) {
            Swal.fire({
                title: 'Oops',
                text: 'Plz Enter Your Idea',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
            return;
        }
        setLoading(true);
        try {
            const pitch = await generatePitch(`Generate a startup pitch for: ${pitchInput} with Startup Name and Tagline and Write elevator pitches & problem/solution statements and Define target audience & unique value proposition and Generate website hero section copy instantly and Suggest color palette or logo concept ideas and also genrate and also genrate landing page html css and js in 800 lines only plz`);
            setResult(pitch);

            // Save pitch to Firestore under the current user's collection with a timestamp
            if (auth.currentUser) {
                const userPitchRef = doc(db, "savepitchs", `${auth.currentUser.uid}_${Date.now()}`);
                await setDoc(userPitchRef, {
                    pitch: pitch,
                    userId: auth.currentUser.uid,
                    idea: pitchInput,
                    createdAt: new Date().toISOString()
                });
            } else {
                console.error("User not authenticated. Pitch not saved.");
                Swal.fire({
                    title: 'Oops',
                    text: 'User not authenticated',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                })
            }

        } finally {
            setLoading(false);
        }
    };

    const [userdetail, setUserdetail] = useState(null);

    const getUserdetail = async () => {
        auth.onAuthStateChanged(async (user) => {
            console.log(user);
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserdetail(docSnap.data());
            } else {
                setUserdetail(null);
            }
        });
    };

    useEffect(() => {
        getUserdetail();
    }, []);

    const handlelogout = async () => {
        try {
            await auth.signOut();
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed:", error);
            Swal.fire({
                title: 'Oops',
                text: 'Logout failed',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        }
    }

    return (
        userdetail ? (
            <div className="flex min-h-screen bg-gradient-to-br from-[#22223B] via-[#37306B] to-[#1A1A2E]">
                 <aside className="w-64 bg-[#191733] text-white flex flex-col py-8 px-6 shadow-2xl min-h-screen">
        <div className="flex flex-col items-center mb-12">
            <img
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                alt="PitchCraft"
                className="h-14 w-14 mb-3"
            />
            <span className="text-xl font-bold tracking-wider text-[#836FFF]" style={{ textShadow: '0 2px 16px #191733' }}>
                PitchCraft
            </span>
        </div>

        <nav className="flex flex-col gap-3 mt-4 flex-1">
            <button
                className="flex items-center space-x-3 text-base font-medium py-3 px-4 rounded-lg transition text-gray-300 hover:text-[#836FFF] hover:bg-[#221F3B]"
                type="button"
            >
                <span className="text-xl">👤</span>
                <span>Welcome, {userdetail.name}</span>
            </button>
            <button
                className="flex items-center space-x-3 text-base font-medium py-2 px-4 rounded-lg transition hover:text-[#836FFF] hover:bg-[#221F3B]"
                type="button"
            >
                <span className="text-xl">🏠</span>
                <span><a href="/home">Home</a></span>

            </button>
            <button
                className="flex items-center space-x-3 text-base font-medium py-3 px-4 rounded-lg transition text-gray-300 hover:text-[#836FFF] hover:bg-[#221F3B]"
                type="button"
            >
                <span className="text-xl">💾</span>
                <span><a href="savepitchs">Save Pitchs</a></span>
            </button>

           
            <div className="flex-1" />

            <button
                className="flex items-center space-x-3 text-base font-medium mt-4 bg-gradient-to-r from-[#836FFF] via-[#37306B] to-[#2C2C54] px-4 py-2 rounded-lg shadow hover:from-[#b49eff] hover:to-[#836FFF] hover:shadow-indigo-500/30 transition-all"
                onClick={handlelogout}
                type="button"
            >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
            </button>
        </nav>
    </aside>

                {/* Dashboard Main */}
                <main className="flex-1 flex flex-col justify-center items-center px-8 py-12 relative bg-transparent">
                    <div className="w-full max-w-2xl bg-white/10 rounded-3xl shadow-xl p-10 backdrop-blur-xl border border-[#836FFF]/10">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center" style={{ textShadow: '0 5px 32px #191733' }}>
                            Create Your Pitch
                        </h1>

                        {result && (
                            <div className="mb-6 p-5 bg-[#1B1A3A] text-white rounded-xl border border-[#836FFF]/30">
                                <h2 className="text-lg font-semibold text-[#b49eff] mb-2">Your Generated Pitch:</h2>
                                <p className="text-purple-100 leading-relaxed whitespace-pre-line">{result}</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-6 transition-all">
                            <div className="relative">
                                <label className="block text-purple-200 text-sm font-medium mb-3">
                                    Enter Your Pitch Details
                                </label>
                                <textarea
                                    placeholder="Type your pitch here..."
                                    rows="3"
                                    value={pitchInput}
                                    onChange={(e) => setPitchInput(e.target.value)}
                                    className="w-full px-5 py-4 bg-white/5 border-2 border-[#836FFF]/30 rounded-xl text-white placeholder-purple-300/50 focus:border-[#836FFF] focus:outline-none transition-all resize-none backdrop-blur-sm"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleGeneratePitch}
                                disabled={loading}
                                className={`w-full bg-gradient-to-r from-[#836FFF] via-[#37306B] to-[#2C2C54] text-white py-4 rounded-xl font-semibold shadow-lg hover:from-[#b49eff] hover:to-[#836FFF] hover:shadow-indigo-500/30 transition-all ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Generating..." : "Generate Pitch"}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        ) : (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#22223B] via-[#37306B] to-[#1A1A2E]">
                <div className="bg-white/10 rounded-2xl px-10 py-8 shadow-xl backdrop-blur-lg">
                    <h1 className="text-2xl font-bold text-white mb-2 text-center">Loading...</h1>
                </div>
            </div>
        )
    )
}

export default Logo;