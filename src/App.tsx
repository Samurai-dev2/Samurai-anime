// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AnimeDetailPage from "./pages/AnimeDetailPage";
import WatchPage from "./pages/WatchPage";
import LibraryPage from "./pages/LibraryPage";
import BrowsePage from "./pages/BrowsePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// ─── Grab key once ─────────────────────────────────────────────────────────
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

// ─── Loading Spinner ───────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-zinc-800 border-t-red-500 rounded-full animate-spin" />
        <p className="text-zinc-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// ─── 404 Page ──────────────────────────────────────────────────────────────
function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen flex-col gap-4">
      <div className="text-8xl font-black text-red-600 opacity-30">404</div>
      <p className="text-gray-400 text-xl">Page not found</p>
      <a
        href="/"
        className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors"
      >
        Go Home
      </a>
    </div>
  );
}

// ─── Protected Route ───────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─── Auth Route (already signed in → go home) ─────────────────────────────
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <LoadingScreen />;
  if (isSignedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ─── Navbar wrapper — hides on auth pages ─────────────────────────────────
function NavbarWrapper() {
  const location = useLocation();
  const authPages = ["/login", "/signup"];
  const isAuthPage = authPages.includes(location.pathname);
  if (isAuthPage) return null;
  return <Navbar />;
}

// ─── App Content ──────────────────────────────────────────────────────────
function AppContent() {
  return (
    <BrowserRouter>
      <div
        className="min-h-screen bg-black text-white"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Single Navbar that hides itself on auth pages */}
        <NavbarWrapper />

        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/anime/:malId" element={<AnimeDetailPage />} />
          <Route path="/browse" element={<BrowsePage />} />

          {/* ── Auth pages ── */}
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

          {/* ── Protected ── */}
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────
export default function App() {
  // If key is missing show a readable error instead of black screen
  if (!publishableKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black flex-col gap-4 px-4">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-white text-2xl font-bold">Missing Clerk Key</h1>
        <p className="text-zinc-400 text-sm text-center max-w-md">
          Create a <span className="text-red-400 font-mono">.env</span> file in
          your project root and add:
        </p>
        <code className="bg-zinc-900 border border-zinc-700 text-red-400 px-4 py-3 rounded-xl text-sm">
          VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
        </code>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <AppContent />
    </ClerkProvider>
  );
}
