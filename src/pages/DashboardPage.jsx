import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../firebase/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import Button from "../components/Button";
import CardPreview from "../components/CardPreview";
import QRCodeBox from "../components/QRCodeBox";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

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
        const q = query(collection(db, "businessCards"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          setCard({ id: docSnap.id, ...docSnap.data() });
        } else {
          setCard(null);
        }
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
    await deleteDoc(doc(db, "businessCards", card.id));
    setCard(null);
  };

  const handleLogout = () => signOut(auth);

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

            <QRCodeBox url={publicUrl} />

            <Button
              variant="outline"
              className="border-red-200 text-red-500 hover:bg-red-50"
              onClick={handleDelete}
            >
              Delete Card
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default DashboardPage;
