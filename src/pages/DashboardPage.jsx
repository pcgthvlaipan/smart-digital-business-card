import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../firebase/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import Button from "../components/Button";
import CardPreview from "../components/CardPreview";
import QRCodeBox from "../components/QRCodeBox";

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

  const handleDelete = async () => {
    if (!card) return;
    const confirmed = window.confirm("Delete your business card? This cannot be undone.");
    if (!confirmed) return;
    const { error } = await supabase.from("business_cards").delete().eq("id", card.id);
    if (error) {
      console.error("Error deleting card:", error);
      return;
    }
    setCard(null);
  };

  const handleLogout = () => supabase.auth.signOut();

  const publicUrl = card ? `${window.location.origin}/card/${card.id}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    alert("Link copied to clipboard!");
  };

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
        <h1 className="text-2xl font-bold text-navy">My Business Card</h1>
        {card && (
          <Button variant="primary" onClick={() => navigate(`/editor/${card.id}`)}>
            Edit Card
          </Button>
        )}
      </div>

      {!card ? (
        <div className="bg-white rounded-xl2 shadow-card p-10 text-center max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-navy mb-2">No card yet</h2>
          <p className="text-sm text-muted mb-6">
            Create your digital business card to start sharing your profile.
          </p>
          <Button variant="accent" onClick={() => navigate("/editor")}>
            Create My Card
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <CardPreview card={card} />

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl2 shadow-card p-6">
              <h3 className="font-semibold text-navy mb-3">Share your card</h3>
              <div className="flex items-center gap-2 mb-4">
                <input
                  readOnly
                  value={publicUrl}
                  className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-surface text-ink"
                />
                <Button variant="outline" onClick={copyLink}>
                  Copy
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate(`/card/${card.id}`)}
              >
                Preview Public Page
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default DashboardPage;
