import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import InputField from "../components/InputField";
import Button from "../components/Button";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
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
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left: Branding panel */}
      <div className="hidden md:flex w-1/2 bg-navy text-white flex-col justify-center px-16">
        <h1 className="text-4xl font-bold mb-4">Smart Digital Business Card</h1>
        <p className="text-lg text-white/70 max-w-md">
          Create a premium digital profile you can share instantly with a link or QR code.
        </p>
      </div>

      {/* Right: Form panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-navy mb-1">Create your account</h2>
          <p className="text-sm text-muted mb-6">Get started in less than a minute.</p>

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
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
            />
            <InputField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-sm text-muted mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-navy font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function mapFirebaseError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default RegisterPage;
