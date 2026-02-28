import DashboardLayout from "./DashboardLayout.jsx";

const accent = { color: "#f59e0b", light: "#fffbeb", dark: "#d97706" };

const navItems = [
  { icon: "🏠", label: "Overview",          href: "#" },
  { icon: "🗓️", label: "Appointments",      href: "#" },
  { icon: "📋", label: "Patients",          href: "#" },
  { icon: "➕", label: "Register Patient",  href: "#" },
  { icon: "📞", label: "Contacts",          href: "#" },
  { icon: "💳", label: "Billing",           href: "#" },
];

const stats = [
  { icon: "🗓️", label: "Today's Appointments", value: "—", color: "#f59e0b" },
  { icon: "📋", label: "Registered Patients",   value: "—", color: "#0d9488" },
  { icon: "⏳", label: "Waiting Room",           value: "—", color: "#3b82f6" },
  { icon: "💳", label: "Pending Billing",        value: "—", color: "#ef4444" },
];

const styles = `
  @keyframes cardIn {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .card-in { animation: cardIn 0.5s cubic-bezier(.22,1,.36,1) both; }
  .d1{animation-delay:.05s} .d2{animation-delay:.12s} .d3{animation-delay:.19s} .d4{animation-delay:.26s}
`;

function StatCard({ icon, label, value, color, delay }) {
  return (
    <div className={`card-in ${delay} bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow`}>
      <div className="text-3xl p-3 rounded-xl" style={{ background: color + "18" }}>{icon}</div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function ReceptionistDashboard({ userDetail, handleLogout }) {
  return (
    <>
      <style>{styles}</style>
      <DashboardLayout
        userDetail={userDetail}
        handleLogout={handleLogout}
        accent={accent}
        navItems={navItems}
        roleLabel="Receptionist"
        roleIcon="🗃️"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">Receptionist Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Hello, <span className="font-semibold text-amber-500">{userDetail?.name}</span>! Manage today's appointments and patients.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={`d${i+1}`} />
          ))}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-in d1">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span>🗃️</span> Receptionist Permissions
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {["Book & manage appointments","Register new patients","Update patient contact info","Manage waiting room queue","Process billing & invoices","Notify doctors of arrivals"].map(p => (
                <li key={p} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 flex-shrink-0"/>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-in d2">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span>⚡</span> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon:"➕", label:"New Appointment" },
                { icon:"👤", label:"Register Patient" },
                { icon:"⏳", label:"Waiting Room" },
                { icon:"💳", label:"Billing" },
              ].map(a => (
                <button key={a.label} className="flex flex-col items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl py-4 text-sm transition">
                  <span className="text-2xl">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

export default ReceptionistDashboard;
