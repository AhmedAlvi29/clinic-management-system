import { useState, useEffect, useRef } from "react";
import { db } from "../firebase.jsx";
import {
  collection, getDocs, updateDoc, doc,
  query, where, orderBy
} from "firebase/firestore";
import Swal from "sweetalert2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const AC = { color:"#3b82f6", light:"#eff6ff", dark:"#2563eb" };

/* ══════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.pat-root * { font-family:'Plus Jakarta Sans',sans-serif; }

@keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideIn { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
@keyframes scaleIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
@keyframes spinA   { to{transform:rotate(360deg)} }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }

.fu {animation:fadeUp  .5s cubic-bezier(.22,1,.36,1) both}
.si {animation:slideIn .5s cubic-bezier(.22,1,.36,1) both}
.sci{animation:scaleIn .35s cubic-bezier(.22,1,.36,1) both}
.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
.d4{animation-delay:.2s}.d5{animation-delay:.25s}.d6{animation-delay:.3s}
.spin{animation:spinA .8s linear infinite}
.pls{animation:pulse 1.5s ease infinite}

.nav-item{
  display:flex;align-items:center;gap:10px;padding:10px 14px;
  border-radius:10px;font-weight:600;font-size:.85rem;color:#64748b;
  cursor:pointer;transition:all .2s;border:none;background:none;width:100%;text-align:left;
}
.nav-item:hover{background:#eff6ff;color:#3b82f6;transform:translateX(3px)}
.nav-item.active{background:#eff6ff;color:#3b82f6}

.card{background:#fff;border-radius:18px;border:1px solid #f1f5f9;
  box-shadow:0 2px 12px rgba(0,0,0,.05);padding:24px;transition:box-shadow .2s}
.card:hover{box-shadow:0 6px 24px rgba(59,130,246,.09)}

.btn-blue{
  background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;
  border:none;border-radius:10px;padding:9px 18px;font-weight:700;
  font-size:.85rem;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;
}
.btn-blue:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(59,130,246,.38)}
.btn-blue:disabled{opacity:.6;cursor:not-allowed;transform:none}

.btn-outline{background:#fff;color:#3b82f6;border:1.5px solid #bfdbfe;
  border-radius:10px;padding:8px 16px;font-weight:600;font-size:.83rem;cursor:pointer;transition:all .2s}
.btn-outline:hover{background:#eff6ff}

.btn-ghost{background:none;border:none;cursor:pointer;color:#94a3b8;
  font-size:.83rem;font-weight:600;padding:6px 10px;border-radius:8px;transition:all .2s}
.btn-ghost:hover{background:#f8fafc;color:#374151}

.btn-pdf{
  background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;
  border:none;border-radius:10px;padding:7px 14px;font-weight:700;
  font-size:.8rem;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:5px;
}
.btn-pdf:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(239,68,68,.35)}
.btn-pdf:disabled{opacity:.6;cursor:not-allowed;transform:none}

.btn-ai{
  background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;
  border:none;border-radius:10px;padding:7px 14px;font-weight:700;
  font-size:.8rem;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:5px;
}
.btn-ai:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(124,58,237,.35)}
.btn-ai:disabled{opacity:.6;cursor:not-allowed;transform:none}

.input-f{
  width:100%;border:1.5px solid #e2e8f0;border-radius:10px;
  padding:10px 14px;font-size:.9rem;outline:none;transition:all .2s;
  font-family:'Plus Jakarta Sans',sans-serif;box-sizing:border-box;
}
.input-f:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.12)}
.input-f:disabled{background:#f8fafc;color:#94a3b8;cursor:not-allowed}

.badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:700}
.b-pending  {background:#fef3c7;color:#d97706}
.b-confirmed{background:#dcfce7;color:#16a34a}
.b-completed{background:#e0f2fe;color:#0369a1}
.b-cancelled{background:#fee2e2;color:#dc2626}

.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.5);
  display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px);
}
.modal-box{
  background:#fff;border-radius:20px;padding:32px;width:100%;max-width:540px;
  max-height:90vh;overflow-y:auto;
  box-shadow:0 24px 64px rgba(0,0,0,.18);animation:scaleIn .3s cubic-bezier(.22,1,.36,1) both;
}

.stat-card{border-radius:18px;padding:20px;display:flex;align-items:center;gap:14px;
  border:1px solid transparent;transition:all .25s;background:#fff}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.08)}

.profile-field{display:flex;flex-direction:column;gap:4px}
.profile-field label{font-size:.75rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em}

.ai-box{
  background:linear-gradient(135deg,#f5f3ff,#ede9fe);
  border:1.5px solid #c4b5fd;border-radius:14px;padding:16px;margin-top:12px;
}

.rx-card{
  background:#fff;border:1px solid #e0f2fe;border-radius:14px;padding:20px;
  transition:all .2s;
}
.rx-card:hover{box-shadow:0 4px 18px rgba(59,130,246,.1);border-color:#bfdbfe}

table{width:100%;border-collapse:collapse}
th{background:#f8fafc;color:#64748b;font-size:.77rem;font-weight:700;
   text-transform:uppercase;letter-spacing:.05em;padding:11px 14px;text-align:left}
td{padding:12px 14px;border-top:1px solid #f1f5f9;font-size:.87rem;color:#374151}
tr:hover td{background:#f8fafc}

::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
`;

/* ── Spinner ── */
const Spinner = ({size=18,color="#3b82f6"}) => (
  <svg className="spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" opacity=".25"/>
    <path d="M4 12a8 8 0 018-8" stroke={color} strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

/* ── PDF Download helper (pure browser, no extra lib) ── */
const downloadPrescriptionPDF = (rx, patientName) => {
  const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',sans-serif}
  body{padding:40px;color:#1e293b;background:#fff}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #3b82f6;padding-bottom:20px;margin-bottom:24px}
  .clinic-name{font-size:22px;font-weight:800;color:#3b82f6}
  .clinic-sub{font-size:12px;color:#94a3b8;margin-top:4px}
  .rx-symbol{font-size:48px;color:#3b82f6;font-weight:900;line-height:1}
  h2{font-size:16px;font-weight:700;color:#374151;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #f1f5f9}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px}
  .info-item{background:#f8fafc;padding:10px 14px;border-radius:8px}
  .info-label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em}
  .info-value{font-size:13px;font-weight:600;color:#1e293b;margin-top:2px}
  .medicines-box{background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:10px;padding:16px;margin-bottom:20px}
  .medicines-text{font-size:14px;color:#1e293b;line-height:1.7;font-weight:500}
  .section{margin-bottom:16px}
  .section-label{font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:4px}
  .section-value{font-size:13px;color:#374151;line-height:1.6}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center}
  .footer-note{font-size:11px;color:#94a3b8}
  .signature-line{width:160px;border-top:1.5px solid #374151;text-align:center;padding-top:6px;font-size:11px;color:#374151;font-weight:600}
  @media print{body{padding:20px}}
</style></head>
<body>
  <div class="header">
    <div>
      <div class="clinic-name">🏥 MediCare Clinic</div>
      <div class="clinic-sub">Quality Healthcare Management System</div>
    </div>
    <div class="rx-symbol">℞</div>
  </div>

  <h2>Prescription Details</h2>
  <div class="info-grid">
    <div class="info-item"><div class="info-label">Patient Name</div><div class="info-value">${patientName}</div></div>
    <div class="info-item"><div class="info-label">Doctor</div><div class="info-value">Dr. ${rx.doctorName ?? "—"}</div></div>
    <div class="info-item"><div class="info-label">Date</div><div class="info-value">${rx.date ?? "—"}</div></div>
    <div class="info-item"><div class="info-label">Duration</div><div class="info-value">${rx.duration ?? "—"}</div></div>
  </div>

  <h2>Prescribed Medicines</h2>
  <div class="medicines-box">
    <div class="medicines-text">${(rx.medicines ?? "—").replace(/\n/g,"<br/>")}</div>
  </div>

  ${rx.dosage ? `<div class="section"><div class="section-label">Dosage</div><div class="section-value">${rx.dosage}</div></div>` : ""}
  ${rx.instructions ? `<div class="section"><div class="section-label">Instructions</div><div class="section-value">${rx.instructions}</div></div>` : ""}

  <div class="footer">
    <div class="footer-note">Generated by MediCare Clinic System · ${new Date().toLocaleDateString()}</div>
    <div class="signature-line">Dr. ${rx.doctorName ?? "Physician"}<br/>Authorized Signature</div>
  </div>
</body></html>`;

  const blob = new Blob([html], { type:"text/html" });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, "_blank");
  if (win) {
    win.onload = () => { win.print(); URL.revokeObjectURL(url); };
  }
};

/* ══════════════════════════════════════════════
   SECTION: OVERVIEW
══════════════════════════════════════════════ */
function OverviewSection({ userDetail, counts }) {
  const donutRef = useRef(null);
  const charts   = useRef({});

  useEffect(() => {
    const destroy = () => Object.values(charts.current).forEach(c=>c?.destroy());
    destroy();
    if (donutRef.current) {
      charts.current.donut = new Chart(donutRef.current, {
        type:"doughnut",
        data:{
          labels:["Appointments","Prescriptions","Lab Results","Records"],
          datasets:[{
            data:[counts.appointments, counts.prescriptions, counts.labs, counts.records],
            backgroundColor:["#3b82f6","#0d9488","#f59e0b","#7c3aed"],
            borderWidth:0, hoverOffset:6,
          }]
        },
        options:{responsive:true,cutout:"68%",
          plugins:{legend:{position:"bottom",labels:{font:{size:12},padding:14,color:"#64748b"}}}}
      });
    }
    return destroy;
  }, [counts]);

  const stats = [
    {icon:"🗓️",label:"Appointments",   value:counts.appointments,  color:"#3b82f6",bg:"#eff6ff"},
    {icon:"💊",label:"Prescriptions",  value:counts.prescriptions, color:"#0d9488",bg:"#f0fdfa"},
    {icon:"🔬",label:"Lab Results",    value:counts.labs,          color:"#f59e0b",bg:"#fffbeb"},
    {icon:"📄",label:"Medical Records",value:counts.records,       color:"#7c3aed",bg:"#f5f3ff"},
  ];

  return (
    <div>
      <div className="fu mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">My Health Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome, <span className="font-bold text-blue-500">{userDetail?.name ?? userDetail?.email}</span>! Here's your health summary.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s,i) => (
          <div key={s.label} className={`stat-card fu d${i+1}`} style={{border:`1px solid ${s.color}18`,background:s.bg}}>
            <div className="text-3xl p-3 rounded-xl bg-white shadow-sm">{s.icon}</div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-3xl font-extrabold" style={{color:s.color}}>{s.value ?? "—"}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card fu d2">
          <h3 className="font-bold text-gray-700 mb-4">🍩 Health Activity Breakdown</h3>
          <canvas ref={donutRef}/>
        </div>
        <div className="card fu d3 flex flex-col gap-4">
          <h3 className="font-bold text-gray-700">👤 Quick Profile</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:"Name",   value:userDetail?.name    ?? "—"},
              {label:"Email",  value:userDetail?.email   ?? "—"},
              {label:"Phone",  value:userDetail?.phone   ?? "—"},
              {label:"Blood",  value:userDetail?.bloodGroup ?? "—"},
              {label:"Age",    value:userDetail?.age     ?? "—"},
              {label:"Gender", value:userDetail?.gender  ?? "—"},
            ].map(f => (
              <div key={f.label} className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs font-bold text-blue-300 uppercase tracking-wide">{f.label}</p>
                <p className="font-semibold text-gray-800 text-sm mt-0.5 truncate">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: MY APPOINTMENTS
══════════════════════════════════════════════ */
function AppointmentsSection({ userDetail }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db,"appointments"),
          where("patientId","==",userDetail.uid),
          orderBy("date","desc")
        );
        const snap = await getDocs(q);
        setList(snap.docs.map(d=>({id:d.id,...d.data()})));
      } catch {
        // Fallback: match by name
        try {
          const snap = await getDocs(query(collection(db,"appointments"), orderBy("date","desc")));
          setList(snap.docs
            .map(d=>({id:d.id,...d.data()}))
            .filter(a => a.patientId===userDetail.uid || a.patientName===userDetail.name)
          );
        } catch(e2){ console.error(e2) }
      }
      setLoading(false);
    };
    fetch();
  }, [userDetail]);

  const filtered = filter==="all" ? list : list.filter(a=>a.status===filter);
  const statusColor = s=>({pending:"b-pending",confirmed:"b-confirmed",completed:"b-completed",cancelled:"b-cancelled"}[s]??"b-pending");

  return (
    <div>
      <div className="fu mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">My Appointments</h2>
        <p className="text-gray-400 text-sm mt-0.5">View your full appointment history.</p>
      </div>

      <div className="flex gap-2 mb-5 fu d1 flex-wrap">
        {["all","pending","confirmed","completed","cancelled"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${filter===s?"bg-blue-500 text-white border-blue-500":"bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"}`}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">({s==="all"?list.length:list.filter(a=>a.status===s).length})</span>
          </button>
        ))}
      </div>

      <div className="card fu d2 overflow-x-auto">
        {loading ? <div className="flex justify-center py-12"><Spinner size={28}/></div> :
         filtered.length===0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">🗓️</div>
            <p className="text-gray-400 font-semibold">No {filter!=="all"?filter:""} appointments found.</p>
          </div>
         ) : (
          <table>
            <thead><tr><th>#</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((a,i)=>(
                <tr key={a.id}>
                  <td className="text-gray-400 text-xs font-mono">{i+1}</td>
                  <td className="font-semibold text-gray-800">{a.doctorName ? `Dr. ${a.doctorName}` : "—"}</td>
                  <td>{a.date||"—"}</td>
                  <td>{a.time||"—"}</td>
                  <td className="text-gray-500 max-w-[160px] truncate">{a.reason||"—"}</td>
                  <td><span className={`badge ${statusColor(a.status)}`}>{a.status||"pending"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: MY PRESCRIPTIONS (with PDF + AI)
══════════════════════════════════════════════ */
function PrescriptionsSection({ userDetail }) {
  const [list,      setList]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [aiModal,   setAiModal]   = useState(null);  // rx object
  const [aiText,    setAiText]    = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db,"prescriptions"),
          where("patientId","==",userDetail.uid),
          orderBy("createdAt","desc")
        );
        const snap = await getDocs(q);
        setList(snap.docs.map(d=>({id:d.id,...d.data()})));
      } catch {
        try {
          const snap = await getDocs(collection(db,"prescriptions"));
          setList(snap.docs
            .map(d=>({id:d.id,...d.data()}))
            .filter(rx => rx.patientId===userDetail.uid || rx.patientName===userDetail.name)
          );
        } catch(e2){ console.error(e2) }
      }
      setLoading(false);
    };
    fetch();
  }, [userDetail]);

  const askAI = async (rx) => {
    setAiModal(rx);
    setAiText("");
    setAiLoading(true);
    try {
      const prompt = `You are a helpful medical assistant. A patient has received this prescription:
Medicines: ${rx.medicines}
Dosage: ${rx.dosage || "not specified"}
Duration: ${rx.duration || "not specified"}
Instructions: ${rx.instructions || "none"}

Please explain this prescription in simple, easy-to-understand language for the patient. Cover:
1. What each medicine is for
2. How to take them correctly
3. Important warnings or side effects to watch for
4. What to avoid while taking these medicines

Keep the tone friendly and reassuring. Do not scare the patient.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`,
        {
          method:"POST",
          headers:{"Content-Type":"application/json","x-goog-api-key":import.meta.env.VITE_GEMINI_KEY??""},
          body:JSON.stringify({ contents:[{ parts:[{ text:prompt }] }] })
        }
      );
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Could not generate explanation. Please consult your doctor.";
      setAiText(text);
    } catch {
      setAiText("⚠️ AI explanation unavailable. Please ask your doctor or pharmacist to explain your prescription.");
    }
    setAiLoading(false);
  };

  return (
    <div>
      <div className="fu mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">My Prescriptions</h2>
        <p className="text-gray-400 text-sm mt-0.5">View, download PDF, and get AI explanations of your prescriptions.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32}/></div>
      ) : list.length===0 ? (
        <div className="card text-center py-16 fu">
          <div className="text-6xl mb-4">💊</div>
          <p className="text-gray-400 font-semibold">No prescriptions found yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {list.map((rx,i) => (
            <div key={rx.id} className={`rx-card fu d${(i%4)+1}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-500 font-black text-lg">℞</span>
                    <span className="font-extrabold text-gray-800">Prescription</span>
                  </div>
                  <p className="text-xs text-gray-400">Dr. {rx.doctorName ?? "—"} · {rx.date ?? "—"}</p>
                </div>
                <span className="text-2xl">💊</span>
              </div>

              {/* Medicines */}
              <div className="bg-blue-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">Medicines</p>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">{rx.medicines ?? "—"}</p>
              </div>

              {/* Details row */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                {rx.dosage && (
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 font-bold uppercase">Dosage</p>
                    <p className="text-gray-700 font-semibold mt-0.5">{rx.dosage}</p>
                  </div>
                )}
                {rx.duration && (
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 font-bold uppercase">Duration</p>
                    <p className="text-gray-700 font-semibold mt-0.5">{rx.duration}</p>
                  </div>
                )}
                {rx.instructions && (
                  <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                    <p className="text-gray-400 font-bold uppercase">Instructions</p>
                    <p className="text-gray-700 font-semibold mt-0.5">{rx.instructions}</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button className="btn-pdf flex-1 justify-center"
                  onClick={()=>downloadPrescriptionPDF(rx, userDetail?.name)}>
                  📄 Download PDF
                </button>
                <button className="btn-ai flex-1 justify-center"
                  onClick={()=>askAI(rx)}>
                  🤖 AI Explain
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Explanation Modal */}
      {aiModal && (
        <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget){ setAiModal(null); setAiText("") }}}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <h3 className="text-xl font-extrabold text-gray-800">AI Prescription Explanation</h3>
              </div>
              <button className="btn-ghost" onClick={()=>{ setAiModal(null); setAiText("") }}>✕</button>
            </div>

            {/* Rx summary */}
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">Prescription by Dr. {aiModal.doctorName ?? "—"}</p>
              <p className="text-sm text-gray-800 font-medium">{aiModal.medicines}</p>
            </div>

            {/* AI response */}
            <div className="ai-box">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-purple-500 font-bold text-sm">🤖 AI Medical Assistant</span>
                {aiLoading && <span className="pls text-xs text-purple-400 ml-auto">Generating explanation...</span>}
              </div>
              {aiLoading ? (
                <div className="space-y-2">
                  {[1,2,3,4].map(i => <div key={i} className="pls h-4 bg-purple-100 rounded w-full"/>)}
                </div>
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{aiText}</p>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              ⚠️ This AI explanation is for informational purposes only. Always follow your doctor's instructions.
            </p>

            <button className="btn-blue w-full justify-center mt-4" onClick={()=>{ setAiModal(null); setAiText("") }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: MEDICAL RECORDS (diagnoses)
══════════════════════════════════════════════ */
function MedicalRecordsSection({ userDetail }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db,"diagnoses"),
          where("patientId","==",userDetail.uid),
          orderBy("date","desc")
        );
        const snap = await getDocs(q);
        setList(snap.docs.map(d=>({id:d.id,...d.data()})));
      } catch {
        try {
          const snap = await getDocs(collection(db,"diagnoses"));
          setList(snap.docs
            .map(d=>({id:d.id,...d.data()}))
            .filter(r => r.patientId===userDetail.uid || r.patientName===userDetail.name)
          );
        } catch(e2){ console.error(e2) }
      }
      setLoading(false);
    };
    fetch();
  }, [userDetail]);

  return (
    <div>
      <div className="fu mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">Medical Records</h2>
        <p className="text-gray-400 text-sm mt-0.5">Your full diagnosis and medical history.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32}/></div>
      ) : list.length===0 ? (
        <div className="card text-center py-16 fu">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-400 font-semibold">No medical records found yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((r,i) => (
            <div key={r.id} className={`card fu d${(i%4)+1}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-extrabold text-gray-800 text-lg">{r.diagnosis}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Dr. {r.doctorName ?? "—"} · {r.date ?? "—"}</p>
                </div>
                <span className="text-3xl">🩺</span>
              </div>
              {r.symptoms && (
                <div className="bg-red-50 rounded-xl p-3 mb-2">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">Symptoms</p>
                  <p className="text-sm text-gray-700">{r.symptoms}</p>
                </div>
              )}
              {r.notes && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Doctor's Notes</p>
                  <p className="text-sm text-gray-700">{r.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: MY PROFILE (view + edit)
══════════════════════════════════════════════ */
function ProfileSection({ userDetail }) {
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({
    name:             userDetail?.name ?? "",
    phone:            userDetail?.phone ?? "",
    age:              userDetail?.age ?? "",
    gender:           userDetail?.gender ?? "",
    bloodGroup:       userDetail?.bloodGroup ?? "",
    address:          userDetail?.address ?? "",
    emergencyContact: userDetail?.emergencyContact ?? "",
  });
  const [saving, setSaving] = useState(false);

  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const save = async () => {
    setSaving(true);
    try {
      // Update in patients collection (find by uid or email)
      const snap = await getDocs(query(collection(db,"patients"), where("email","==",userDetail.email)));
      if (!snap.empty) {
        await updateDoc(doc(db,"patients",snap.docs[0].id), { ...form });
      }
      // Update in user_role
      const roleSnap = await getDocs(query(collection(db,"user_role"), where("uid","==",userDetail.uid)));
      if (!roleSnap.empty) {
        await updateDoc(doc(db,"user_role",roleSnap.docs[0].id), { name:form.name });
      }
      Swal.fire({title:"✅ Profile Updated!",icon:"success",confirmButtonColor:"#3b82f6",timer:2000,showConfirmButton:false});
      setEditing(false);
    } catch(e) {
      Swal.fire({title:"Error",text:e.message,icon:"error",confirmButtonColor:"#3b82f6"});
    }
    setSaving(false);
  };

  const fields = [
    {key:"name",    label:"Full Name",         type:"text",  placeholder:"Your full name"},
    {key:"phone",   label:"Phone Number",      type:"text",  placeholder:"+92 300 0000000"},
    {key:"age",     label:"Age",               type:"number",placeholder:"e.g. 30"},
    {key:"address", label:"Address",           type:"text",  placeholder:"City, Street..."},
    {key:"emergencyContact",label:"Emergency Contact",type:"text",placeholder:"+92 300 0000000"},
  ];

  return (
    <div>
      <div className="fu mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">My Profile</h2>
          <p className="text-gray-400 text-sm mt-0.5">View and update your personal information.</p>
        </div>
        {!editing
          ? <button className="btn-blue" onClick={()=>setEditing(true)}>✏️ Edit Profile</button>
          : <div className="flex gap-2">
              <button className="btn-blue" onClick={save} disabled={saving}>
                {saving?<><Spinner color="#fff"/> Saving...</>:"💾 Save"}
              </button>
              <button className="btn-outline" onClick={()=>setEditing(false)}>Cancel</button>
            </div>
        }
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="card fu d1 flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-extrabold text-4xl shadow-lg mb-4">
            {userDetail?.name?.[0]?.toUpperCase() ?? "P"}
          </div>
          <h3 className="text-xl font-extrabold text-gray-800">{userDetail?.name ?? "Patient"}</h3>
          <p className="text-sm text-gray-400 mb-4">{userDetail?.email}</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {userDetail?.bloodGroup && (
              <span className="badge" style={{background:"#fee2e2",color:"#dc2626"}}>🩸 {userDetail.bloodGroup}</span>
            )}
            <span className="badge" style={{background:"#eff6ff",color:"#3b82f6"}}>🏥 Patient</span>
          </div>
        </div>

        {/* Info fields */}
        <div className="card fu d2 md:col-span-2">
          <h3 className="font-bold text-gray-700 mb-5">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(field => (
              <div key={field.key} className="profile-field">
                <label>{field.label}</label>
                <input
                  className="input-f"
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={f(field.key)}
                  disabled={!editing}
                />
              </div>
            ))}
            {/* Gender */}
            <div className="profile-field">
              <label>Gender</label>
              <select className="input-f" value={form.gender} onChange={f("gender")} disabled={!editing}>
                <option value="">— Select —</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            {/* Blood Group */}
            <div className="profile-field">
              <label>Blood Group</label>
              <select className="input-f" value={form.bloodGroup} onChange={f("bloodGroup")} disabled={!editing}>
                <option value="">— Select —</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {/* Email (read only) */}
            <div className="profile-field sm:col-span-2">
              <label>Email (cannot be changed)</label>
              <input className="input-f" type="email" value={userDetail?.email ?? ""} disabled/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PATIENT DASHBOARD
══════════════════════════════════════════════ */
const TABS = [
  { key:"overview",      icon:"🏠", label:"Overview"        },
  { key:"appointments",  icon:"🗓️", label:"Appointments"    },
  { key:"prescriptions", icon:"💊", label:"Prescriptions"   },
  { key:"records",       icon:"📄", label:"Medical Records" },
  { key:"profile",       icon:"👤", label:"My Profile"      },
];

function PatientDashboard({ userDetail, handleLogout }) {
  const [tab,    setTab]    = useState("overview");
  const [counts, setCounts] = useState({ appointments:0, prescriptions:0, labs:0, records:0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [aSnap,rxSnap,lSnap,dSnap] = await Promise.all([
          getDocs(collection(db,"appointments")),
          getDocs(collection(db,"prescriptions")),
          getDocs(collection(db,"lab_orders")),
          getDocs(collection(db,"diagnoses")),
        ]);
        const uid  = userDetail?.uid;
        const name = userDetail?.name;
        const match = d => d.patientId===uid || d.patientName===name;
        setCounts({
          appointments:  aSnap.docs.map(d=>d.data()).filter(match).length,
          prescriptions: rxSnap.docs.map(d=>d.data()).filter(match).length,
          labs:          lSnap.docs.map(d=>d.data()).filter(match).length,
          records:       dSnap.docs.map(d=>d.data()).filter(match).length,
        });
      } catch(e){ console.error(e) }
    };
    load();
  }, [tab, userDetail]);

  return (
    <>
      <style>{CSS}</style>
      <div className="pat-root flex min-h-screen bg-gray-50">

        {/* ── Sidebar ── */}
        <aside className="si w-64 flex-shrink-0 bg-white border-r border-gray-100 shadow-sm flex flex-col py-6 px-4">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-full p-3 mb-2 shadow" style={{background:AC.color}}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 2h2v7h7v2h-7v7h-2v-7H4v-2h7z"/>
              </svg>
            </div>
            <span className="text-lg font-extrabold text-gray-800">MediCare</span>
            <span className="text-xs font-bold px-3 py-0.5 rounded-full mt-1 text-white" style={{background:AC.color}}>🏥 Patient</span>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3 mb-6">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow" style={{background:AC.color}}>
              {(userDetail?.name??userDetail?.email)?.[0]?.toUpperCase()??"P"}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-gray-800 text-sm truncate">{userDetail?.name??"Patient"}</p>
              <p className="text-xs text-gray-400 truncate">{userDetail?.email}</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 flex-1">
            {TABS.map(t=>(
              <button key={t.key} className={`nav-item ${tab===t.key?"active":""}`} onClick={()=>setTab(t.key)}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </nav>

          <button onClick={handleLogout}
            className="mt-4 flex items-center gap-2 w-full px-4 py-2.5 rounded-xl font-semibold text-sm text-white hover:opacity-90 transition"
            style={{background:AC.color}}>
            🚪 Logout
          </button>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 px-8 py-10 overflow-y-auto">
          {tab==="overview"      && <OverviewSection      userDetail={userDetail} counts={counts}/>}
          {tab==="appointments"  && <AppointmentsSection  userDetail={userDetail}/>}
          {tab==="prescriptions" && <PrescriptionsSection userDetail={userDetail}/>}
          {tab==="records"       && <MedicalRecordsSection userDetail={userDetail}/>}
          {tab==="profile"       && <ProfileSection       userDetail={userDetail}/>}
        </main>
      </div>
    </>
  );
}

export default PatientDashboard;