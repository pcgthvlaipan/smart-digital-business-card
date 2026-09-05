import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import InputField from "../components/InputField";
import Button from "../components/Button";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [linkError, setLinkError] = useState(() => {
    const hash = window.location.hash;
    if (!hash.includes("error=")) return "";
    const params = new URLSearchParams(hash.slice(1));
    return (
      params.get("error_description")?.replace(/\+/g, " ") ||
      "This reset link is invalid or has expired."
    );
  });
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (linkError) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    const timeout = setTimeout(() => {
      setReady((current) => {
        if (!current) setLinkError("This reset link is invalid or has expired.");
        return current;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [linkError]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.password) {
      setError("Password is required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: form.password });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      <div className="hidden md:flex w-1/2 bg-navy text-white flex-col justify-center px-16">
        <h1 className="text-4xl font-bold mb-4">Set a new password</h1>
        <p className="text-lg text-white/70 max-w-md">
          Choose a new password to get back into your account.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-navy mb-1">Reset password</h2>

          {linkError ? (
            <>
              <p className="text-sm text-red-500 mt-4">{linkError}</p>
              <p className="text-sm text-muted mt-6 text-center">
                <Link to="/forgot-password" className="text-navy font-medium hover:underline">
                  Request a new reset link
                </Link>
              </p>
            </>
          ) : success ? (
            <p className="text-sm text-muted mt-4">
              Password updated. Redirecting you to your dashboard...
            </p>
          ) : !ready ? (
            <p className="text-sm text-muted mt-4">Verifying your reset link...</p>
          ) : (
            <>
              <p className="text-sm text-muted mb-6">Enter a new password for your account.</p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <InputField
                  label="New Password"
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                />
                <InputField
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
