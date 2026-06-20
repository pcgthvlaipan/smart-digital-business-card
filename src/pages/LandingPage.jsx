import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import Button from "../components/Button";
import CardPreview from "../components/CardPreview";
import {
  QrCode,
  Share2,
  Smartphone,
  Sparkles,
} from "lucide-react";

const fallbackCard = {
  fullName: "Jane Doe",
  jobTitle: "Sales Director",
  company: "Your Company",
  bio: "Helping clients grow, one connection at a time.",
  photoUrl: "",
};

function LandingPage() {
  const [previewCard, setPreviewCard] = useState(fallbackCard);

  useEffect(() => {
    const fetchSampleCard = async () => {
      try {
        const q = query(collection(db, "businessCards"), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPreviewCard({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (err) {
        console.error("Could not load sample card:", err);
      }
    };
    fetchSampleCard();
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="w-full border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-lg text-navy">Smart Digital Card</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-ink hover:text-navy">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-navy-light transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight mb-6">
            Create Your Smart Digital Business Card
          </h1>
          <p className="text-lg text-muted mb-8 max-w-md">
            Build a premium digital profile in minutes. Share your contact details,
            social links, and more with a single tap, link, or QR code.
          </p>
          <Link to="/register">
            <Button variant="accent" className="text-base px-8 py-4">
              Create My Card
            </Button>
          </Link>
        </div>

        <div className="flex justify-center">
          <div className="scale-95">
            <CardPreview card={previewCard} />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-navy text-center mb-12">
            Why go digital?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Benefit
              icon={Smartphone}
              title="Always up to date"
              description="Update your details anytime — everyone you've shared your card with sees the latest version instantly."
            />
            <Benefit
              icon={Share2}
              title="Share in seconds"
              description="One link or QR code gets your full profile across LINE, WhatsApp, email, or social media."
            />
            <Benefit
              icon={QrCode}
              title="Scan and connect"
              description="Let people scan your QR code and save your contact directly to their phone in one tap."
            />
            <Benefit
              icon={Sparkles}
              title="Premium and professional"
              description="A polished, modern profile that makes the right impression with clients and partners."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-navy mb-4">
          Ready to make your mark?
        </h2>
        <p className="text-muted mb-8">
          Join professionals who've already gone digital with their business card.
        </p>
        <Link to="/register">
          <Button variant="primary" className="text-base px-8 py-4">
            Create My Card
          </Button>
        </Link>
      </section>
    </div>
  );
}

function Benefit({ icon: Icon, title, description }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-navy" />
      </div>
      <h3 className="font-semibold text-navy mb-2">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}

export default LandingPage;
