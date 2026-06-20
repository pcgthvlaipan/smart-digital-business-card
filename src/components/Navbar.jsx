import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="w-full border-b border-border bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-navy">
          Smart Digital Card
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-ink hover:text-navy text-sm font-medium">
                Dashboard
              </Link>
              <button
                onClick={() => {
                  onLogout?.();
                  navigate("/");
                }}
                className="text-sm font-medium text-muted hover:text-navy"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink hover:text-navy">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-navy-light transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
