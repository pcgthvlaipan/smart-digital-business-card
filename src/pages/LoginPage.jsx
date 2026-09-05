import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      <div className="hidden md:flex w-1/2 bg-navy text-white flex-col justify-center px-16">
        <h1 className="text-4xl font-bold mb-4">Welcome back</h1>
        <p className="text-lg text-white/70 max-w-md">
          Log in to manage your digital business card and share it with the world.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-navy mb-1">Log in</h2>
          <p className="text-sm text-muted mb-6">Welcome back, enter your details.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="Email"
              type="email"
              name="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <p className="text-sm text-muted mt-6 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-navy font-medium hover:underline">
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
