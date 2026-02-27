import { useState, useEffect } from "react";
import { auth, db } from "../firebase.jsx";
import Swal from "sweetalert2";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import jsPDF from "jspdf";

function Savepitchs() {
  const [userdetail, setUserdetail] = useState(null);
  const [userpitch, setUserpitch] = useState([]);
  const [selectedPitch, setSelectedPitch] = useState(null);


  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toISOString();
    if (timestamp.toDate) return timestamp.toDate().toISOString();
    return timestamp;
  };


  const getUserdetail = async () => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserdetail(null);
        setUserpitch([]);
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setUserdetail(docSnap.data());
      else {
        setUserdetail(null);
        window.location.href = "/";
      }

      const q = collection(db, "savepitchs");
      onSnapshot(q, (snapshot) => {
        const pitches = [];
        snapshot.forEach((pitchDoc) => {
          const data = pitchDoc.data();
          if (data.userId === user.uid) pitches.push({ id: pitchDoc.id, ...data });
        });
        setUserpitch(pitches.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      });
    });
  };

  useEffect(() => {
    getUserdetail();
  }, []);

 
  const handlelogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };


  const handleDeletePitch = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete your pitch.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      await deleteDoc(doc(db, "savepitchs", id));
      Swal.fire("Deleted!", "Your pitch has been deleted.", "success");
    }
  };

 
  const handleDownloadPDF = (pitch) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(pitch.idea || "Untitled Pitch", 10, 20);
    doc.setFontSize(12);
    doc.text(pitch.pitch || "No pitch content available", 10, 30, { maxWidth: 190 });
    doc.save(`${pitch.idea || "pitch"}.pdf`);
  };

  return userdetail ? (
    <div className="flex min-h-screen bg-gradient-to-br from-[#22223B] via-[#37306B] to-[#1A1A2E]">
 
      <aside className="w-64 bg-[#191733] text-white flex flex-col py-8 px-6 shadow-2xl min-h-screen">
        <div className="flex flex-col items-center mb-12">
          <img
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg"
            alt="PitchCraft"
            className="h-14 w-14 mb-3"
          />
          <span className="text-xl font-bold tracking-wider text-[#836FFF]">PitchCraft</span>
        </div>

        <nav className="flex flex-col gap-3 mt-4 flex-1">
          <p className="flex items-center space-x-3 py-3 px-4 text-gray-300">
            👤 <span>Welcome, {userdetail.name}</span>
          </p>

          <a
            href="/home"
            className="flex items-center space-x-3 py-3 px-4 text-gray-300 hover:text-[#836FFF]"
          >
            🏠 <span>Home</span>
          </a>

          <div className="flex-1" />

          <button
            onClick={handlelogout}
            className="flex items-center space-x-3 text-base font-medium mt-4 bg-gradient-to-r from-[#836FFF] via-[#37306B] to-[#2C2C54] px-4 py-2 rounded-lg shadow hover:shadow-indigo-500/30 transition-all"
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

  
      <main className="flex-1 flex flex-col items-center px-8 py-12">
        <h1 className="text-3xl font-bold text-[#836FFF] mb-8">Your Saved Pitches</h1>

        {userpitch.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
            {userpitch.map((pitch) => (
              <div
                key={pitch.id}
                className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-[#836FFF]/20 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">{pitch.idea}</h2>
                  <p className="text-purple-200 text-sm mb-4">{formatTimestamp(pitch.createdAt)}</p>
                </div>

                <div className="flex justify-between gap-2">
                  <button
                    className="flex-1 bg-gradient-to-r from-[#836FFF] to-[#2C2C54] text-white px-3 py-1 rounded-lg hover:from-[#b49eff] hover:to-[#836FFF] transition"
                    onClick={() => setSelectedPitch(pitch)}
                  >
                    View
                  </button>

                  <button
                    className="flex-1 bg-gradient-to-r from-[#FF8C42] to-[#FF3C38] text-white px-3 py-1 rounded-lg hover:from-[#FFA26B] hover:to-[#FF6A5B] transition"
                    onClick={() => handleDownloadPDF(pitch)}
                  >
                    PDF
                  </button>

                  <button
                    className="flex-1 bg-gradient-to-r from-[#FF3C38] to-[#FF8C42] text-white px-3 py-1 rounded-lg hover:from-[#FF6A5B] hover:to-[#FFA26B] transition"
                    onClick={() => handleDeletePitch(pitch.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-purple-300 text-center mt-10">No pitches found.</p>
        )}

     
        {selectedPitch && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#1B1A3A] p-6 rounded-3xl shadow-lg w-11/12 md:w-2/3 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl text-white font-bold">{selectedPitch.idea}</h2>
                <button
                  className="text-white text-xl font-bold"
                  onClick={() => setSelectedPitch(null)}
                >
                  ✖
                </button>
              </div>
              <p className="text-purple-200 whitespace-pre-line">{selectedPitch.pitch}</p>
            </div>
          </div>
        )}
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

export default Savepitchs;
