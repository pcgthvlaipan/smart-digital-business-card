import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { supabase } from "../supabase/supabaseClient";
import InputField from "../components/InputField";
import Button from "../components/Button";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (signInError) throw signInError;
      navigate("/dashboard");
    } catch (err) {
      setError(mapSupabaseError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      <div
        className="hidden md:flex w-1/2 text-white flex-col justify-center px-16"
        style={{ background: "linear-gradient(160deg, #0B3D91 0%, #123F8C 55%, #0A3578 100%)" }}
      >
        <div className="flex items-center gap-2.5 mb-14">
          <svg width="38" height="38" viewBox="0 0 100 100" className="shrink-0">
            <rect x="0" y="0" width="100" height="100" rx="22" fill="#FFFFFF" />
            <g transform="rotate(-8 46 54)">
              <rect x="16" y="36" width="58" height="38" rx="7" fill="#0B3D91" />
              <rect x="16" y="57" width="58" height="9" rx="3" fill="#F97316" />
            </g>
            <path d="M 84 0 A 16 16 0 0 1 100 16" stroke="#F97316" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.95" />
            <path d="M 73 0 A 27 27 0 0 1 100 27" stroke="#F97316" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />
          </svg>
          <span className="font-bold text-lg tracking-tight">Smart Digital Card</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Welcome back</h1>
        <p className="text-lg text-white/70 max-w-md">
          Log in to manage your digital business card and share it with the world.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-[#0B3D91] mb-1">Log in</h2>
          <p className="text-sm text-muted mb-6">Welcome back, enter your details.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="Email"
              type="email"
              name="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              boxed
              icon={Mail}
              required
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              boxed
              icon={Lock}
              required
            />
            <Link
              to="/forgot-password"
              className="text-sm text-[#0B3D91] font-medium hover:underline self-end -mt-2"
            >
              Forgot password?
            </Link>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" variant="brand" className="w-full mt-2" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <p className="text-sm text-muted mt-6 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#0B3D91] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function mapSupabaseError(message) {
  if (!message) return "Something went wrong. Please try again.";
  if (message.includes("Invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (message.includes("Email not confirmed")) {
    return "Please confirm your email before logging in.";
  }
  return "Something went wrong. Please try again.";
}

export default LoginPage;
