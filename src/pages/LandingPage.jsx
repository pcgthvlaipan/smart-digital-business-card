import { Link } from "react-router-dom";
import Button from "../components/Button";
import CardPreview from "../components/CardPreview";
import {
  ArrowUpRight,
  Check,
  QrCode,
  Share2,
  Smartphone,
  Sparkles,
} from "lucide-react";

// A fictional sample, always shown as-is - this is the public, logged-out
// landing page, so it must never pull a real user's card (name, phone,
// email...) out of the database just to have something to preview.
// A raw (snake_case) shape, same as a real business_cards row: CardPreview
// feeds it straight through the same dbRowToCard mapper a real row goes
// through, so this has to match that shape or every field renders blank.
const sampleCard = {
  id: "sample",
  full_name: "Jane Doe",
  job_title: "Sales Director",
  company: "Your Company",
  bio: "Helping clients grow, one connection at a time.",
  phone: "+66812345678",
  email: "jane@yourcompany.com",
};

function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-surface">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-shell landing-nav-inner">
          <Link to="/" className="brand-lockup" aria-label="Smart Digital Card home">
            <span className="brand-mark">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <rect width="100" height="100" rx="22" fill="#0B3D91" />
                <g transform="rotate(-8 46 54)">
                  <rect x="16" y="36" width="58" height="38" rx="7" fill="#FFFFFF" />
                  <rect x="16" y="57" width="58" height="9" rx="3" fill="#F97316" />
                </g>
                <path d="M 84 0 A 16 16 0 0 1 100 16" stroke="#F97316" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.95" />
                <path d="M 73 0 A 27 27 0 0 1 100 27" stroke="#F97316" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />
              </svg>
            </span>
            <span>
              <strong>Smart Digital</strong>
              <small>Business Card</small>
            </span>
          </Link>
          <div className="landing-nav-actions">
            <span className="nav-status"><span /> Always ready to share</span>
            <Link to="/login" className="nav-login">Sign in</Link>
            <Link to="/register" className="nav-cta">
              Get started <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section className="landing-shell landing-hero">
          <div className="landing-hero-copy">
            <p className="eyebrow"><span /> Your professional identity, in one place</p>
            <h1>Make every introduction <em>memorable.</em></h1>
            <p className="hero-lede">
              A beautifully simple digital business card for people who move between
              conversations, cities, and opportunities.
            </p>
            <div className="hero-actions">
              <Link to="/register">
                <Button variant="accent" className="hero-primary">
                  Create my card <ArrowUpRight size={18} aria-hidden="true" />
                </Button>
              </Link>
              <a className="hero-text-link" href="#why-digital">
                See how it works <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars" aria-hidden="true"><span>J</span><span>M</span><span>A</span></div>
              <span><strong>Built for modern professionals</strong><br />Share your details without the paper trail.</span>
            </div>
          </div>

          <div className="hero-card-stage" aria-label="Example digital business card preview">
            <div className="stage-note stage-note-top"><Check size={14} /> One link. Every detail.</div>
            <div className="stage-card"><CardPreview card={sampleCard} /></div>
            <div className="stage-note stage-note-bottom"><QrCode size={16} /> Scan, save, connect</div>
          </div>
        </section>

      {/* Benefits */}
      <section id="why-digital" className="benefits-section">
        <div className="landing-shell">
          <div className="section-heading">
            <p className="eyebrow">The better business card</p>
            <h2>Designed for the moment<br /><em>after hello.</em></h2>
            <p>Everything people need to remember you, presented with clarity and care.</p>
          </div>
          <div className="benefits-grid">
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
      <section className="landing-shell landing-cta">
        <div>
          <p className="eyebrow">Your next introduction starts here</p>
          <h2>Make your name<br /><em>easy to remember.</em></h2>
        </div>
        <Link to="/register">
          <Button variant="primary" className="hero-primary">
            Create my card <ArrowUpRight size={18} aria-hidden="true" />
          </Button>
        </Link>
      </section>
      </main>
    </div>
  );
}

function Benefit({ icon: Icon, title, description }) {
  return (
    <div className="benefit-item">
      <div className="benefit-icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default LandingPage;
