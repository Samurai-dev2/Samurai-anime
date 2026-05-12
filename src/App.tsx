// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AnimeDetailPage from "./pages/AnimeDetailPage";
import WatchPage from "./pages/WatchPage";
import LibraryPage from "./pages/LibraryPage";
import BrowsePage from "./pages/BrowsePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing Clerk publishable key — check your .env file");
}

// ─── Protected Route Wrapper ───────────────────────────────────────────────
// Any page wrapped in this will redirect to /login if not signed in
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  // Clerk is still figuring out if user is logged in, show nothing yet
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in → kick them to login
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ─── Auth Route Wrapper ────────────────────────────────────────────────────
// If already signed in, skip login/signup and go home
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Already signed in → no need to see login/signup
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// ─── Inner App (needs to be inside ClerkProvider to use useAuth) ───────────
function AppContent() {
  return (
    <BrowserRouter>
      <div
        className="min-h-screen bg-black text-white"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Navbar hidden on auth pages */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/signup" element={null} />
          <Route path="*" element={<Navbar />} />
        </Routes>

        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/anime/:malId" element={<AnimeDetailPage />} />
          <Route path="/browse" element={<BrowsePage />} />

          {/* ── Auth Routes (redirect home if already signed in) ── */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute>
                <SignupPage />
              </AuthRoute>
            }
          />

          {/* ── Protected Routes (must be signed in) ── */}
          <Route
            path="/watch/:malId"
            element={
              <ProtectedRoute>
                <WatchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />

          {/* ── 404 ── */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen flex-col gap-4">
                <div className="text-8xl font-black text-red-600 opacity-30">
                  404
                </div>
                <p className="text-gray-400 text-xl">Page not found</p>
                <a
                  href="/"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors"
                >
                  Go Home
                </a>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// ─── Root App (ClerkProvider wraps everything) ─────────────────────────────
export default function App() {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <AppContent />
    </ClerkProvider>
  );
}
