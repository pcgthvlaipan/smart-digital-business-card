import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../firebase/AuthContextValue";
import DashboardLayout from "../components/DashboardLayout";
import InputField from "../components/InputField";
import Button from "../components/Button";
import ImageUploader from "../components/ImageUploader";
import { compressImage } from "../utils/compressImage";
import { isValidUrl, isValidEmail } from "../utils/formatLinks";

const emptyCard = {
  fullName: "",
  fullNameTh: "",
  nickname: "",
  jobTitle: "",
  jobTitleTh: "",
  company: "",
  companyTh: "",
  department: "",
  phone: "",
  email: "",
  email2: "",
  website: "",
  address: "",
  bio: "",
  bioTh: "",
  photoUrl: "",
  backgroundUrl: "",
  logoUrl: "",
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

function dbRowToForm(row) {
  return {
    fullName: row.full_name || "",
    fullNameTh: row.full_name_th || "",
    nickname: row.nickname || "",
    jobTitle: row.job_title || "",
    jobTitleTh: row.job_title_th || "",
    company: row.company || "",
    companyTh: row.company_th || "",
    department: row.department || "",
    phone: row.phone || "",
    email: row.email || "",
    email2: row.email2 || "",
    website: row.website || "",
    address: row.address || "",
    bio: row.bio || "",
    bioTh: row.bio_th || "",
    photoUrl: row.photo_url || "",
    backgroundUrl: row.background_url || "",
    logoUrl: row.logo_url || "",
    lineId: row.line_id || "",
    lineUrl: row.line_url || "",
    wechatId: row.wechat_id || "",
    whatsappNumber: row.whatsapp_number || "",
    facebookUrl: row.facebook_url || "",
    instagramUrl: row.instagram_url || "",
    linkedinUrl: row.linkedin_url || "",
    tiktokUrl: row.tiktok_url || "",
    youtubeUrl: row.youtube_url || "",
    googleMapsUrl: row.google_maps_url || "",
  };
}

function formToDbRow(form, userId) {
  return {
    user_id: userId,
    full_name: form.fullName || null,
    full_name_th: form.fullNameTh || null,
    nickname: form.nickname || null,
    job_title: form.jobTitle || null,
    job_title_th: form.jobTitleTh || null,
    company: form.company || null,
    company_th: form.companyTh || null,
    department: form.department || null,
    phone: form.phone || null,
    email: form.email || null,
    email2: form.email2 || null,
    website: form.website || null,
    address: form.address || null,
    bio: form.bio || null,
    bio_th: form.bioTh || null,
    photo_url: form.photoUrl || null,
    background_url: form.backgroundUrl || null,
    logo_url: form.logoUrl || null,
    line_id: form.lineId || null,
    line_url: form.lineUrl || null,
    wechat_id: form.wechatId || null,
    whatsapp_number: form.whatsappNumber || null,
    facebook_url: form.facebookUrl || null,
    instagram_url: form.instagramUrl || null,
    linkedin_url: form.linkedinUrl || null,
    tiktok_url: form.tiktokUrl || null,
    youtube_url: form.youtubeUrl || null,
    google_maps_url: form.googleMapsUrl || null,
  };
}

const BUCKET_FILE_INFO = {
  avatars: { name: "photo", contentType: "image/jpeg", ext: "jpg" },
  backgrounds: { name: "background", contentType: "image/jpeg", ext: "jpg" },
  // Logos keep their transparency, so they're compressed to PNG, not JPEG.
  logos: { name: "logo", contentType: "image/png", ext: "png" },
};

async function uploadToBucket(bucket, userId, blob) {
  const { name, contentType, ext } = BUCKET_FILE_INFO[bucket];
  const path = `${userId}/${name}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function CardEditorPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { cardId } = useParams();

  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState(emptyCard);
  const [photoFile, setPhotoFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    const loadCard = async () => {
      if (!cardId) return;
      const { data, error: loadError } = await supabase
        .from("business_cards")
        .select("*")
        .eq("id", cardId)
        .single();
      if (loadError) {
        console.error("Error loading card:", loadError);
        return;
      }
      if (data) {
        setForm(dbRowToForm(data));
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
    if (!form.jobTitle) {
      setError("Job title is required.");
      setTab("basic");
      return;
    }
    if (!form.company) {
      setError("Company name is required.");
      setTab("basic");
      return;
    }
    if (!form.phone) {
      setError("Phone number is required.");
      setTab("contact");
      return;
    }
    if (!form.email) {
      setError("Email is required.");
      setTab("contact");
      return;
    }
    if (form.email && !isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      setTab("contact");
      return;
    }
    if (form.email2 && !isValidEmail(form.email2)) {
      setError("Please enter a valid second email address.");
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
      let photoUrl = form.photoUrl;
      if (photoFile) {
        // The photo now displays up to 161px and the "Save Image" export
        // captures at 4x scale (needs ~644px source pixels just to avoid
        // upscaling there), plus retina phone screens on top of that -
        // 900px/0.9 gives real headroom instead of just barely covering it.
        const compressedBlob = await compressImage(photoFile, 900, 0.9);
        photoUrl = await uploadToBucket("avatars", user.id, compressedBlob);
      }

      let backgroundUrl = form.backgroundUrl;
      if (backgroundFile) {
        const compressedBlob = await compressImage(backgroundFile, 800, 0.7);
        backgroundUrl = await uploadToBucket("backgrounds", user.id, compressedBlob);
      }

      let logoUrl = form.logoUrl;
      if (logoFile) {
        // PNG, not JPEG, to keep the logo's transparent background intact.
        const compressedBlob = await compressImage(logoFile, 400, 0.9, "image/png");
        logoUrl = await uploadToBucket("logos", user.id, compressedBlob);
      }

      const finalForm = { ...form, photoUrl, backgroundUrl, logoUrl };
      const dbRow = formToDbRow(finalForm, user.id);

      if (cardId) {
        const { error: updateError } = await supabase
          .from("business_cards")
          .update(dbRow)
          .eq("id", cardId);
        if (updateError) throw updateError;
      } else {
        // Upsert on user_id rather than a plain insert: if a card for this
        // user already exists (a race from a double-submit, two open tabs,
        // or a retried request), this updates that row instead of creating
        // a duplicate. Requires the business_cards_user_id_unique constraint.
        const { error: upsertError } = await supabase
          .from("business_cards")
          .upsert(dbRow, { onConflict: "user_id" });
        if (upsertError) throw upsertError;
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => supabase.auth.signOut();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <h1 className="text-2xl font-bold text-[#0B3D91] mb-6">
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
                ? "border-[#0B3D91] text-[#0B3D91]"
                : "border-transparent text-muted hover:text-[#0B3D91]"
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
              <ImageUploader currentImageUrl={form.photoUrl} onFileSelect={setPhotoFile} label="Upload Photo" />
            </div>
            <div className="md:col-span-2 flex flex-col items-center gap-2 mb-2">
              <label className="text-sm font-medium text-ink self-start">Card Background Image (optional)</label>
              <ImageUploader
                currentImageUrl={form.backgroundUrl}
                onFileSelect={setBackgroundFile}
                shape="card"
                label="Upload Background"
              />
              <p className="text-xs text-muted text-center max-w-xs">
                This image fills the whole card behind your details, so it's shown here at roughly
                your card's proportions. It's center-cropped, so keep the important part of the
                photo near the middle.
              </p>
            </div>
            <div className="md:col-span-2 flex flex-col items-center gap-2 mb-2">
              <label className="text-sm font-medium text-ink self-start">Company Logo (optional)</label>
              <ImageUploader
                currentImageUrl={form.logoUrl}
                onFileSelect={setLogoFile}
                shape="logo"
                label="Upload Logo"
              />
              <p className="text-xs text-muted text-center max-w-xs">
                Shown at the top of your card. A transparent PNG works best - it's shown here at
                its own proportions, not cropped. Leave this blank to keep the default company logo.
              </p>
            </div>
            <InputField label="Full Name" required boxed name="fullName" value={form.fullName} onChange={handleChange} />
            <InputField label="ชื่อ-นามสกุล" boxed name="fullNameTh" value={form.fullNameTh} onChange={handleChange} />
            <InputField label="Job Title" required boxed name="jobTitle" value={form.jobTitle} onChange={handleChange} />
            <InputField label="ตำแหน่ง" boxed name="jobTitleTh" value={form.jobTitleTh} onChange={handleChange} />
            <InputField label="Company Name" required boxed name="company" value={form.company} onChange={handleChange} />
            <InputField label="ชื่อบริษัท" boxed name="companyTh" value={form.companyTh} onChange={handleChange} />
            <InputField label="Nickname" boxed name="nickname" value={form.nickname} onChange={handleChange} />
            <InputField label="Department" boxed name="department" value={form.department} onChange={handleChange} />
            <div className="md:col-span-2">
              <InputField label="Short Bio / Tagline" boxed name="bio" value={form.bio} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <InputField label="แนะนำตัวสั้นๆ" boxed name="bioTh" value={form.bioTh} onChange={handleChange} />
            </div>
          </div>
        )}

        {tab === "contact" && (
          <div className="bg-white rounded-xl2 shadow-card p-6 grid md:grid-cols-2 gap-4">
            <InputField label="Phone Number" required boxed name="phone" value={form.phone} onChange={handleChange} placeholder="+66812345678" />
            <InputField label="Email" required boxed name="email" type="email" value={form.email} onChange={handleChange} />
            <InputField label="Email 2 (optional)" boxed name="email2" type="email" value={form.email2} onChange={handleChange} />
            <InputField label="Website" boxed name="website" value={form.website} onChange={handleChange} placeholder="https://yourcompany.com" />
            <InputField label="Company Address" boxed name="address" value={form.address} onChange={handleChange} />
          </div>
        )}

        {tab === "social" && (
          <div className="bg-white rounded-xl2 shadow-card p-6 grid md:grid-cols-2 gap-4">
            <InputField label="LINE ID" boxed name="lineId" value={form.lineId} onChange={handleChange} placeholder="your.line.id" />
            <InputField label="LINE URL (optional)" boxed name="lineUrl" value={form.lineUrl} onChange={handleChange} placeholder="https://line.me/ti/p/..." />
            <InputField label="WeChat ID" boxed name="wechatId" value={form.wechatId} onChange={handleChange} />
            <InputField label="WhatsApp Number" boxed name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} placeholder="+66812345678" />
            <InputField label="Facebook URL" boxed name="facebookUrl" value={form.facebookUrl} onChange={handleChange} />
            <InputField label="Instagram URL" boxed name="instagramUrl" value={form.instagramUrl} onChange={handleChange} />
            <InputField label="LinkedIn URL" boxed name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} />
            <InputField label="TikTok URL" boxed name="tiktokUrl" value={form.tiktokUrl} onChange={handleChange} />
            <InputField label="YouTube URL" boxed name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange} />
            <InputField label="Google Maps Link" boxed name="googleMapsUrl" value={form.googleMapsUrl} onChange={handleChange} />
          </div>
        )}

        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        <div className="flex gap-3 mt-6">
          <Button type="submit" variant="brand" disabled={saving}>
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
