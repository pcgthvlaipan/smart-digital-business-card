import Navbar from "./Navbar";
import VersionFooter from "./VersionFooter";

function DashboardLayout({ user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      <footer className="max-w-6xl mx-auto px-6 pb-6 text-center">
        <VersionFooter />
      </footer>
    </div>
  );
}

export default DashboardLayout;
