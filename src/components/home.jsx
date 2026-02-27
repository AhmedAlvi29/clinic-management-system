import { useState, useEffect } from "react";
import { auth, db } from "../firebase.jsx";
import Swal from "sweetalert2";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { setDoc, getDoc, doc } from "firebase/firestore";
import { generatePitch } from "../gemeni.jsx";

function Home() {
  const [pitchInput, setPitchInput] = useState("");
  const [advice, setAdvice] = useState("");
  const [previewHTML, setPreviewHTML] = useState("");
  const [loading, setLoading] = useState(false);
  const [userdetail, setUserdetail] = useState(null);

 
  const handleGeneratePitch = async () => {
    if (!pitchInput.trim()) {
      Swal.fire({
        title: "Oops!",
        text: "Please enter your startup idea first!",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    setLoading(true);
    try {
      const prompt = `
Generate a creative startup pitch for: ${pitchInput}.
Include:
1. Startup Name & Tagline
2. Elevator Pitch, Problem & Solution
3. Target Audience, Unique Value Proposition
4. Optional marketing advice
After a separator line "---HTML---", write responsive uniqe cool big design with cool and good css landing page HTML + CSS (inside <style> tags).
`;

      const response = await generatePitch(prompt);
      const [textPart, htmlPart] = response.split(/---HTML---/i);

     
      const cleanedHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body { font-family: Arial, sans-serif; margin:0; padding:0; background:#fafafa; }
  * { box-sizing:border-box; }
  ${htmlPart?.match(/<style>([\s\S]*?)<\/style>/)?.[1] || ""}
</style>
</head>
<body>
  ${htmlPart?.replace(/<style>[\s\S]*?<\/style>/, "").trim() || "<p>No HTML content generated.</p>"}
</body>
</html>
`;

      setAdvice(textPart?.trim() || "");
      setPreviewHTML(cleanedHTML);

    
      if (auth.currentUser) {
        const userPitchRef = doc(
          db,
          "savepitchs",
          `${auth.currentUser.uid}_${Date.now()}`
        );

        await setDoc(userPitchRef, {
          userId: auth.currentUser.uid,
          idea: pitchInput,
          pitch: response, // full Gemini output
          createdAt: new Date().toISOString(), // ISO format
        });

        Swal.fire({
          title: " Saved!",
          text: "Your generated pitch has been saved to Firestore.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Please log in first!",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to generate pitch!",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserdetail(docSnap.data());
        else setUserdetail(null);
      } else {
        window.location.href = "/";
      }
    });
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch {
      Swal.fire({
        title: "Error",
        text: "Logout failed!",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };


  return userdetail ? (
    <div className="flex min-h-screen bg-gradient-to-br from-[#22223B] via-[#37306B] to-[#1A1A2E]">

      <aside className="w-64 bg-[#191733] text-white flex flex-col py-8 px-6 shadow-2xl">
        <div className="flex flex-col items-center mb-12">
          <img
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg"
            alt="Logo"
            className="h-14 w-14 mb-3"
          />
          <span className="text-xl font-bold tracking-wider text-[#836FFF]">
            PitchCraft
          </span>
        </div>

        <nav className="flex flex-col gap-3 mt-4 flex-1">
          <p className="flex items-center space-x-3 py-3 px-4 text-gray-300">
            👤 <span>Welcome, {userdetail.name}</span>
          </p>

          <a
            href="/savepitchs"
            className="flex items-center space-x-3 py-3 px-4 text-gray-300 hover:text-[#836FFF]"
          >
            💾 <span>Saved Pitches</span>
          </a>

          <div className="flex-1" />

          <button
            onClick={handleLogout}
            className="mt-4 bg-gradient-to-r from-[#836FFF] via-[#37306B] to-[#2C2C54] px-4 py-2 rounded-lg shadow hover:shadow-indigo-500/30 transition-all"
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col justify-center items-center px-8 py-12">
        <div className="w-full max-w-5xl bg-white/10 rounded-3xl shadow-xl p-10 backdrop-blur-xl border border-[#836FFF]/10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Create Your Pitch
          </h1>

       
          <div className="flex flex-col gap-6 mb-8">
            <textarea
              placeholder="Type your pitch idea here..."
              rows="3"
              value={pitchInput}
              onChange={(e) => setPitchInput(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border-2 border-[#836FFF]/30 rounded-xl text-white placeholder-purple-300/50 focus:border-[#836FFF] focus:outline-none resize-none"
            />
            <button
              onClick={handleGeneratePitch}
              disabled={loading}
              className={`w-full bg-gradient-to-r from-[#836FFF] via-[#37306B] to-[#2C2C54] text-white py-4 rounded-xl font-semibold shadow-lg transition-all ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Generating..." : "Generate Pitch"}
            </button>
          </div>

        
          {advice && (
            <div className="mb-8 p-5 bg-[#1B1A3A] text-white rounded-xl border border-[#836FFF]/30">
              <h2 className="text-lg font-semibold text-[#b49eff] mb-2">
                Gemini’s Business Advice
              </h2>
              <p className="text-purple-100 whitespace-pre-line leading-relaxed">
                {advice}
              </p>
            </div>
          )}

     
          {previewHTML && (
            <div className="p-5 bg-[#1B1A3A] text-white rounded-xl border border-[#836FFF]/30">
              <h2 className="text-lg font-semibold text-[#b49eff] mb-3">
                 Live Website Preview
              </h2>

              <iframe
                title="Gemini Generated Preview"
                srcDoc={previewHTML}
                sandbox="allow-same-origin allow-scripts"
                className="w-full h-[700px] rounded-xl border border-[#836FFF]/20 bg-white shadow-inner"
              />

              <details className="mt-4 bg-[#141432] rounded-lg p-3">
                <summary className="cursor-pointer text-[#b49eff] font-medium">
                  View Raw HTML Code
                </summary>
                <pre className="text-xs text-purple-200 mt-2 overflow-auto whitespace-pre-wrap max-h-60">
                  {previewHTML}
                </pre>
              </details>
            </div>
          )}
        </div>
      </main>
    </div>
  ) : (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#22223B] via-[#37306B] to-[#1A1A2E]">
      <div className="bg-white/10 rounded-2xl px-10 py-8 shadow-xl backdrop-blur-lg">
        <h1 className="text-2xl font-bold text-white text-center">Loading...</h1>
      </div>
    </div>
  );
}

export default Home;
