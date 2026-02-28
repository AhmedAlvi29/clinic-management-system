import { useState, useEffect, useRef } from "react";
import { db } from "../firebase.jsx";
import {
  collection, getDocs, addDoc, updateDoc, doc,
  query, where, orderBy, serverTimestamp
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import Swal from "sweetalert2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

/* ── Gemini AI helper (reuse your existing gemeni.jsx) ── */
// import { generatePitch as generateAI } from "../gemeni.jsx";
// For now we call it via a simple fetch — swap with your gemeni.jsx if preferred

const AC = { color:"#0d9488", light:"#f0fdfa", dark:"#0f766e" };

/* ══════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.doc-root * { font-family:'Plus Jakarta Sans',sans-serif; }

@keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideIn { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
@keyframes scaleIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
@keyframes spinA   { to{transform:rotate(360deg)} }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }

.fu{animation:fadeUp  .5s cubic-bezier(.22,1,.36,1) both}
.si{animation:slideIn .5s cubic-bezier(.22,1,.36,1) both}
.sci{animation:scaleIn .35s cubic-bezier(.22,1,.36,1) both}
.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
.d4{animation-delay:.2s}.d5{animation-delay:.25s}.d6{animation-delay:.3s}
.spin{animation:spinA .8s linear infinite}
.pulse{animation:pulse 1.5s ease infinite}

.nav-item{
  display:flex;align-items:center;gap:10px;padding:10px 14px;
  border-radius:10px;font-weight:600;font-size:.85rem;color:#64748b;
  cursor:pointer;transition:all .2s;border:none;background:none;width:100%;text-align:left;
}
.nav-item:hover{background:#f0fdfa;color:#0d9488;transform:translateX(3px)}
.nav-item.active{background:#f0fdfa;color:#0d9488}

.card{background:#fff;border-radius:18px;border:1px solid #f1f5f9;
  box-shadow:0 2px 12px rgba(0,0,0,.05);padding:24px;transition:box-shadow .2s}
.card:hover{box-shadow:0 6px 24px rgba(13,148,136,.09)}

.btn-teal{
  background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;
  border:none;border-radius:10px;padding:9px 18px;font-weight:700;
  font-size:.85rem;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;
}
.btn-teal:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(13,148,136,.35)}
.btn-teal:disabled{opacity:.6;cursor:not-allowed;transform:none}

.btn-outline{background:#fff;color:#0d9488;border:1.5px solid #99f6e4;
  border-radius:10px;padding:8px 16px;font-weight:600;font-size:.83rem;cursor:pointer;transition:all .2s}
.btn-outline:hover{background:#f0fdfa}

.btn-ghost{background:none;border:none;cursor:pointer;color:#94a3b8;
  font-size:.83rem;font-weight:600;padding:6px 10px;border-radius:8px;transition:all .2s}
.btn-ghost:hover{background:#f8fafc;color:#374151}

.input-f{
  width:100%;border:1.5px solid #e2e8f0;border-radius:10px;
  padding:10px 14px;font-size:.9rem;outline:none;transition:all .2s;
  font-family:'Plus Jakarta Sans',sans-serif;box-sizing:border-box;
}
.input-f:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,.12)}

.textarea-f{
  width:100%;border:1.5px solid #e2e8f0;border-radius:10px;
  padding:10px 14px;font-size:.9rem;outline:none;transition:all .2s;
  font-family:'Plus Jakarta Sans',sans-serif;box-sizing:border-box;resize:vertical;
}
.textarea-f:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,.12)}

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
  background:#fff;border-radius:20px;padding:32px;width:100%;max-width:560px;
  max-height:88vh;overflow-y:auto;
  box-shadow:0 24px 64px rgba(0,0,0,.18);animation:scaleIn .3s cubic-bezier(.22,1,.36,1) both;
}

.ai-box{
  background:linear-gradient(135deg,#f0fdfa,#ecfdf5);
  border:1.5px solid #99f6e4;border-radius:14px;padding:16px;
}

table{width:100%;border-collapse:collapse}
th{background:#f8fafc;color:#64748b;font-size:.77rem;font-weight:700;
   text-transform:uppercase;letter-spacing:.05em;padding:11px 14px;text-align:left}
td{padding:12px 14px;border-top:1px solid #f1f5f9;font-size:.87rem;color:#374151}
tr:hover td{background:#f8fafc}

.stat-card{border-radius:18px;padding:20px;display:flex;align-items:center;gap:14px;
  border:1px solid transparent;transition:all .25s;background:#fff}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.08)}

::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
`;

/* ── Spinner ── */
const Spinner = ({size=18}) => (
  <svg className="spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#0d9488" strokeWidth="3" opacity=".25"/>
    <path d="M4 12a8 8 0 018-8" stroke="#0d9488" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

/* ══════════════════════════════════════════════
   SECTION: OVERVIEW
══════════════════════════════════════════════ */
function OverviewSection({ userDetail, counts }) {
  const barRef  = useRef(null);
  const lineRef = useRef(null);
  const charts  = useRef({});

  useEffect(() => {
    const destroy = () => Object.values(charts.current).forEach(c => c?.destroy());
    destroy();
    if (barRef.current) {
      charts.current.bar = new Chart(barRef.current, {
        type:"bar",
        data:{
          labels:["Appointments","Patients","Prescriptions","Lab Orders"],
          datasets:[{
            data:[counts.appointments, counts.patients, counts.prescriptions, counts.labs],
            backgroundColor:["#0d9488","#3b82f6","#f59e0b","#ef4444"],
            borderRadius:8, borderSkipped:false,
          }]
        },
        options:{responsive:true,plugins:{legend:{display:false}},
          scales:{y:{beginAtZero:true,grid:{color:"#f1f5f9"},ticks:{color:"#94a3b8"}},
                  x:{grid:{display:false},ticks:{color:"#94a3b8"}}}}
      });
    }
    if (lineRef.current) {
      const b = counts.appointments || 5;
      charts.current.line = new Chart(lineRef.current, {
        type:"line",
        data:{
          labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
          datasets:[{
            label:"Appointments this week",
            data:[b*.6,b*.8,b,b*.9,b*1.1,b*.4,b*.2].map(Math.round),
            borderColor:"#0d9488",backgroundColor:"rgba(13,148,136,.08)",
            tension:.4,fill:true,pointRadius:5,
            pointBackgroundColor:"#0d9488",pointBorderColor:"#fff",pointBorderWidth:2,
          }]
        },
        options:{responsive:true,plugins:{legend:{display:false}},
          scales:{y:{beginAtZero:true,grid:{color:"#f1f5f9"},ticks:{color:"#94a3b8"}},
                  x:{grid:{display:false},ticks:{color:"#94a3b8"}}}}
      });
    }
    return destroy;
  }, [counts]);

  const stats = [
    {icon:"🗓️",label:"Today's Appointments",value:counts.todayAppt,  color:"#0d9488",bg:"#f0fdfa"},
    {icon:"📋",label:"My Patients",          value:counts.patients,   color:"#3b82f6",bg:"#eff6ff"},
    {icon:"📝",label:"Prescriptions",        value:counts.prescriptions,color:"#f59e0b",bg:"#fffbeb"},
    {icon:"🔬",label:"Pending Labs",         value:counts.labs,       color:"#ef4444",bg:"#fef2f2"},
  ];

  return (
    <div>
      <div className="fu mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Doctor Dashboard</h1>
        <p className="text-gray-500 mt-1">Good day, <span className="font-bold text-teal-600">Dr. {userDetail?.name ?? userDetail?.email}</span>!</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card fu d2"><h3 className="font-bold text-gray-700 mb-4">📊 My Activity Overview</h3><canvas ref={barRef} height="140"/></div>
        <div className="card fu d3"><h3 className="font-bold text-gray-700 mb-4">📈 Weekly Appointments</h3><canvas ref={lineRef} height="140"/></div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: APPOINTMENTS
══════════════════════════════════════════════ */
function AppointmentsSection({ userDetail }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [modal,   setModal]   = useState(null); // selected appointment

  const fetchAppts = async () => {
    setLoading(true);
    try {
      // Fetch appointments assigned to this doctor
      const q = query(
        collection(db, "appointments"),
        where("doctorId", "==", userDetail.uid),
        orderBy("date", "desc")
      );
      const snap = await getDocs(q);
      setList(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch(e) {
      // Fallback: fetch all if no doctorId filter available
      try {
        const snap = await getDocs(query(collection(db,"appointments"), orderBy("date","desc")));
        setList(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      } catch(e2){ console.error(e2) }
    }
    setLoading(false);
  };

  useEffect(() => { fetchAppts(); }, []);

  const filtered = filter==="all" ? list : list.filter(a => a.status===filter);

  const updateStatus = async (appt, status) => {
    await updateDoc(doc(db,"appointments",appt.id), { status });
    setList(p => p.map(a => a.id===appt.id ? {...a,status} : a));
    setModal(null);
    Swal.fire({title:"Updated!",icon:"success",timer:1500,showConfirmButton:false,confirmButtonColor:"#0d9488"});
  };

  const statusColor = s => ({pending:"b-pending",confirmed:"b-confirmed",completed:"b-completed",cancelled:"b-cancelled"}[s]??"b-pending");

  return (
    <div>
      <div className="fu flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">My Appointments</h2>
          <p className="text-gray-400 text-sm mt-0.5">View and manage all your scheduled appointments.</p>
        </div>
        <button className="btn-outline" onClick={fetchAppts}>🔄 Refresh</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 fu d1 flex-wrap">
        {["all","pending","confirmed","completed","cancelled"].map(f => (
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${filter===f?"bg-teal-500 text-white border-teal-500":"bg-white text-gray-500 border-gray-200 hover:border-teal-300 hover:text-teal-600"}`}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">
              ({f==="all"?list.length:list.filter(a=>a.status===f).length})
            </span>
          </button>
        ))}
      </div>

      <div className="card fu d2 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={28}/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">🗓️</div>
            <p className="text-gray-400 font-semibold">No {filter!=="all"?filter:""} appointments found.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>#</th><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map((a,i) => (
                <tr key={a.id}>
                  <td className="text-gray-400 text-xs font-mono">{i+1}</td>
                  <td className="font-semibold text-gray-800">{a.patientName ?? "—"}</td>
                  <td>{a.date ?? "—"}</td>
                  <td>{a.time ?? "—"}</td>
                  <td className="text-gray-500 max-w-[140px] truncate">{a.reason ?? "—"}</td>
                  <td><span className={`badge ${statusColor(a.status)}`}>{a.status ?? "pending"}</span></td>
                  <td>
                    <button className="btn-outline text-xs px-3 py-1.5" onClick={()=>setModal(a)}>
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) setModal(null) }}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-extrabold text-gray-800">📋 Appointment Details</h3>
              <button className="btn-ghost" onClick={()=>setModal(null)}>✕</button>
            </div>
            <div className="space-y-3 mb-6">
              {[
                ["Patient",  modal.patientName ?? "—"],
                ["Date",     modal.date ?? "—"],
                ["Time",     modal.time ?? "—"],
                ["Reason",   modal.reason ?? "—"],
                ["Notes",    modal.notes ?? "—"],
                ["Status",   modal.status ?? "pending"],
              ].map(([k,v]) => (
                <div key={k} className="flex gap-3">
                  <span className="text-xs font-bold text-gray-400 uppercase w-20 pt-0.5">{k}</span>
                  <span className="text-gray-700 font-medium flex-1">{v}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {["confirmed","completed","cancelled"].map(s => (
                  <button key={s} onClick={()=>updateStatus(modal,s)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition border ${modal.status===s?"opacity-50 cursor-default":""}`}
                    style={{background:s==="completed"?"#dcfce7":s==="confirmed"?"#f0fdfa":"#fef2f2",
                            color:s==="completed"?"#16a34a":s==="confirmed"?"#0d9488":"#dc2626",
                            border:`1px solid ${s==="completed"?"#bbf7d0":s==="confirmed"?"#99f6e4":"#fecaca"}`}}
                    disabled={modal.status===s}>
                    {s.charAt(0).toUpperCase()+s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: PATIENT HISTORY + DIAGNOSIS
══════════════════════════════════════════════ */
function PatientHistorySection({ userDetail }) {
  const [patients,  setPatients]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [history,   setHistory]   = useState([]);
  const [histLoad,  setHistLoad]  = useState(false);
  const [diagModal, setDiagModal] = useState(false);
  const [diagForm,  setDiagForm]  = useState({ diagnosis:"", symptoms:"", notes:"", date: new Date().toISOString().split("T")[0] });
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db,"patients"));
        setPatients(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      } catch(e){ console.error(e) }
      setLoading(false);
    };
    fetch();
  }, []);

  const selectPatient = async (p) => {
    setSelected(p);
    setHistLoad(true);
    try {
      const q = query(collection(db,"diagnoses"), where("patientId","==",p.id), orderBy("date","desc"));
      const snap = await getDocs(q);
      setHistory(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch(e){ console.error(e) }
    setHistLoad(false);
  };

  const saveDiagnosis = async () => {
    if (!diagForm.diagnosis.trim()) {
      Swal.fire({title:"Required",text:"Diagnosis is required.",icon:"warning",confirmButtonColor:"#0d9488"}); return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db,"diagnoses"), {
        patientId:   selected.id,
        patientName: selected.name,
        doctorId:    userDetail.uid,
        doctorName:  userDetail.name,
        diagnosis:   diagForm.diagnosis,
        symptoms:    diagForm.symptoms,
        notes:       diagForm.notes,
        date:        diagForm.date,
        createdAt:   serverTimestamp(),
      });
      Swal.fire({title:"✅ Saved!",text:"Diagnosis added successfully.",icon:"success",confirmButtonColor:"#0d9488",timer:2000,showConfirmButton:false});
      setDiagModal(false);
      setDiagForm({ diagnosis:"",symptoms:"",notes:"",date:new Date().toISOString().split("T")[0] });
      selectPatient(selected);
    } catch(e){
      Swal.fire({title:"Error",text:e.message,icon:"error",confirmButtonColor:"#0d9488"});
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="fu mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">Patient History & Diagnosis</h2>
        <p className="text-gray-400 text-sm mt-0.5">Select a patient to view history and add new diagnosis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient list */}
        <div className="card fu d1 overflow-y-auto max-h-[600px]">
          <h3 className="font-bold text-gray-700 mb-4">👥 Patients ({patients.length})</h3>
          {loading ? <div className="flex justify-center py-8"><Spinner/></div> :
           patients.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No patients found.</p> :
           <div className="space-y-2">
            {patients.map(p => (
              <button key={p.id} onClick={()=>selectPatient(p)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selected?.id===p.id?"bg-teal-50 border-2 border-teal-400":"bg-gray-50 border-2 border-transparent hover:border-teal-200"}`}>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {p.name?.[0]?.toUpperCase() ?? "P"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 truncate">{p.email ?? p.phone ?? "—"}</p>
                  </div>
                </div>
              </button>
            ))}
           </div>
          }
        </div>

        {/* Patient detail + history */}
        <div className="md:col-span-2 space-y-5">
          {!selected ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center fu d2">
              <div className="text-6xl mb-4">👈</div>
              <p className="text-gray-400 font-semibold">Select a patient to view their history</p>
            </div>
          ) : (
            <>
              {/* Patient card */}
              <div className="card fu d1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-extrabold text-2xl">
                      {selected.name?.[0]?.toUpperCase() ?? "P"}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-800">{selected.name}</h3>
                      <p className="text-sm text-gray-400">{selected.email} · {selected.phone ?? "—"}</p>
                      <p className="text-sm text-gray-400">Age: {selected.age ?? "—"} · Blood: {selected.bloodGroup ?? "—"}</p>
                    </div>
                  </div>
                  <button className="btn-teal" onClick={()=>setDiagModal(true)}>
                    ＋ Add Diagnosis
                  </button>
                </div>
              </div>

              {/* Diagnosis history */}
              <div className="card fu d2">
                <h3 className="font-bold text-gray-700 mb-4">🗂️ Diagnosis History ({history.length})</h3>
                {histLoad ? <div className="flex justify-center py-8"><Spinner/></div> :
                 history.length===0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-gray-400 text-sm">No diagnosis records yet.</p>
                  </div>
                 ) : (
                  <div className="space-y-4">
                    {history.map(h => (
                      <div key={h.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-800">{h.diagnosis}</p>
                            <p className="text-xs text-gray-400 mt-0.5">by Dr. {h.doctorName} · {h.date}</p>
                          </div>
                        </div>
                        {h.symptoms && <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Symptoms:</span> {h.symptoms}</p>}
                        {h.notes    && <p className="text-sm text-gray-600"><span className="font-semibold">Notes:</span> {h.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Diagnosis Modal */}
      {diagModal && (
        <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) setDiagModal(false) }}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-extrabold text-gray-800">📋 Add Diagnosis — {selected?.name}</h3>
              <button className="btn-ghost" onClick={()=>setDiagModal(false)}>✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Diagnosis *</label>
                <input className="input-f" placeholder="e.g. Type 2 Diabetes" value={diagForm.diagnosis}
                  onChange={e=>setDiagForm(p=>({...p,diagnosis:e.target.value}))}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Symptoms</label>
                <textarea className="textarea-f" rows="2" placeholder="e.g. Fatigue, frequent urination"
                  value={diagForm.symptoms} onChange={e=>setDiagForm(p=>({...p,symptoms:e.target.value}))}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Doctor Notes</label>
                <textarea className="textarea-f" rows="3" placeholder="Additional observations..."
                  value={diagForm.notes} onChange={e=>setDiagForm(p=>({...p,notes:e.target.value}))}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Date</label>
                <input className="input-f" type="date" value={diagForm.date}
                  onChange={e=>setDiagForm(p=>({...p,date:e.target.value}))}/>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-teal flex-1 justify-center" onClick={saveDiagnosis} disabled={saving}>
                {saving ? <><Spinner/> Saving...</> : "💾 Save Diagnosis"}
              </button>
              <button className="btn-outline flex-1" onClick={()=>setDiagModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: PRESCRIPTIONS
══════════════════════════════════════════════ */
function PrescriptionsSection({ userDetail }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [patients,setPatients]= useState([]);
  const [form,    setForm]    = useState({ patientId:"", patientName:"", medicines:"", dosage:"", duration:"", instructions:"", date: new Date().toISOString().split("T")[0] });
  const [saving,  setSaving]  = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pSnap,rxSnap] = await Promise.all([
        getDocs(collection(db,"patients")),
        getDocs(query(collection(db,"prescriptions"), where("doctorId","==",userDetail.uid), orderBy("createdAt","desc")))
      ]);
      setPatients(pSnap.docs.map(d=>({id:d.id,...d.data()})));
      setList(rxSnap.docs.map(d=>({id:d.id,...d.data()})));
    } catch(e) {
      try {
        const [pSnap,rxSnap] = await Promise.all([
          getDocs(collection(db,"patients")),
          getDocs(query(collection(db,"prescriptions"), orderBy("createdAt","desc")))
        ]);
        setPatients(pSnap.docs.map(d=>({id:d.id,...d.data()})));
        setList(rxSnap.docs.map(d=>({id:d.id,...d.data()})));
      } catch(e2){ console.error(e2) }
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const save = async () => {
    if (!form.patientId || !form.medicines.trim()) {
      Swal.fire({title:"Required",text:"Patient and medicines are required.",icon:"warning",confirmButtonColor:"#0d9488"}); return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db,"prescriptions"), {
        ...form, doctorId:userDetail.uid, doctorName:userDetail.name, createdAt:serverTimestamp(),
      });
      Swal.fire({title:"✅ Saved!",icon:"success",confirmButtonColor:"#0d9488",timer:2000,showConfirmButton:false});
      setModal(false);
      setForm({ patientId:"",patientName:"",medicines:"",dosage:"",duration:"",instructions:"",date:new Date().toISOString().split("T")[0] });
      fetchAll();
    } catch(e){
      Swal.fire({title:"Error",text:e.message,icon:"error",confirmButtonColor:"#0d9488"});
    }
    setSaving(false);
  };

  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  return (
    <div>
      <div className="fu flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Prescriptions</h2>
          <p className="text-gray-400 text-sm mt-0.5">Write and manage patient prescriptions.</p>
        </div>
        <button className="btn-teal" onClick={()=>setModal(true)}>📝 New Prescription</button>
      </div>

      <div className="card fu d2 overflow-x-auto">
        {loading ? <div className="flex justify-center py-12"><Spinner size={28}/></div> :
         list.length===0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">💊</div>
            <p className="text-gray-400 font-semibold">No prescriptions written yet.</p>
            <button className="btn-teal mt-4" onClick={()=>setModal(true)}>Write First Prescription</button>
          </div>
         ) : (
          <table>
            <thead><tr><th>#</th><th>Patient</th><th>Medicines</th><th>Dosage</th><th>Duration</th><th>Date</th></tr></thead>
            <tbody>
              {list.map((rx,i) => (
                <tr key={rx.id}>
                  <td className="text-gray-400 text-xs font-mono">{i+1}</td>
                  <td className="font-semibold text-gray-800">{rx.patientName}</td>
                  <td className="text-gray-600 max-w-[160px] truncate">{rx.medicines}</td>
                  <td className="text-gray-500">{rx.dosage||"—"}</td>
                  <td className="text-gray-500">{rx.duration||"—"}</td>
                  <td className="text-gray-500">{rx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) setModal(false) }}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-extrabold text-gray-800">📝 New Prescription</h3>
              <button className="btn-ghost" onClick={()=>setModal(false)}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Patient *</label>
                <select className="input-f" value={form.patientId}
                  onChange={e=>{ const p=patients.find(x=>x.id===e.target.value); setForm(prev=>({...prev,patientId:e.target.value,patientName:p?.name??""})) }}>
                  <option value="">— Select Patient —</option>
                  {patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Medicines *</label>
                <textarea className="textarea-f" rows="2" placeholder="e.g. Metformin 500mg, Aspirin 75mg"
                  value={form.medicines} onChange={f("medicines")}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Dosage</label>
                  <input className="input-f" placeholder="e.g. 1 tablet twice daily" value={form.dosage} onChange={f("dosage")}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Duration</label>
                  <input className="input-f" placeholder="e.g. 7 days" value={form.duration} onChange={f("duration")}/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Instructions</label>
                <textarea className="textarea-f" rows="2" placeholder="e.g. Take after meals, avoid alcohol"
                  value={form.instructions} onChange={f("instructions")}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Date</label>
                <input className="input-f" type="date" value={form.date} onChange={f("date")}/>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-teal flex-1 justify-center" onClick={save} disabled={saving}>
                {saving?<><Spinner/> Saving...</>:"💾 Save Prescription"}
              </button>
              <button className="btn-outline flex-1" onClick={()=>setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: AI ASSISTANCE
══════════════════════════════════════════════ */
function AIAssistSection() {
  const [prompt,   setPrompt]   = useState("");
  const [response, setResponse] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [history,  setHistory]  = useState([]);

  const QUICK = [
    "Suggest treatment for Type 2 Diabetes",
    "Drug interactions for Metformin and Aspirin",
    "Symptoms of acute appendicitis",
    "First line antibiotics for UTI",
    "Hypertension management guidelines",
    "Dosage for Amoxicillin in adults",
  ];

  const ask = async (q) => {
    const question = q || prompt;
    if (!question.trim()) return;
    setLoading(true);
    setResponse("");
    try {
      // Uses your existing Gemini setup — replace with generateAI() if preferred
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-goog-api-key": import.meta.env.VITE_GEMINI_KEY ?? ""},
        body: JSON.stringify({ contents:[{ parts:[{ text:`You are a medical AI assistant helping a doctor. Answer concisely and professionally.\n\nQuestion: ${question}` }] }] })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response received.";
      setResponse(text);
      setHistory(p => [{ q: question, a: text, time: new Date().toLocaleTimeString() }, ...p.slice(0,4)]);
    } catch(e) {
      setResponse("⚠️ Could not connect to AI. Check your Gemini API key in .env (VITE_GEMINI_KEY).");
    }
    setLoading(false);
    if (!q) setPrompt("");
  };

  return (
    <div>
      <div className="fu mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">🤖 AI Medical Assistant</h2>
        <p className="text-gray-400 text-sm mt-0.5">Ask about diagnoses, treatments, drug interactions and more.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card fu d1">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Your Question</label>
            <textarea className="textarea-f" rows="4"
              placeholder="e.g. What is the recommended first-line treatment for hypertension in a 60-year-old patient with diabetes?"
              value={prompt} onChange={e=>setPrompt(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter" && e.ctrlKey) ask() }}/>
            <p className="text-xs text-gray-400 mt-1">Ctrl + Enter to submit</p>
            <button className="btn-teal mt-3 w-full justify-center" onClick={()=>ask()} disabled={loading||!prompt.trim()}>
              {loading ? <><Spinner/> Thinking...</> : "🤖 Ask AI"}
            </button>
          </div>

          {/* Response */}
          {(loading || response) && (
            <div className="ai-box fu">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🤖</span>
                <span className="font-bold text-teal-700 text-sm">AI Response</span>
                {loading && <span className="pulse text-xs text-teal-500 ml-auto">Generating...</span>}
              </div>
              {loading
                ? <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="pulse h-4 bg-teal-100 rounded w-full"/>)}</div>
                : <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
              }
            </div>
          )}
        </div>

        {/* Quick prompts + history */}
        <div className="space-y-5">
          <div className="card fu d2">
            <h3 className="font-bold text-gray-700 mb-3 text-sm">⚡ Quick Questions</h3>
            <div className="space-y-2">
              {QUICK.map(q=>(
                <button key={q} onClick={()=>ask(q)}
                  className="w-full text-left text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold px-3 py-2.5 rounded-lg transition border border-teal-100">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="card fu d3">
              <h3 className="font-bold text-gray-700 mb-3 text-sm">🕒 Recent Questions</h3>
              <div className="space-y-3">
                {history.map((h,i) => (
                  <button key={i} onClick={()=>{ setPrompt(h.q); setResponse(h.a) }}
                    className="w-full text-left text-xs bg-gray-50 hover:bg-gray-100 px-3 py-2.5 rounded-lg transition">
                    <p className="font-semibold text-gray-700 truncate">{h.q}</p>
                    <p className="text-gray-400 mt-0.5">{h.time}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: PERSONAL ANALYTICS
══════════════════════════════════════════════ */
function AnalyticsSection({ userDetail, counts }) {
  const donutRef = useRef(null);
  const areaRef  = useRef(null);
  const charts   = useRef({});

  useEffect(() => {
    const destroy = () => Object.values(charts.current).forEach(c=>c?.destroy());
    destroy();
    if (donutRef.current) {
      charts.current.donut = new Chart(donutRef.current, {
        type:"doughnut",
        data:{
          labels:["Appointments","Prescriptions","Diagnoses","Lab Orders"],
          datasets:[{ data:[counts.appointments,counts.prescriptions,counts.diagnoses,counts.labs],
            backgroundColor:["#0d9488","#3b82f6","#f59e0b","#ef4444"],borderWidth:0,hoverOffset:6 }]
        },
        options:{responsive:true,cutout:"68%",
          plugins:{legend:{position:"bottom",labels:{font:{size:11},padding:12,color:"#64748b"}}}}
      });
    }
    if (areaRef.current) {
      const b = counts.appointments || 4;
      charts.current.area = new Chart(areaRef.current, {
        type:"line",
        data:{
          labels:["Jan","Feb","Mar","Apr","May","Jun"],
          datasets:[
            {label:"Appointments",data:[b*.5,b*.7,b*.8,b*.9,b,b*1.1].map(Math.round),
             borderColor:"#0d9488",backgroundColor:"rgba(13,148,136,.08)",tension:.4,fill:true,pointRadius:4,pointBackgroundColor:"#0d9488",pointBorderColor:"#fff",pointBorderWidth:2},
            {label:"Prescriptions",data:[b*.3,b*.4,b*.5,b*.6,b*.7,b*.8].map(Math.round),
             borderColor:"#3b82f6",backgroundColor:"rgba(59,130,246,.06)",tension:.4,fill:true,pointRadius:4,pointBackgroundColor:"#3b82f6",pointBorderColor:"#fff",pointBorderWidth:2},
          ]
        },
        options:{responsive:true,
          plugins:{legend:{labels:{color:"#64748b",font:{size:12}}}},
          scales:{y:{beginAtZero:true,grid:{color:"#f1f5f9"},ticks:{color:"#94a3b8"}},
                  x:{grid:{display:false},ticks:{color:"#94a3b8"}}}}
      });
    }
    return destroy;
  }, [counts]);

  const kpis = [
    {icon:"🗓️",label:"Total Appointments",value:counts.appointments,color:"#0d9488",bg:"#f0fdfa"},
    {icon:"📋",label:"Patients Seen",      value:counts.patients,    color:"#3b82f6",bg:"#eff6ff"},
    {icon:"📝",label:"Prescriptions",      value:counts.prescriptions,color:"#f59e0b",bg:"#fffbeb"},
    {icon:"🔬",label:"Lab Orders",         value:counts.labs,        color:"#ef4444",bg:"#fef2f2"},
  ];

  return (
    <div>
      <div className="fu mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">My Analytics</h2>
        <p className="text-gray-400 text-sm mt-0.5">Personal performance stats and trends.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k,i)=>(
          <div key={k.label} className={`stat-card fu d${i+1}`} style={{background:k.bg,border:`1px solid ${k.color}18`}}>
            <div className="text-2xl p-2.5 rounded-xl bg-white shadow-sm">{k.icon}</div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{k.label}</p>
              <p className="text-2xl font-extrabold" style={{color:k.color}}>{k.value ?? "—"}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card fu d2"><h3 className="font-bold text-gray-700 mb-4">🍩 Activity Breakdown</h3><canvas ref={donutRef}/></div>
        <div className="card fu d3"><h3 className="font-bold text-gray-700 mb-4">📈 6-Month Trend</h3><canvas ref={areaRef} height="160"/></div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN DOCTOR DASHBOARD
══════════════════════════════════════════════ */
const TABS = [
  { key:"overview",     icon:"🏠", label:"Overview"      },
  { key:"appointments", icon:"🗓️", label:"Appointments"  },
  { key:"patients",     icon:"📋", label:"Patient History"},
  { key:"prescriptions",icon:"📝", label:"Prescriptions" },
  { key:"ai",           icon:"🤖", label:"AI Assistant"  },
  { key:"analytics",    icon:"📊", label:"Analytics"     },
];

function DoctorDashboard({ userDetail, handleLogout }) {
  const [tab,    setTab]    = useState("overview");
  const [counts, setCounts] = useState({ appointments:0,todayAppt:0,patients:0,prescriptions:0,labs:0,diagnoses:0 });

  useEffect(() => {
    const load = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const [aSnap,pSnap,rxSnap,lSnap,dSnap] = await Promise.all([
          getDocs(collection(db,"appointments")),
          getDocs(collection(db,"patients")),
          getDocs(collection(db,"prescriptions")),
          getDocs(collection(db,"lab_orders")),
          getDocs(collection(db,"diagnoses")),
        ]);
        const todayAppt = aSnap.docs.filter(d=>d.data().date===today).length;
        setCounts({
          appointments: aSnap.size,
          todayAppt,
          patients:     pSnap.size,
          prescriptions:rxSnap.size,
          labs:         lSnap.size,
          diagnoses:    dSnap.size,
        });
      } catch(e){ console.error(e) }
    };
    load();
  }, [tab]);

  return (
    <>
      <style>{CSS}</style>
      <div className="doc-root flex min-h-screen bg-gray-50">

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
            <span className="text-xs font-bold px-3 py-0.5 rounded-full mt-1 text-white" style={{background:AC.color}}>🩺 Doctor</span>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3 mb-6">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow" style={{background:AC.color}}>
              {(userDetail?.name??userDetail?.email)?.[0]?.toUpperCase()??"D"}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-gray-800 text-sm truncate">Dr. {userDetail?.name??"Doctor"}</p>
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
          {tab==="overview"     && <OverviewSection      userDetail={userDetail} counts={counts}/>}
          {tab==="appointments" && <AppointmentsSection  userDetail={userDetail}/>}
          {tab==="patients"     && <PatientHistorySection userDetail={userDetail}/>}
          {tab==="prescriptions"&& <PrescriptionsSection  userDetail={userDetail}/>}
          {tab==="ai"           && <AIAssistSection/>}
          {tab==="analytics"    && <AnalyticsSection     userDetail={userDetail} counts={counts}/>}
        </main>
      </div>
    </>
  );
}

export default DoctorDashboard;