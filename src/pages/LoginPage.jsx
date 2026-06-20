import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
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
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(mapFirebaseError(err.code));
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

function mapFirebaseError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default LoginPage;
