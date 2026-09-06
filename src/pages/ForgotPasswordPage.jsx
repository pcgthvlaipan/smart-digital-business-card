import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { supabase } from "../supabase/supabaseClient";
import InputField from "../components/InputField";
import Button from "../components/Button";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
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
          <svg width="56" height="56" viewBox="0 0 100 100" className="shrink-0">
            <rect x="0" y="0" width="100" height="100" rx="22" fill="#FFFFFF" />
            <g transform="rotate(-8 46 54)">
              <rect x="16" y="36" width="58" height="38" rx="7" fill="#0B3D91" />
              <rect x="16" y="57" width="58" height="9" rx="3" fill="#F97316" />
            </g>
            <path d="M 84 0 A 16 16 0 0 1 100 16" stroke="#F97316" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.95" />
            <path d="M 73 0 A 27 27 0 0 1 100 27" stroke="#F97316" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />
          </svg>
          <span className="font-bold text-xl tracking-tight">Smart Digital Card</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Forgot your password?</h1>
        <p className="text-lg text-white/70 max-w-md">
          Enter your email and we'll send you a link to reset it.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-[#0B3D91] mb-1">Reset password</h2>

          {sent ? (
            <p className="text-sm text-muted mt-4">
              If an account exists for <span className="font-medium text-ink">{email}</span>,
              we've sent a password reset link to it. Check your inbox.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted mb-6">
                We'll email you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  boxed
                  icon={Mail}
                  required
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" variant="brand" className="w-full mt-2" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}

          <p className="text-sm text-muted mt-6 text-center">
            Remembered your password?{" "}
            <Link to="/login" className="text-[#0B3D91] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
