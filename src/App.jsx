import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./firebase/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CardEditorPage from "./pages/CardEditorPage";
import PublicCardPage from "./pages/PublicCardPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/editor" element={<CardEditorPage />} />
          <Route path="/editor/:cardId" element={<CardEditorPage />} />
          <Route path="/card/:cardId" element={<PublicCardPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;2