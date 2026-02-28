import DashboardLayout from "./DashboardLayout.jsx";

const accent = { color: "#0d9488", light: "#f0fdfa", dark: "#0f766e" };

const navItems = [
  { icon: "🏠", label: "Overview",         href: "#" },
  { icon: "🗓️", label: "My Appointments",  href: "#" },
  { icon: "📋", label: "My Patients",      href: "#" },
  { icon: "📝", label: "Prescriptions",    href: "#" },
  { icon: "🔬", label: "Lab Results",      href: "#" },
  { icon: "📅", label: "Schedule",         href: "#" },
];

const stats = [
  { icon: "🗓️", label: "Today's Appointments", value: "—", color: "#0d9488" },
  { icon: "📋", label: "My Patients",           value: "—", color: "#3b82f6" },
  { icon: "📝", label: "Prescriptions",         value: "—", color: "#f59e0b" },
  { icon: "🔬", label: "Pending Lab Results",   value: "—", color: "#ef4444" },
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

function DoctorDashboard({ userDetail, handleLogout }) {
  return (
    <>
      <style>{styles}</style>
      <DashboardLayout
        userDetail={userDetail}
        handleLogout={handleLogout}
        accent={accent}
        navItems={navItems}
        roleLabel="Doctor"
        roleIcon="🩺"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">Doctor Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Good day, <span className="font-semibold text-teal-600">Dr. {userDetail?.name}</span>! Here's your daily overview.
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
              <span>🩺</span> Doctor Permissions
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {["View your assigned appointments","Access patient medical records","Write & manage prescriptions","Order lab tests","View lab results","Update patient visit notes"].map(p => (
                <li key={p} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-400 flex-shrink-0"/>
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
                { icon:"🗓️", label:"View Schedule" },
                { icon:"📋", label:"Patient List" },
                { icon:"📝", label:"New Prescription" },
                { icon:"🔬", label:"Lab Orders" },
              ].map(a => (
                <button key={a.label} className="flex flex-col items-center justify-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-xl py-4 text-sm transition">
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

export default DoctorDashboard;
