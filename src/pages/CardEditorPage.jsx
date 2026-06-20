import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../firebase/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import InputField from "../components/InputField";
import Button from "../components/Button";
import ImageUploader from "../components/ImageUploader";
import { compressImage } from "../utils/compressImage";
import { isValidUrl, isValidEmail } from "../utils/formatLinks";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const emptyCard = {
  fullName: "",
  nickname: "",
  jobTitle: "",
  company: "",
  department: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  bio: "",
  photoUrl: "",
  backgroundUrl: "",
  lineId: "",
  lineUrl: "",
  wechatId: "",
  whatsappNumber: "",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  googleMapsUrl: "",
};

function CardEditorPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { cardId } = useParams();

  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState(emptyCard);
  const [photoFile, setPhotoFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    const loadCard = async () => {
      if (!cardId) return;
      const snap = await getDoc(doc(db, "businessCards", cardId));
      if (snap.exists()) {
        setForm({ ...emptyCard, ...snap.data() });
      }
    };
    loadCard();
  }, [cardId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName) {
      setError("Full name is required.");
      setTab("basic");
      return;
    }
    if (!form.email && !form.phone) {
      setError("Please provide at least an email or phone number.");
      setTab("basic");
      return;
    }
    if (form.email && !isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      setTab("contact");
      return;
    }

    const urlFields = [
      { key: "website", label: "Website" },
      { key: "lineUrl", label: "LINE URL" },
      { key: "facebookUrl", label: "Facebook URL" },
      { key: "instagramUrl", label: "Instagram URL" },
      { key: "linkedinUrl", label: "LinkedIn URL" },
      { key: "tiktokUrl", label: "TikTok URL" },
      { key: "youtubeUrl", label: "YouTube URL" },
      { key: "googleMapsUrl", label: "Google Maps URL" },
    ];

    for (const { key, label } of urlFields) {
      if (form[key] && !isValidUrl(form[key])) {
        setError(`${label} is not a valid URL. Make sure it starts with https://`);
        setTab(key === "website" ? "contact" : "social");
        return;
      }
    }

    setSaving(true);
    try {
      const id = cardId || user.uid;
      let photoUrl = form.photoUrl;

      if (photoFile) {
        photoUrl = await compressImage(photoFile, 300, 0.7);
      }

      let backgroundUrl = form.backgroundUrl;
      if (backgroundFile) {
        backgroundUrl = await compressImage(backgroundFile, 800, 0.7);
      }

      await setDoc(
        doc(db, "businessCards", id),
        {
          ...form,
          photoUrl,
          backgroundUrl,
          userId: user.uid,
          updatedAt: serverTimestamp(),
          ...(cardId ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true }
      );
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <h1 className="text-2xl font-bold text-navy mb-6">
        {cardId ? "Edit Your Card" : "Create Your Card"}
      </h1>

      <div className="flex gap-2 mb-6 border-b border-border">
        {[
          { key: "basic", label: "Basic Info" },
          { key: "contact", label: "Contact" },
          { key: "social", label: "Social Links" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-navy text-navy"
                : "border-transparent text-muted hover:text-navy"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {tab === "basic" && (
          <div className="bg-white rounded-xl2 shadow-card p-6 grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex justify-center mb-2">
              <ImageUploader currentImageUrl={form.photoUrl} onFileSelect={setPhotoFile} />
            </div>
            <div className="md:col-span-2 flex flex-col items-center gap-2 mb-2">
              <label className="text-sm font-medium text-ink self-start">Card Background Image (optional)</label>
              <ImageUploader currentImageUrl={form.backgroundUrl} onFileSelect={setBackgroundFile} />
            </div>
            <InputField label="Full Name *" name="fullName" value={form.fullName} onChange={handleChange} />
            <InputField label="Nickname" name="nickname" value={form.nickname} onChange={handleChange} />
            <InputField label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} />
            <InputField label="Company" name="company" value={form.company} onChange={handleChange} />
            <InputField label="Department" name="department" value={form.department} onChange={handleChange} />
            <div className="md:col-span-2">
              <InputField label="Short Bio / Tagline" name="bio" value={form.bio} onChange={handleChange} />
            </div>
          </div>
        )}

        {tab === "contact" && (
          <div className="bg-white rounded-xl2 shadow-card p-6 grid md:grid-cols-2 gap-4">
            <InputField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} placeholder="+66812345678" />
            <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            <InputField label="Website" name="website" value={form.website} onChange={handleChange} placeholder="https://yourcompany.com" />
            <InputField label="Company Address" name="address" value={form.address} onChange={handleChange} />
          </div>
        )}

        {tab === "social" && (
          <div className="bg-white rounded-xl2 shadow-card p-6 grid md:grid-cols-2 gap-4">
            <InputField label="LINE ID" name="lineId" value={form.lineId} onChange={handleChange} placeholder="your.line.id" />
            <InputField label="LINE URL (optional)" name="lineUrl" value={form.lineUrl} onChange={handleChange} placeholder="https://line.me/ti/p/..." />
            <InputField label="WeChat ID" name="wechatId" value={form.wechatId} onChange={handleChange} />
            <InputField label="WhatsApp Number" name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} placeholder="+66812345678" />
            <InputField label="Facebook URL" name="facebookUrl" value={form.facebookUrl} onChange={handleChange} />
            <InputField label="Instagram URL" name="instagramUrl" value={form.instagramUrl} onChange={handleChange} />
            <InputField label="LinkedIn URL" name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} />
            <InputField label="TikTok URL" name="tiktokUrl" value={form.tiktokUrl} onChange={handleChange} />
            <InputField label="YouTube URL" name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange} />
            <InputField label="Google Maps Link" name="googleMapsUrl" value={form.googleMapsUrl} onChange={handleChange} />
          </div>
        )}

        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        <div className="flex gap-3 mt-6">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving..." : "Save Card"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}

export default CardEditorPage;
