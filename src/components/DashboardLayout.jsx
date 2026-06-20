import Navbar from "./Navbar";

function DashboardLayout({ user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

export default DashboardLayout;
