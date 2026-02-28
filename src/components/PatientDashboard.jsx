import DashboardLayout from "./DashboardLayout.jsx";

const accent = { color: "#3b82f6", light: "#eff6ff", dark: "#2563eb" };

const navItems = [
  { icon: "🏠", label: "Overview",         href: "#" },
  { icon: "🗓️", label: "My Appointments",  href: "#" },
  { icon: "💊", label: "My Prescriptions", href: "#" },
  { icon: "🔬", label: "Lab Results",      href: "#" },
  { icon: "📄", label: "Medical Records",  href: "#" },
  { icon: "👤", label: "My Profile",       href: "#" },
];

const stats = [
  { icon: "🗓️", label: "Upcoming Appointments", value: "—", color: "#3b82f6" },
  { icon: "💊", label: "Active Prescriptions",   value: "—", color: "#0d9488" },
  { icon: "🔬", label: "Lab Results",             value: "—", color: "#f59e0b" },
  { icon: "📄", label: "Medical Records",         value: "—", color: "#7c3aed" },
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

function PatientDashboard({ userDetail, handleLogout }) {
  return (
    <>
      <style>{styles}</style>
      <DashboardLayout
        userDetail={userDetail}
        handleLogout={handleLogout}
        accent={accent}
        navItems={navItems}
        roleLabel="Patient"
        roleIcon="🏥"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">Patient Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome, <span className="font-semibold text-blue-500">{userDetail?.name}</span>! Here's your health summary.
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
              <span>🏥</span> What You Can Access
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {["View your upcoming appointments","See your active prescriptions","Access your lab test results","Download medical records","Update personal profile & contact","Book a new appointment"].map(p => (
                <li key={p} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400 flex-shrink-0"/>
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
                { icon:"🗓️", label:"Book Appointment" },
                { icon:"💊", label:"Prescriptions" },
                { icon:"🔬", label:"Lab Results" },
                { icon:"👤", label:"My Profile" },
              ].map(a => (
                <button key={a.label} className="flex flex-col items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl py-4 text-sm transition">
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

export default PatientDashboard;
