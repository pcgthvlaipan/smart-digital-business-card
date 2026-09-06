import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../firebase/AuthContextValue";
import DashboardLayout from "../components/DashboardLayout";
import Button from "../components/Button";
import CardPreview from "../components/CardPreview";
import { LineIcon } from "../components/icons/BrandIcons";

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const fetchCard = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from("business_cards")
          .select("*")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setCard(data);
      } catch (err) {
        console.error("Error fetching card:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchCard();
  }, [user]);

  const handleLogout = () => supabase.auth.signOut();

  const publicUrl = card ? `${window.location.origin}/card/${card.id}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    alert("Link copied to clipboard!");
  };

  const lineShareHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(publicUrl)}`;
  const emailShareHref = `mailto:?subject=${encodeURIComponent(
    "My digital business card"
  )}&body=${encodeURIComponent(`Here's my digital business card: ${publicUrl}`)}`;

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#0B3D91]">My Business Card</h1>
        {card && (
          <Button variant="brand" onClick={() => navigate(`/editor/${card.id}`)}>
            Edit Card
          </Button>
        )}
      </div>

      {!card ? (
        <div className="bg-white rounded-xl2 shadow-card p-10 text-center max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-[#0B3D91] mb-2">No card yet</h2>
          <p className="text-sm text-muted mb-6">
            Create your digital business card to start sharing your profile.
          </p>
          <Button variant="brand" onClick={() => navigate("/editor")}>
            Create My Card
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <CardPreview card={card} />

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl2 shadow-card p-6">
              <h3 className="font-semibold text-[#0B3D91] mb-3">Share your card</h3>
              <div className="flex items-center gap-2 mb-4">
                <input
                  readOnly
                  value={publicUrl}
                  className="flex-1 text-sm px-3 py-2 rounded-lg border-2 border-[#9DB8E8] bg-white text-ink"
                />
                <Button variant="outlineBrand" onClick={copyLink}>
                  Copy
                </Button>
              </div>
              <Button
                variant="outlineBrand"
                className="w-full"
                onClick={() => navigate(`/card/${card.id}`)}
              >
                Preview Public Page
              </Button>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <a
                  href={lineShareHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-sm font-semibold text-white py-2.5 rounded-full transition-opacity hover:opacity-90"
                  style={{ background: "#06C755" }}
                >
                  <LineIcon className="w-4 h-4 fill-white" />
                  Share via LINE
                </a>
                <a
                  href={emailShareHref}
                  className="flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-full border-2 hover:bg-[#F0F5FF] transition-colors"
                  style={{ borderColor: "#9DB8E8", color: "#0B3D91" }}
                >
                  <Mail className="w-4 h-4" />
                  Share via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default DashboardPage;
