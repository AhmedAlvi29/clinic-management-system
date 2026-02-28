import { useState, useEffect, useRef } from "react";
import { db } from "../firebase.jsx";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp
} from "firebase/firestore";
import Swal from "sweetalert2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

/* ─── accent ─────────────────────────────────────── */
const A = { color: "#7c3aed", light: "#f5f3ff", dark: "#6d28d9" };

/* ─── global styles ──────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.adm * { font-family:'Plus Jakarta Sans',sans-serif; }

@keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes slideIn  { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
@keyframes scaleIn  { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
@keyframes spinAnim { to{transform:rotate(360deg)} }

.fu  { animation:fadeUp  .5s cubic-bezier(.22,1,.36,1) both }
.fi  { animation:fadeIn  .4s ease both }
.si  { animation:slideIn .5s cubic-bezier(.22,1,.36,1) both }
.sci { animation:scaleIn .4s cubic-bezier(.22,1,.36,1) both }
.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
.d4{animation-delay:.2s}.d5{animation-delay:.25s}.d6{animation-delay:.3s}

.spin { animation:spinAnim .8s linear infinite }

.nav-item {
  display:flex;align-items:center;gap:10px;padding:10px 14px;
  border-radius:10px;font-weight:600;font-size:.85rem;color:#64748b;
  cursor:pointer;transition:all .2s;border:none;background:none;width:100%;text-align:left;
}
.nav-item:hover { background:#f5f3ff;color:#7c3aed;transform:translateX(3px) }
.nav-item.active { background:#f5f3ff;color:#7c3aed }

.card {
  background:#fff;border-radius:18px;border:1px solid #f1f5f9;
  box-shadow:0 2px 12px rgba(0,0,0,.05);padding:24px;
}
.card:hover { box-shadow:0 6px 24px rgba(124,58,237,.08) }

.btn-primary {
  background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;
  border:none;border-radius:10px;padding:9px 18px;font-weight:700;
  font-size:.85rem;cursor:pointer;transition:all .2s;
}
.btn-primary:hover { transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,58,237,.35) }

.btn-danger {
  background:#fff;color:#ef4444;border:1.5px solid #fecaca;
  border-radius:10px;padding:7px 14px;font-weight:600;font-size:.82rem;cursor:pointer;transition:all .2s;
}
.btn-danger:hover { background:#fef2f2 }

.btn-edit {
  background:#fff;color:#7c3aed;border:1.5px solid #e9d5ff;
  border-radius:10px;padding:7px 14px;font-weight:600;font-size:.82rem;cursor:pointer;transition:all .2s;
}
.btn-edit:hover { background:#f5f3ff }

.input-f {
  width:100%;border:1.5px solid #e2e8f0;border-radius:10px;
  padding:10px 14px;font-size:.9rem;outline:none;transition:all .2s;
  font-family:'Plus Jakarta Sans',sans-serif;
}
.input-f:focus { border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.12) }

.badge {
  display:inline-block;padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:700;
}
.badge-active  { background:#dcfce7;color:#16a34a }
.badge-inactive{ background:#fee2e2;color:#dc2626 }
.badge-basic   { background:#e0f2fe;color:#0369a1 }
.badge-pro     { background:#fef3c7;color:#d97706 }
.badge-enterprise{ background:#f3e8ff;color:#7c3aed }

.modal-overlay {
  position:fixed;inset:0;background:rgba(0,0,0,.45);
  display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px);
}
.modal-box {
  background:#fff;border-radius:20px;padding:32px;width:100%;max-width:460px;
  box-shadow:0 24px 64px rgba(0,0,0,.15);animation:scaleIn .3s cubic-bezier(.22,1,.36,1) both;
}

table { width:100%;border-collapse:collapse }
th { background:#fafafa;color:#64748b;font-size:.78rem;font-weight:700;
     text-transform:uppercase;letter-spacing:.05em;padding:12px 14px;text-align:left }
td { padding:13px 14px;border-top:1px solid #f1f5f9;font-size:.87rem;color:#374151 }
tr:hover td { background:#fafafa }

.stat-card {
  border-radius:18px;padding:22px;display:flex;align-items:center;gap:16px;
  border:1px solid transparent;transition:all .25s;cursor:default;
}
.stat-card:hover { transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.09) }

.tab-btn {
  padding:9px 20px;border-radius:9px;font-weight:700;font-size:.85rem;
  border:none;cursor:pointer;transition:all .2s;
}
.tab-btn.on  { background:#7c3aed;color:#fff;box-shadow:0 4px 14px rgba(124,58,237,.3) }
.tab-btn.off { background:#f8fafc;color:#64748b }
.tab-btn.off:hover { background:#f5f3ff;color:#7c3aed }

::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
`;

/* ─── helpers ─────────────────────────────────────── */
const Spinner = () => (
  <svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#7c3aed" strokeWidth="3" opacity=".25"/>
    <path d="M4 12a8 8 0 018-8" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

/* ─── SECTION: Overview ───────────────────────────── */
function OverviewSection({ counts, userDetail }) {
  const barRef  = useRef(null);
  const doughRef= useRef(null);
  const lineRef = useRef(null);
  const barChart= useRef(null);
  const doughChart=useRef(null);
  const lineChart =useRef(null);

  useEffect(() => {
    // Bar chart — doctors / receptionists / patients
    if (barRef.current) {
      if (barChart.current) barChart.current.destroy();
      barChart.current = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels: ["Doctors","Receptionists","Patients","Appointments"],
          datasets:[{
            label:"Total",
            data:[counts.doctors, counts.receptionists, counts.patients, counts.appointments],
            backgroundColor:["#7c3aed","#0d9488","#3b82f6","#f59e0b"],
            borderRadius:8, borderSkipped:false,
          }]
        },
        options:{
          responsive:true, plugins:{legend:{display:false},
          tooltip:{callbacks:{label:c=>" "+c.raw}}},
          scales:{y:{beginAtZero:true,grid:{color:"#f1f5f9"},ticks:{color:"#94a3b8"}},
                  x:{grid:{display:false},ticks:{color:"#94a3b8"}}}
        }
      });
    }
    // Doughnut — role distribution
    if (doughRef.current) {
      if (doughChart.current) doughChart.current.destroy();
      doughChart.current = new Chart(doughRef.current, {
        type:"doughnut",
        data:{
          labels:["Doctors","Receptionists","Patients"],
          datasets:[{
            data:[counts.doctors, counts.receptionists, counts.patients],
            backgroundColor:["#7c3aed","#0d9488","#3b82f6"],
            borderWidth:0, hoverOffset:6,
          }]
        },
        options:{
          responsive:true, cutout:"70%",
          plugins:{legend:{position:"bottom",labels:{font:{size:12},padding:14,color:"#64748b"}}}
        }
      });
    }
    // Line chart — simulated monthly appointments
    if (lineRef.current) {
      if (lineChart.current) lineChart.current.destroy();
      const base = counts.appointments || 10;
      lineChart.current = new Chart(lineRef.current, {
        type:"line",
        data:{
          labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
          datasets:[{
            label:"Appointments",
            data:[
              Math.round(base*.4),Math.round(base*.55),Math.round(base*.6),
              Math.round(base*.7),Math.round(base*.75),Math.round(base*.9),
              Math.round(base*.85),Math.round(base*.95),base,
              Math.round(base*1.1),Math.round(base*1.15),Math.round(base*1.2)
            ],
            borderColor:"#7c3aed",backgroundColor:"rgba(124,58,237,.08)",
            tension:.4, fill:true, pointRadius:4,
            pointBackgroundColor:"#7c3aed", pointBorderColor:"#fff", pointBorderWidth:2,
          }]
        },
        options:{
          responsive:true,
          plugins:{legend:{display:false}},
          scales:{y:{beginAtZero:true,grid:{color:"#f1f5f9"},ticks:{color:"#94a3b8"}},
                  x:{grid:{display:false},ticks:{color:"#94a3b8"}}}
        }
      });
    }
    return () => {
      barChart.current?.destroy();
      doughChart.current?.destroy();
      lineChart.current?.destroy();
    };
  }, [counts]);

  const stats = [
    { icon:"🩺", label:"Total Doctors",       value:counts.doctors,       bg:"#f5f3ff", ic:"#7c3aed" },
    { icon:"🗃️", label:"Receptionists",       value:counts.receptionists, bg:"#f0fdfa", ic:"#0d9488" },
    { icon:"🏥", label:"Patients",             value:counts.patients,      bg:"#eff6ff", ic:"#3b82f6" },
    { icon:"🗓️", label:"Appointments",         value:counts.appointments,  bg:"#fffbeb", ic:"#f59e0b" },
  ];

  return (
    <div>
      <div className="mb-8 fu">
        <h1 className="text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, <span className="font-bold text-purple-600">{userDetail?.name ?? userDetail?.email}</span>! Here's your clinic at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s,i)=>(
          <div key={s.label} className={`stat-card fu d${i+1}`} style={{background:s.bg,border:`1px solid ${s.ic}18`}}>
            <div className="text-3xl p-3 rounded-xl bg-white shadow-sm">{s.icon}</div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-3xl font-extrabold" style={{color:s.ic}}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card lg:col-span-2 fu d2">
          <h3 className="font-bold text-gray-700 mb-4">📊 Staff & Patient Overview</h3>
          <canvas ref={barRef} height="120"/>
        </div>
        <div className="card fu d3">
          <h3 className="font-bold text-gray-700 mb-4">🍩 Role Distribution</h3>
          <canvas ref={doughRef}/>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="card fu d4">
        <h3 className="font-bold text-gray-700 mb-4">📈 Monthly Appointments Trend</h3>
        <canvas ref={lineRef} height="90"/>
      </div>
    </div>
  );
}

/* ─── SECTION: Manage Doctors / Receptionists ─────── */
function ManageUsersSection({ role }) {
  const collectionName = role === "doctor" ? "doctors" : "receptionists";
  const label          = role === "doctor" ? "Doctor"   : "Receptionist";
  const color          = role === "doctor" ? "#7c3aed"  : "#0d9488";
  const colorLight     = role === "doctor" ? "#f5f3ff"  : "#f0fdfa";

  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // null | "add" | {edit doc}
  const [form,    setForm]    = useState({ name:"", email:"", phone:"", specialization:"", status:"active" });
  const [saving,  setSaving]  = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, collectionName), orderBy("createdAt","desc")));
      setList(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch(e){ console.error(e) }
    setLoading(false);
  };

  useEffect(() => { fetchList(); }, [collectionName]);

  const openAdd  = () => { setForm({ name:"", email:"", phone:"", specialization:"", status:"active" }); setModal("add"); };
  const openEdit = (item) => { setForm({ name:item.name||"", email:item.email||"", phone:item.phone||"", specialization:item.specialization||"", status:item.status||"active" }); setModal(item); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      Swal.fire({ title:"Required", text:"Name and Email are required.", icon:"warning", confirmButtonColor:color }); return;
    }
    setSaving(true);
    try {
      if (modal === "add") {
        await addDoc(collection(db, collectionName), { ...form, createdAt: serverTimestamp() });
        Swal.fire({ title:"Added!", text:`${label} added successfully.`, icon:"success", confirmButtonColor:color, timer:1800, showConfirmButton:false });
      } else {
        await updateDoc(doc(db, collectionName, modal.id), { ...form });
        Swal.fire({ title:"Updated!", text:`${label} updated.`, icon:"success", confirmButtonColor:color, timer:1800, showConfirmButton:false });
      }
      setModal(null);
      fetchList();
    } catch(e){
      Swal.fire({ title:"Error", text:e.message, icon:"error", confirmButtonColor:color });
    }
    setSaving(false);
  };

  const handleDelete = async (item) => {
    const res = await Swal.fire({
      title:`Delete ${label}?`,
      text:`"${item.name}" will be permanently removed.`,
      icon:"warning", showCancelButton:true,
      confirmButtonText:"Yes, delete", confirmButtonColor:"#ef4444", cancelButtonText:"Cancel",
    });
    if (!res.isConfirmed) return;
    await deleteDoc(doc(db, collectionName, item.id));
    Swal.fire({ title:"Deleted!", icon:"success", confirmButtonColor:color, timer:1500, showConfirmButton:false });
    fetchList();
  };

  return (
    <div>
      <div className="fu flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Manage {label}s</h2>
          <p className="text-gray-400 text-sm mt-0.5">Add, edit or remove {label.toLowerCase()}s from the system.</p>
        </div>
        <button className="btn-primary" style={{background:`linear-gradient(135deg,${color},${color}cc)`}} onClick={openAdd}>
          ＋ Add {label}
        </button>
      </div>

      <div className="card fu d2 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner/></div>
        ) : list.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">🗂️</div>
            <p className="text-gray-400 font-semibold">No {label.toLowerCase()}s added yet.</p>
            <button className="btn-primary mt-4" onClick={openAdd}>Add First {label}</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Email</th><th>Phone</th>
                {role==="doctor" && <th>Specialization</th>}
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item,i)=>(
                <tr key={item.id}>
                  <td className="text-gray-400 font-mono text-xs">{i+1}</td>
                  <td className="font-semibold text-gray-800">{item.name}</td>
                  <td className="text-gray-500">{item.email}</td>
                  <td className="text-gray-500">{item.phone || "—"}</td>
                  {role==="doctor" && <td className="text-gray-500">{item.specialization || "—"}</td>}
                  <td>
                    <span className={`badge badge-${item.status==="active"?"active":"inactive"}`}>
                      {item.status || "active"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-edit" onClick={()=>openEdit(item)}>✏️ Edit</button>
                      <button className="btn-danger" onClick={()=>handleDelete(item)}>🗑️ Delete</button>
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
            <h3 className="text-xl font-extrabold text-gray-800 mb-5">
              {modal==="add" ? `Add ${label}` : `Edit ${label}`}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name *</label>
                <input className="input-f" placeholder="e.g. Dr. Ahmed Ali" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email *</label>
                <input className="input-f" type="email" placeholder="email@clinic.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                <input className="input-f" placeholder="+92 300 0000000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
              </div>
              {role==="doctor" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Specialization</label>
                  <input className="input-f" placeholder="e.g. Cardiologist" value={form.specialization} onChange={e=>setForm({...form,specialization:e.target.value})}/>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                <select className="input-f" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                style={{background:`linear-gradient(135deg,${color},${color}cc)`}}
                onClick={handleSave} disabled={saving}
              >
                {saving ? <><Spinner/> Saving...</> : (modal==="add" ? `Add ${label}` : "Update")}
              </button>
              <button className="btn-edit flex-1" onClick={()=>setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SECTION: Subscription Plans ────────────────── */
const PLANS = [
  { key:"basic",      label:"Basic",      price:"PKR 2,000/mo",  color:"#0369a1", bg:"#e0f2fe",
    features:["Up to 2 Doctors","Up to 1 Receptionist","50 Patients/mo","Basic Reports","Email Support"] },
  { key:"pro",        label:"Pro",        price:"PKR 5,500/mo",  color:"#d97706", bg:"#fef3c7",
    features:["Up to 10 Doctors","Up to 5 Receptionists","500 Patients/mo","Advanced Analytics","Priority Support","SMS Notifications"] },
  { key:"enterprise", label:"Enterprise", price:"PKR 12,000/mo", color:"#7c3aed", bg:"#f3e8ff",
    features:["Unlimited Doctors","Unlimited Receptionists","Unlimited Patients","Custom Reports","24/7 Dedicated Support","API Access","Custom Branding"] },
];

function SubscriptionSection() {
  const [active, setActive] = useState("pro");

  const handleSelect = (key) => {
    Swal.fire({
      title:`Activate ${PLANS.find(p=>p.key===key).label} Plan?`,
      text:"This is a simulation. No actual payment will be made.",
      icon:"info", showCancelButton:true,
      confirmButtonText:"Activate", confirmButtonColor:"#7c3aed",
    }).then(r=>{ if(r.isConfirmed){ setActive(key); Swal.fire({ title:"Plan Activated!", icon:"success", confirmButtonColor:"#7c3aed", timer:1800, showConfirmButton:false }) }});
  };

  return (
    <div>
      <div className="fu mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">Subscription Plans</h2>
        <p className="text-gray-400 text-sm mt-0.5">Manage your clinic's subscription. (Simulation mode)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((p,i)=>(
          <div key={p.key} className={`fu d${i+1} card relative overflow-hidden transition-all`}
            style={{ border: active===p.key ? `2px solid ${p.color}` : "1px solid #f1f5f9",
                     boxShadow: active===p.key ? `0 8px 30px ${p.color}22` : "" }}>
            {active===p.key && (
              <div className="absolute top-3 right-3 badge" style={{background:p.bg,color:p.color}}>✓ Active</div>
            )}
            <div className="mb-4">
              <span className="badge" style={{background:p.bg,color:p.color}}>{p.label}</span>
              <p className="text-2xl font-extrabold text-gray-800 mt-2">{p.price}</p>
            </div>
            <ul className="space-y-2 mb-6">
              {p.features.map(f=>(
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span style={{color:p.color}}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              className="w-full btn-primary"
              style={{ background: active===p.key ? "#94a3b8" : `linear-gradient(135deg,${p.color},${p.color}cc)`,
                       cursor: active===p.key ? "default" : "pointer" }}
              onClick={()=>{ if(active!==p.key) handleSelect(p.key) }}
              disabled={active===p.key}
            >
              {active===p.key ? "Current Plan" : `Select ${p.label}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SECTION: System Usage ───────────────────────── */
function SystemUsageSection({ counts }) {
  const usageRef  = useRef(null);
  const usageChart= useRef(null);

  useEffect(()=>{
    if (!usageRef.current) return;
    if (usageChart.current) usageChart.current.destroy();
    usageChart.current = new Chart(usageRef.current, {
      type:"bar",
      data:{
        labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        datasets:[{
          label:"Logins",
          data:[12,18,15,22,19,8,5],
          backgroundColor:"rgba(124,58,237,.7)",
          borderRadius:8, borderSkipped:false,
        },{
          label:"Actions",
          data:[35,52,41,60,55,20,12],
          backgroundColor:"rgba(13,148,136,.6)",
          borderRadius:8, borderSkipped:false,
        }]
      },
      options:{
        responsive:true,
        plugins:{legend:{labels:{color:"#64748b",font:{size:12}}}},
        scales:{y:{beginAtZero:true,grid:{color:"#f1f5f9"},ticks:{color:"#94a3b8"}},
                x:{grid:{display:false},ticks:{color:"#94a3b8"}}}
      }
    });
    return ()=>{ usageChart.current?.destroy() };
  },[]);

  const metrics = [
    { icon:"🖥️", label:"Server Status",    value:"Online",   badge:"badge-active" },
    { icon:"💾", label:"Database",          value:"Connected",badge:"badge-active" },
    { icon:"📡", label:"Firebase Auth",     value:"Active",   badge:"badge-active" },
    { icon:"🔒", label:"Security Rules",    value:"Enabled",  badge:"badge-active" },
  ];

  return (
    <div>
      <div className="fu mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">System Usage</h2>
        <p className="text-gray-400 text-sm mt-0.5">Monitor system health and activity.</p>
      </div>

      {/* Status badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m,i)=>(
          <div key={m.label} className={`card fu d${i+1} flex items-center gap-3`}>
            <span className="text-2xl">{m.icon}</span>
            <div>
              <p className="text-xs text-gray-400 font-semibold">{m.label}</p>
              <span className={`badge ${m.badge}`}>{m.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Usage stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label:"Total Records", value: counts.doctors + counts.receptionists + counts.patients, icon:"📋", color:"#7c3aed" },
          { label:"Registered Users", value: counts.doctors + counts.receptionists + counts.patients + 1, icon:"👥", color:"#0d9488" },
          { label:"Active Sessions", value:"3", icon:"🟢", color:"#f59e0b" },
        ].map((s,i)=>(
          <div key={s.label} className={`card fu d${i+1} flex items-center gap-4`}>
            <div className="text-3xl p-3 rounded-xl" style={{background:s.color+"18"}}>{s.icon}</div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-extrabold" style={{color:s.color}}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly activity chart */}
      <div className="card fu d4">
        <h3 className="font-bold text-gray-700 mb-4">📊 Weekly Activity (Simulated)</h3>
        <canvas ref={usageRef} height="100"/>
      </div>
    </div>
  );
}

/* ─── SECTION: Analytics ──────────────────────────── */
function AnalyticsSection({ counts }) {
  const radarRef  = useRef(null);
  const polarRef  = useRef(null);
  const radarChart= useRef(null);
  const polarChart= useRef(null);

  useEffect(()=>{
    if (radarRef.current){
      if (radarChart.current) radarChart.current.destroy();
      radarChart.current = new Chart(radarRef.current,{
        type:"radar",
        data:{
          labels:["Doctors","Receptionists","Patients","Appointments","Prescriptions","Lab Tests"],
          datasets:[{
            label:"Clinic Stats",
            data:[counts.doctors,counts.receptionists,counts.patients,counts.appointments,
                  Math.round(counts.appointments*.6), Math.round(counts.appointments*.4)],
            borderColor:"#7c3aed",backgroundColor:"rgba(124,58,237,.15)",
            pointBackgroundColor:"#7c3aed",pointRadius:5,
          }]
        },
        options:{ responsive:true, scales:{ r:{ grid:{color:"#f1f5f9"}, ticks:{display:false} }},
                  plugins:{legend:{display:false}} }
      });
    }
    if (polarRef.current){
      if (polarChart.current) polarChart.current.destroy();
      polarChart.current = new Chart(polarRef.current,{
        type:"polarArea",
        data:{
          labels:["Doctors","Receptionists","Patients","Appointments"],
          datasets:[{
            data:[counts.doctors,counts.receptionists,counts.patients,counts.appointments],
            backgroundColor:["rgba(124,58,237,.7)","rgba(13,148,136,.7)","rgba(59,130,246,.7)","rgba(245,158,11,.7)"],
          }]
        },
        options:{ responsive:true, plugins:{legend:{position:"bottom",labels:{color:"#64748b",font:{size:12}}}} }
      });
    }
    return ()=>{ radarChart.current?.destroy(); polarChart.current?.destroy() };
  },[counts]);

  return (
    <div>
      <div className="fu mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">Analytics</h2>
        <p className="text-gray-400 text-sm mt-0.5">Deep insights into clinic performance.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card fu d1">
          <h3 className="font-bold text-gray-700 mb-4">🕸️ Clinic Radar Overview</h3>
          <canvas ref={radarRef}/>
        </div>
        <div className="card fu d2">
          <h3 className="font-bold text-gray-700 mb-4">🌈 Polar Distribution</h3>
          <canvas ref={polarRef}/>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────── */
function AdminDashboard({ userDetail, handleLogout }) {
  const [tab,    setTab]    = useState("overview");
  const [counts, setCounts] = useState({ doctors:0, receptionists:0, patients:0, appointments:0 });

  useEffect(()=>{
    const fetchCounts = async () => {
      try {
        const [d,r,p,a] = await Promise.all([
          getDocs(collection(db,"doctors")),
          getDocs(collection(db,"receptionists")),
          getDocs(collection(db,"patients")),
          getDocs(collection(db,"appointments")),
        ]);
        setCounts({ doctors:d.size, receptionists:r.size, patients:p.size, appointments:a.size });
      } catch(e){ console.error(e) }
    };
    fetchCounts();
  },[tab]); // refresh counts when switching tabs

  const TABS = [
    { key:"overview",      icon:"🏠", label:"Overview"      },
    { key:"doctors",       icon:"🩺", label:"Doctors"       },
    { key:"receptionists", icon:"🗃️", label:"Receptionists" },
    { key:"analytics",     icon:"📊", label:"Analytics"     },
    { key:"subscription",  icon:"💳", label:"Subscription"  },
    { key:"system",        icon:"🖥️", label:"System Usage"  },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="adm flex min-h-screen bg-gray-50">

        {/* ── Sidebar ── */}
        <aside className="si w-64 flex-shrink-0 bg-white border-r border-gray-100 shadow-sm flex flex-col py-6 px-4">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-full p-3 mb-2 shadow" style={{background:A.color}}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 2h2v7h7v2h-7v7h-2v-7H4v-2h7z"/>
              </svg>
            </div>
            <span className="text-lg font-extrabold text-gray-800 tracking-tight">MediCare</span>
            <span className="text-xs font-bold px-3 py-0.5 rounded-full mt-1 text-white" style={{background:A.color}}>
              🛡️ Admin
            </span>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3 mb-6">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow" style={{background:A.color}}>
              {userDetail?.name?.[0]?.toUpperCase() ?? userDetail?.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-gray-800 text-sm truncate">{userDetail?.name ?? "Admin"}</p>
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

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 w-full px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition hover:opacity-90"
            style={{background:A.color}}
          >
            🚪 Logout
          </button>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 px-8 py-10 overflow-y-auto">
          {tab==="overview"      && <OverviewSection      counts={counts} userDetail={userDetail} />}
          {tab==="doctors"       && <ManageUsersSection   role="doctor" />}
          {tab==="receptionists" && <ManageUsersSection   role="receptionist" />}
          {tab==="analytics"     && <AnalyticsSection     counts={counts} />}
          {tab==="subscription"  && <SubscriptionSection  />}
          {tab==="system"        && <SystemUsageSection   counts={counts} />}
        </main>
      </div>
    </>
  );
}

export default AdminDashboard;