import { useState } from "react";
import { Link } from "react-router-dom";
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
      <div className="hidden md:flex w-1/2 bg-navy text-white flex-col justify-center px-16">
        <h1 className="text-4xl font-bold mb-4">Forgot your password?</h1>
        <p className="text-lg text-white/70 max-w-md">
          Enter your email and we'll send you a link to reset it.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-navy mb-1">Reset password</h2>

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
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}

          <p className="text-sm text-muted mt-6 text-center">
            Remembered your password?{" "}
            <Link to="/login" className="text-navy font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
