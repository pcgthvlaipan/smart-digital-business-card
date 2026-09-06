import { Link } from "react-router-dom";
import Button from "../components/Button";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center gap-4">
      <h1 className="text-5xl font-bold text-[#0B3D91]">404</h1>
      <p className="text-lg font-semibold text-ink">Page not found</p>
      <p className="text-sm text-muted max-w-sm">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/">
        <Button variant="brand">Back to home</Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
