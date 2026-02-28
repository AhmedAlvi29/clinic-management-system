import { useState, useEffect } from "react";
import { auth, db } from "../firebase.jsx";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import Swal from "sweetalert2";

import AdminDashboard        from "./AdminDashboard.jsx";
import DoctorDashboard       from "./DoctorDashboard.jsx";
import ReceptionistDashboard from "./ReceptionistDashboard.jsx";
import PatientDashboard      from "./PatientDashboard.jsx";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
  .dash-root * { font-family: 'Nunito', sans-serif; }

  @keyframes fadeIn {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .fade-in { animation: fadeIn 0.5s cubic-bezier(.22,1,.36,1) both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { animation: spin 0.9s linear infinite; }
`;

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100">
      <div className="text-center">
        <svg className="spinner mx-auto mb-4 h-12 w-12 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-teal-700 font-semibold text-lg">Loading your dashboard...</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const [userDetail, setUserDetail] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      // User logged in nahi → login page pe bhejo
      if (!user) {
        window.location.href = "/";
        return;
      }

      try {
        // user_role collection me uid aur email dono se match karo
        const roleQuery = query(
          collection(db, "user_role"),
          where("uid",   "==", user.uid),
          where("email", "==", user.email)
        );

        const roleSnap = await getDocs(roleQuery);

        // Koi document nahi mila
        if (roleSnap.empty) {
          await Swal.fire({
            title: "Access Denied",
            text: "Aapka account kisi role se assign nahi hai. Administrator se rabta karein.",
            icon: "warning",
            confirmButtonText: "OK",
            confirmButtonColor: "#14b8a6",
          });
          await signOut(auth);
          window.location.href = "/";
          return;
        }

        // user_role document ki data lo: { uid, email, role }
        const data = roleSnap.docs[0].data();

        setUserDetail({
          uid:   data.uid,
          email: data.email,
          role:  data.role?.toLowerCase(),
          name:  data.name ?? data.email, // agar name field ho to use karo, warna email
        });

      } catch (err) {
        console.error("Error fetching role:", err);
        Swal.fire({
          title: "Error",
          text: "Profile load nahi ho saka. Dobara try karein.",
          icon: "error",
          confirmButtonColor: "#14b8a6",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Kya aap sign out karna chahte hain?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      confirmButtonColor: "#14b8a6",
      cancelButtonColor: "#e5e7eb",
    });
    if (result.isConfirmed) {
      await signOut(auth);
      window.location.href = "/";
    }
  };

  if (loading) return (
    <>
      <style>{styles}</style>
      <LoadingScreen />
    </>
  );

  const props = { userDetail, handleLogout };

  const roleMap = {
    admin:        <AdminDashboard        {...props} />,
    doctor:       <DoctorDashboard       {...props} />,
    receptionist: <ReceptionistDashboard {...props} />,
    patient:      <PatientDashboard      {...props} />,
  };

  const roleKey = userDetail?.role;

  return (
    <>
      <style>{styles}</style>
      <div className="dash-root fade-in">
        {roleMap[roleKey] ?? (
          <div className="flex min-h-screen items-center justify-center bg-teal-50">
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-sm">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Unknown Role</h2>
              <p className="text-gray-500 text-sm mb-2">
                Aapka role{" "}
                <span className="font-bold text-red-400">"{userDetail?.role}"</span>{" "}
                system me registered nahi hai.
              </p>
              <p className="text-gray-400 text-xs mb-6">
                Valid roles: admin, doctor, receptionist, patient
              </p>
              <button
                onClick={handleLogout}
                className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;