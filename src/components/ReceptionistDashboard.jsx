import { useState, useEffect, useRef } from "react";
import { db } from "../firebase.jsx";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, where, serverTimestamp
} from "firebase/firestore";
import Swal from "sweetalert2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const AC = { color:"#f59e0b", light:"#fffbeb", dark:"#d97706" };

/* ══════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.rec-root * { font-family:'Plus Jakarta Sans',sans-serif; }

@keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideIn { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
@keyframes scaleIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
@keyframes spinA   { to{transform:rotate(360deg)} }

.fu {animation:fadeUp  .5s cubic-bezier(.22,1,.36,1) both}
.si {animation:slideIn .5s cubic-bezier(.22,1,.36,1) both}
.sci{animation:scaleIn .35s cubic-bezier(.22,1,.36,1) both}
.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
.d4{animation-delay:.2s}.d5{animation-delay:.25s}.d6{animation-delay:.3s}
.spin{animation:spinA .8s linear infinite}

.nav-item{
  display:flex;align-items:center;gap:10px;padding:10px 14px;
  border-radius:10px;font-weight:600;font-size:.85rem;color:#64748b;
  cursor:pointer;transition:all .2s;border:none;background:none;width:100%;text-align:left;
}
.nav-item:hover{background:#fffbeb;color:#f59e0b;transform:translateX(3px)}
.nav-item.active{background:#fffbeb;color:#f59e0b}

.card{background:#fff;border-radius:18px;border:1px solid #f1f5f9;
  box-shadow:0 2px 12px rgba(0,0,0,.05);padding:24px;transition:box-shadow .2s}
.card:hover{box-shadow:0 6px 24px rgba(245,158,11,.09)}

.btn-amber{
  background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;
  border:none;border-radius:10px;padding:9px 18px;font-weight:700;
  font-size:.85rem;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;
}
.btn-amber:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(245,158,11,.38)}
.btn-amber:disabled{opacity:.6;cursor:not-allowed;transform:none}

.btn-outline{background:#fff;color:#f59e0b;border:1.5px solid #fde68a;
  border-radius:10px;padding:8px 16px;font-weight:600;font-size:.83rem;cursor:pointer;transition:all .2s}
.btn-outline:hover{background:#fffbeb}

.btn-danger{background:#fff;color:#ef4444;border:1.5px solid #fecaca;
  border-radius:10px;padding:7px 14px;font-weight:600;font-size:.82rem;cursor:pointer;transition:all .2s}
.btn-danger:hover{background:#fef2f2}

.btn-edit{background:#fff;color:#f59e0b;border:1.5px solid #fde68a;
  border-radius:10px;padding:7px 14px;font-weight:600;font-size:.82rem;cursor:pointer;transition:all .2s}
.btn-edit:hover{background:#fffbeb}

.btn-ghost{background:none;border:none;cursor:pointer;color:#94a3b8;
  font-size:.83rem;font-weight:600;padding:6px 10px;border-radius:8px;transition:all .2s}
.btn-ghost:hover{background:#f8fafc;color:#374151}

.input-f{
  width:100%;border:1.5px solid #e2e8f0;border-radius:10px;
  padding:10px 14px;font-size:.9rem;outline:none;transition:all .2s;
  font-family:'Plus Jakarta Sans',sans-serif;box-sizing:border-box;
}
.input-f:focus{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.12)}

.textarea-f{
  width:100%;border:1.5px solid #e2e8f0;border-radius:10px;
  padding:10px 14px;font-size:.9rem;outline:none;transition:all .2s;
  font-family:'Plus Jakarta Sans',sans-serif;box-sizing:border-box;resize:vertical;min-height:80px;
}
.textarea-f:focus{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.12)}

.badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:700}
.b-pending  {background:#fef3c7;color:#d97706}
.b-confirmed{background:#dcfce7;color:#16a34a}
.b-completed{background:#e0f2fe;color:#0369a1}
.b-cancelled{background:#fee2e2;color:#dc2626}
.b-waiting  {background:#fef3c7;color:#d97706}

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

.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.form-grid .full{grid-column:1/-1}

table{width:100%;border-collapse:collapse}
th{background:#fafafa;color:#64748b;font-size:.77rem;font-weight:700;
   text-transform:uppercase;letter-spacing:.05em;padding:11px 14px;text-align:left}
td{padding:12px 14px;border-top:1px solid #f1f5f9;font-size:.87rem;color:#374151}
tr:hover td{background:#fafafa}

.search-box{
  position:relative;
}
.search-box input{padding-left:38px}
.search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:1rem;pointer-events:none}

::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
`;

/* ── Spinner ── */
const Spinner = ({size=18}) => (
  <svg className="spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="3" opacity=".25"/>
    <path d="M4 12a8 8 0 018-8" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const today = new Date().toISOString().split("T")[0];

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
          labels:["Patients","Today's Appts","Waiting","Confirmed"],
          datasets:[{
            data:[counts.patients, counts.todayAppt, counts.waiting, counts.confirmed],
            backgroundColor:["#f59e0b","#0d9488","#3b82f6","#10b981"],
            borderRadius:8, borderSkipped:false,
          }]
        },
        options:{responsive:true,plugins:{legend:{display:false}},
          scales:{y:{beginAtZero:true,grid:{color:"#f1f5f9"},ticks:{color:"#94a3b8"}},
                  x:{grid:{display:false},ticks:{color:"#94a3b8"}}}}
      });
    }
    if (lineRef.current) {
      const b = counts.appointments || 6;
      charts.current.line = new Chart(lineRef.current, {
        type:"line",
        data:{
          labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
          datasets:[{
            label:"Appointments",
            data:[b*.6,b*.8,b*.9,b,b*.85,b*.4,b*.2].map(Math.round),
            borderColor:"#f59e0b",backgroundColor:"rgba(245,158,11,.08)",
            tension:.4,fill:true,pointRadius:5,
            pointBackgroundColor:"#f59e0b",pointBorderColor:"#fff",pointBorderWidth:2,
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
    {icon:"🗓️",label:"Today's Appts",  value:counts.todayAppt, color:"#f59e0b",bg:"#fffbeb"},
    {icon:"📋",label:"Total Patients", value:counts.patients,  color:"#0d9488",bg:"#f0fdfa"},
    {icon:"⏳",label:"Waiting Room",   value:counts.waiting,   color:"#3b82f6",bg:"#eff6ff"},
    {icon:"✅",label:"Confirmed",      value:counts.confirmed, color:"#10b981",bg:"#f0fdf4"},
  ];

  return (
    <div>
      <div className="fu mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Receptionist Dashboard</h1>
        <p className="text-gray-500 mt-1">Hello, <span className="font-bold text-amber-500">{userDetail?.name ?? userDetail?.email}</span>! Manage today's front desk.</p>
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
        <div className="card fu d2"><h3 className="font-bold text-gray-700 mb-4">📊 Today's Overview</h3><canvas ref={barRef} height="140"/></div>
        <div className="card fu d3"><h3 className="font-bold text-gray-700 mb-4">📈 Weekly Appointments</h3><canvas ref={lineRef} height="140"/></div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: REGISTER / MANAGE PATIENTS
══════════════════════════════════════════════ */
const EMPTY_PATIENT = { name:"", email:"", phone:"", age:"", gender:"male", bloodGroup:"", address:"", emergencyContact:"" };

function PatientsSection() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(null); // null | "add" | {patient}
  const [form,    setForm]    = useState(EMPTY_PATIENT);
  const [saving,  setSaving]  = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db,"patients"), orderBy("createdAt","desc")));
      setList(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch(e){ console.error(e) }
    setLoading(false);
  };

  useEffect(() => { fetchPatients(); }, []);

  const filtered = list.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  const openAdd  = () => { setForm(EMPTY_PATIENT); setModal("add"); };
  const openEdit = (p)  => { setForm({ name:p.name||"",email:p.email||"",phone:p.phone||"",
    age:p.age||"",gender:p.gender||"male",bloodGroup:p.bloodGroup||"",
    address:p.address||"",emergencyContact:p.emergencyContact||"" }); setModal(p); };

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      Swal.fire({title:"Required",text:"Name and Phone are required.",icon:"warning",confirmButtonColor:"#f59e0b"}); return;
    }
    setSaving(true);
    try {
      if (modal==="add") {
        await addDoc(collection(db,"patients"), { ...form, createdAt:serverTimestamp() });
        Swal.fire({title:"✅ Registered!",text:"Patient registered successfully.",icon:"success",confirmButtonColor:"#f59e0b",timer:2000,showConfirmButton:false});
      } else {
        await updateDoc(doc(db,"patients",modal.id), { ...form });
        Swal.fire({title:"✅ Updated!",text:"Patient info updated.",icon:"success",confirmButtonColor:"#f59e0b",timer:2000,showConfirmButton:false});
      }
      setModal(null);
      fetchPatients();
    } catch(e){
      Swal.fire({title:"Error",text:e.message,icon:"error",confirmButtonColor:"#f59e0b"});
    }
    setSaving(false);
  };

  const remove = async (p) => {
    const res = await Swal.fire({
      title:"Remove Patient?",html:`<b>${p.name}</b> will be permanently deleted.`,
      icon:"warning",showCancelButton:true,confirmButtonText:"Yes, delete",confirmButtonColor:"#ef4444",
    });
    if (!res.isConfirmed) return;
    await deleteDoc(doc(db,"patients",p.id));
    Swal.fire({title:"Deleted!",icon:"success",confirmButtonColor:"#f59e0b",timer:1500,showConfirmButton:false});
    fetchPatients();
  };

  return (
    <div>
      <div className="fu flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Patients</h2>
          <p className="text-gray-400 text-sm mt-0.5">Register new patients and update their information.</p>
        </div>
        <button className="btn-amber" onClick={openAdd}>➕ Register Patient</button>
      </div>

      {/* Search */}
      <div className="search-box fu d1 mb-5 max-w-sm">
        <span className="search-icon">🔍</span>
        <input className="input-f" placeholder="Search by name, email or phone..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div className="card fu d2 overflow-x-auto">
        {loading ? <div className="flex justify-center py-12"><Spinner size={28}/></div> :
         filtered.length===0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-gray-400 font-semibold">{search ? "No patients match your search." : "No patients registered yet."}</p>
            {!search && <button className="btn-amber mt-4" onClick={openAdd}>Register First Patient</button>}
          </div>
         ) : (
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Age</th><th>Gender</th><th>Blood</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((p,i) => (
                <tr key={p.id}>
                  <td className="text-gray-400 text-xs font-mono">{i+1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {p.name?.[0]?.toUpperCase()??"P"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.email||"—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-500">{p.phone||"—"}</td>
                  <td className="text-gray-500">{p.age||"—"}</td>
                  <td className="text-gray-500 capitalize">{p.gender||"—"}</td>
                  <td className="text-gray-500">{p.bloodGroup||"—"}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-edit"   onClick={()=>openEdit(p)}>✏️ Edit</button>
                      <button className="btn-danger" onClick={()=>remove(p)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) setModal(null) }}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-extrabold text-gray-800">
                {modal==="add" ? "➕ Register New Patient" : `✏️ Edit — ${modal.name}`}
              </h3>
              <button className="btn-ghost" onClick={()=>setModal(null)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="full">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Full Name *</label>
                <input className="input-f" placeholder="e.g. Ahmed Khan" value={form.name} onChange={f("name")}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Phone *</label>
                <input className="input-f" placeholder="+92 300 0000000" value={form.phone} onChange={f("phone")}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Email</label>
                <input className="input-f" type="email" placeholder="patient@email.com" value={form.email} onChange={f("email")}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Age</label>
                <input className="input-f" type="number" placeholder="e.g. 35" value={form.age} onChange={f("age")}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Gender</label>
                <select className="input-f" value={form.gender} onChange={f("gender")}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Blood Group</label>
                <select className="input-f" value={form.bloodGroup} onChange={f("bloodGroup")}>
                  <option value="">— Select —</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Emergency Contact</label>
                <input className="input-f" placeholder="+92 300 0000000" value={form.emergencyContact} onChange={f("emergencyContact")}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Address</label>
                <input className="input-f" placeholder="City, Street..." value={form.address} onChange={f("address")}/>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-amber flex-1 justify-center" onClick={save} disabled={saving}>
                {saving ? <><Spinner/> Saving...</> : modal==="add" ? "Register Patient" : "Save Changes"}
              </button>
              <button className="btn-outline flex-1" style={{textAlign:"center"}} onClick={()=>setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: APPOINTMENTS
══════════════════════════════════════════════ */
const EMPTY_APPT = { patientId:"", patientName:"", doctorId:"", doctorName:"", date:today, time:"", reason:"", status:"pending", notes:"" };

function AppointmentsSection() {
  const [list,     setList]     = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors,  setDoctors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState(EMPTY_APPT);
  const [saving,   setSaving]   = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aSnap,pSnap,dSnap] = await Promise.all([
        getDocs(query(collection(db,"appointments"), orderBy("date","desc"))),
        getDocs(collection(db,"patients")),
        getDocs(collection(db,"doctors")),
      ]);
      setList(aSnap.docs.map(d=>({id:d.id,...d.data()})));
      setPatients(pSnap.docs.map(d=>({id:d.id,...d.data()})));
      setDoctors(dSnap.docs.map(d=>({id:d.id,...d.data()})));
    } catch(e){ console.error(e) }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = filter==="all" ? list : list.filter(a=>a.status===filter);

  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const openAdd  = () => { setForm(EMPTY_APPT); setModal("add"); };
  const openEdit = (a)  => {
    setForm({ patientId:a.patientId||"", patientName:a.patientName||"",
              doctorId:a.doctorId||"", doctorName:a.doctorName||"",
              date:a.date||today, time:a.time||"", reason:a.reason||"",
              status:a.status||"pending", notes:a.notes||"" });
    setModal(a);
  };

  const save = async () => {
    if (!form.patientName.trim() || !form.date || !form.time) {
      Swal.fire({title:"Required",text:"Patient, date and time are required.",icon:"warning",confirmButtonColor:"#f59e0b"}); return;
    }
    setSaving(true);
    try {
      if (modal==="add") {
        await addDoc(collection(db,"appointments"), { ...form, createdAt:serverTimestamp() });
        Swal.fire({title:"✅ Booked!",text:"Appointment booked successfully.",icon:"success",confirmButtonColor:"#f59e0b",timer:2000,showConfirmButton:false});
      } else {
        await updateDoc(doc(db,"appointments",modal.id), { ...form });
        Swal.fire({title:"✅ Updated!",icon:"success",confirmButtonColor:"#f59e0b",timer:2000,showConfirmButton:false});
      }
      setModal(null);
      fetchAll();
    } catch(e){
      Swal.fire({title:"Error",text:e.message,icon:"error",confirmButtonColor:"#f59e0b"});
    }
    setSaving(false);
  };

  const remove = async (a) => {
    const res = await Swal.fire({
      title:"Cancel Appointment?",html:`Appointment for <b>${a.patientName}</b> will be deleted.`,
      icon:"warning",showCancelButton:true,confirmButtonText:"Yes, delete",confirmButtonColor:"#ef4444",
    });
    if (!res.isConfirmed) return;
    await deleteDoc(doc(db,"appointments",a.id));
    Swal.fire({title:"Deleted!",icon:"success",confirmButtonColor:"#f59e0b",timer:1500,showConfirmButton:false});
    fetchAll();
  };

  const statusColor = s => ({pending:"b-pending",confirmed:"b-confirmed",completed:"b-completed",cancelled:"b-cancelled"}[s]??"b-pending");

  return (
    <div>
      <div className="fu flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Appointments</h2>
          <p className="text-gray-400 text-sm mt-0.5">Book, edit and manage all clinic appointments.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={fetchAll}>🔄 Refresh</button>
          <button className="btn-amber"   onClick={openAdd}>➕ Book Appointment</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 fu d1 flex-wrap">
        {["all","pending","confirmed","completed","cancelled"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${filter===s?"bg-amber-400 text-white border-amber-400":"bg-white text-gray-500 border-gray-200 hover:border-amber-300 hover:text-amber-600"}`}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">
              ({s==="all"?list.length:list.filter(a=>a.status===s).length})
            </span>
          </button>
        ))}
      </div>

      <div className="card fu d2 overflow-x-auto">
        {loading ? <div className="flex justify-center py-12"><Spinner size={28}/></div> :
         filtered.length===0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">🗓️</div>
            <p className="text-gray-400 font-semibold">No {filter!=="all"?filter:""} appointments found.</p>
            <button className="btn-amber mt-4" onClick={openAdd}>Book First Appointment</button>
          </div>
         ) : (
          <table>
            <thead><tr><th>#</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((a,i) => (
                <tr key={a.id}>
                  <td className="text-gray-400 text-xs font-mono">{i+1}</td>
                  <td className="font-semibold text-gray-800">{a.patientName||"—"}</td>
                  <td className="text-gray-500">{a.doctorName||"—"}</td>
                  <td className="text-gray-500">{a.date||"—"}</td>
                  <td className="text-gray-500">{a.time||"—"}</td>
                  <td className="text-gray-400 max-w-[120px] truncate text-xs">{a.reason||"—"}</td>
                  <td><span className={`badge ${statusColor(a.status)}`}>{a.status||"pending"}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-edit"   onClick={()=>openEdit(a)}>✏️</button>
                      <button className="btn-danger" onClick={()=>remove(a)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) setModal(null) }}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-extrabold text-gray-800">
                {modal==="add" ? "📅 Book Appointment" : "✏️ Edit Appointment"}
              </h3>
              <button className="btn-ghost" onClick={()=>setModal(null)}>✕</button>
            </div>
            <div className="form-grid">
              {/* Patient */}
              <div className="full">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Patient *</label>
                <select className="input-f" value={form.patientId}
                  onChange={e=>{ const p=patients.find(x=>x.id===e.target.value); setForm(pr=>({...pr,patientId:e.target.value,patientName:p?.name??""})) }}>
                  <option value="">— Select Patient —</option>
                  {patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {/* Doctor */}
              <div className="full">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Doctor</label>
                <select className="input-f" value={form.doctorId}
                  onChange={e=>{ const d=doctors.find(x=>x.id===e.target.value); setForm(pr=>({...pr,doctorId:e.target.value,doctorName:d?.name??""})) }}>
                  <option value="">— Select Doctor —</option>
                  {doctors.map(d=><option key={d.id} value={d.id}>Dr. {d.name} {d.specialization?"("+d.specialization+")":""}</option>)}
                </select>
              </div>
              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Date *</label>
                <input className="input-f" type="date" value={form.date} onChange={f("date")}/>
              </div>
              {/* Time */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Time *</label>
                <input className="input-f" type="time" value={form.time} onChange={f("time")}/>
              </div>
              {/* Reason */}
              <div className="full">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Reason / Chief Complaint</label>
                <input className="input-f" placeholder="e.g. Fever, follow-up, routine checkup" value={form.reason} onChange={f("reason")}/>
              </div>
              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Status</label>
                <select className="input-f" value={form.status} onChange={f("status")}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Notes</label>
                <input className="input-f" placeholder="Optional notes..." value={form.notes} onChange={f("notes")}/>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-amber flex-1 justify-center" onClick={save} disabled={saving}>
                {saving?<><Spinner/> Saving...</>:modal==="add"?"Book Appointment":"Save Changes"}
              </button>
              <button className="btn-outline flex-1" style={{textAlign:"center"}} onClick={()=>setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: DAILY SCHEDULE
══════════════════════════════════════════════ */
function ScheduleSection() {
  const [date,    setDate]    = useState(today);
  const [appts,   setAppts]   = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedule = async (d) => {
    setLoading(true);
    try {
      const snap = await getDocs(query(
        collection(db,"appointments"),
        where("date","==",d),
        orderBy("time","asc")
      ));
      setAppts(snap.docs.map(doc=>({id:doc.id,...doc.data()})));
    } catch(e){
      // fallback without orderBy
      try {
        const snap = await getDocs(query(collection(db,"appointments"), where("date","==",d)));
        setAppts(snap.docs.map(doc=>({id:doc.id,...doc.data()})).sort((a,b)=>a.time?.localeCompare(b.time)));
      } catch(e2){ console.error(e2) }
    }
    setLoading(false);
  };

  useEffect(() => { fetchSchedule(date); }, [date]);

  const timeSlots = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

  const getApptForSlot = (slot) => appts.filter(a => a.time?.startsWith(slot.slice(0,2)));

  const statusColor = s => ({pending:"#f59e0b",confirmed:"#10b981",completed:"#3b82f6",cancelled:"#ef4444"}[s]??"#f59e0b");
  const statusBg    = s => ({pending:"#fffbeb",confirmed:"#f0fdf4",completed:"#eff6ff",cancelled:"#fef2f2"}[s]??"#fffbeb");

  return (
    <div>
      <div className="fu mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Daily Schedule</h2>
          <p className="text-gray-400 text-sm mt-0.5">View appointments by day in a timeline view.</p>
        </div>
        <input className="input-f max-w-[180px]" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
      </div>

      <div className="card fu d2">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-2xl">📅</div>
          <div>
            <p className="font-bold text-gray-800">{new Date(date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
            <p className="text-sm text-gray-400">{appts.length} appointment{appts.length!==1?"s":""} scheduled</p>
          </div>
        </div>

        {loading ? <div className="flex justify-center py-12"><Spinner size={28}/></div> : (
          <div className="space-y-2">
            {timeSlots.map(slot => {
              const slotAppts = getApptForSlot(slot);
              return (
                <div key={slot} className="flex gap-4 items-start">
                  <div className="w-16 text-right flex-shrink-0">
                    <span className="text-xs font-bold text-gray-400">{slot}</span>
                  </div>
                  <div className="flex-1 min-h-[44px] border-l-2 border-gray-100 pl-4 pb-2">
                    {slotAppts.length===0 ? (
                      <div className="h-8 flex items-center">
                        <div className="h-px flex-1 border-t border-dashed border-gray-200"/>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {slotAppts.map(a=>(
                          <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                            style={{background:statusBg(a.status),border:`1px solid ${statusColor(a.status)}22`}}>
                            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{background:statusColor(a.status)}}/>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm truncate">{a.patientName}</p>
                              <p className="text-xs text-gray-400 truncate">Dr. {a.doctorName||"—"} · {a.reason||"—"}</p>
                            </div>
                            <span className="text-xs font-bold" style={{color:statusColor(a.status)}}>
                              {a.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN RECEPTIONIST DASHBOARD
══════════════════════════════════════════════ */
const TABS = [
  { key:"overview",     icon:"🏠", label:"Overview"       },
  { key:"patients",     icon:"📋", label:"Patients"       },
  { key:"appointments", icon:"🗓️", label:"Appointments"   },
  { key:"schedule",     icon:"📅", label:"Daily Schedule" },
];

function ReceptionistDashboard({ userDetail, handleLogout }) {
  const [tab,    setTab]    = useState("overview");
  const [counts, setCounts] = useState({ appointments:0,todayAppt:0,patients:0,waiting:0,confirmed:0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [aSnap,pSnap] = await Promise.all([
          getDocs(collection(db,"appointments")),
          getDocs(collection(db,"patients")),
        ]);
        const appts     = aSnap.docs.map(d=>d.data());
        const todayAppt = appts.filter(a=>a.date===today).length;
        const waiting   = appts.filter(a=>a.status==="pending").length;
        const confirmed = appts.filter(a=>a.status==="confirmed").length;
        setCounts({ appointments:aSnap.size, todayAppt, patients:pSnap.size, waiting, confirmed });
      } catch(e){ console.error(e) }
    };
    load();
  }, [tab]);

  return (
    <>
      <style>{CSS}</style>
      <div className="rec-root flex min-h-screen bg-gray-50">

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
            <span className="text-xs font-bold px-3 py-0.5 rounded-full mt-1 text-white" style={{background:AC.color}}>🗃️ Receptionist</span>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3 mb-6">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow" style={{background:AC.color}}>
              {(userDetail?.name??userDetail?.email)?.[0]?.toUpperCase()??"R"}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-gray-800 text-sm truncate">{userDetail?.name??"Receptionist"}</p>
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
          {tab==="overview"     && <OverviewSection     userDetail={userDetail} counts={counts}/>}
          {tab==="patients"     && <PatientsSection/>}
          {tab==="appointments" && <AppointmentsSection/>}
          {tab==="schedule"     && <ScheduleSection/>}
        </main>
      </div>
    </>
  );
}

export default ReceptionistDashboard;