// Shared layout wrapper used by all role dashboards
// Props: userDetail, handleLogout, accentColor, navItems, children

const styles = `
  @keyframes slideIn {
    from { opacity:0; transform:translateX(-20px); }
    to   { opacity:1; transform:translateX(0); }
  }
  .sidebar-anim { animation: slideIn 0.5s cubic-bezier(.22,1,.36,1) both; }
  @keyframes contentIn {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .content-anim { animation: contentIn 0.6s cubic-bezier(.22,1,.36,1) 0.15s both; }

  .nav-link {
    display:flex; align-items:center; gap:10px;
    padding:10px 14px; border-radius:10px;
    font-weight:600; font-size:0.875rem;
    color:#64748b; cursor:pointer;
    transition: background 0.2s, color 0.2s, transform 0.15s;
    text-decoration:none;
  }
  .nav-link:hover {
    background: var(--accent-light);
    color: var(--accent);
    transform: translateX(3px);
  }
  .nav-link.active {
    background: var(--accent-light);
    color: var(--accent);
  }
`;

function DashboardLayout({ userDetail, handleLogout, accent, navItems, roleLabel, roleIcon, children }) {
  // accent: { color, light, dark }  e.g. { color:'#14b8a6', light:'#f0fdfa', dark:'#0d9488' }
  return (
    <>
      <style>{styles}</style>
      <div
        className="flex min-h-screen bg-gray-50"
        style={{ '--accent': accent.color, '--accent-light': accent.light, '--accent-dark': accent.dark }}
      >
        {/* ── Sidebar ── */}
        <aside className="sidebar-anim w-64 flex-shrink-0 bg-white border-r border-gray-100 shadow-sm flex flex-col py-6 px-4">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-full p-3 mb-2 shadow" style={{ background: accent.color }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 2h2v7h7v2h-7v7h-2v-7H4v-2h7z"/>
              </svg>
            </div>
            <span className="text-lg font-extrabold text-gray-800 tracking-tight">MediCare</span>
            <span className="text-xs font-semibold px-3 py-0.5 rounded-full mt-1 text-white" style={{ background: accent.color }}>
              {roleIcon} {roleLabel}
            </span>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3 mb-6">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow" style={{ background: accent.color }}>
              {userDetail?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-gray-800 text-sm truncate">{userDetail?.name ?? "User"}</p>
              <p className="text-xs text-gray-400 truncate">{userDetail?.email}</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => (
              <a key={item.label} href={item.href ?? "#"} className="nav-link">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 w-full px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:shadow-md"
            style={{ background: accent.color }}
          >
            <span>🚪</span> Logout
          </button>
        </aside>

        {/* ── Main ── */}
        <main className="content-anim flex-1 px-8 py-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}

export default DashboardLayout;
