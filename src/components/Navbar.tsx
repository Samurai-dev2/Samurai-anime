// src/components/Navbar.tsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, X, Swords, BookOpen, Home, Compass, LogOut, LogIn, UserPlus } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useAnimeSearch } from "../hooks/useJikan";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: results, loading } = useAnimeSearch(query);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Clerk hooks
  const { isSignedIn, signOut, isLoaded } = useAuth();
  const { user } = useUser();

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/library", label: "Library", icon: BookOpen },
    { to: "/browse", label: "Browse", icon: Compass },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="relative bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

          {/* ── Logo ── */}
        {/* ── Logo ── */}
<Link to="/" className="flex items-center gap-2 mr-6 flex-shrink-0">
  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-900/50 overflow-hidden">
    <img
      src="/images/samurai-logo.png"
      alt="Samurai Anime"
      className="w-full h-full object-contain p-1"
      draggable={false}
    />
  </div>

  <span
    className="text-xl font-bold tracking-tight hidden sm:block"
    style={{ fontFamily: "Rajdhani, sans-serif" }}
  >
    <span className="text-white">SAMURAI</span>
    <span className="text-red-500"> ANIME</span>
  </span>
</Link>

          {/* ── Desktop Nav Links ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? "text-red-400 bg-red-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

<div className="ml-auto flex items-center gap-3">
  {/* ── Search ── */}
  <div ref={searchRef} className="flex items-center">
    {searchOpen ? (
      <div className="relative w-64 sm:w-80">
        {/* icon inside input, vertically centered */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anime..."
          className="w-full h-9 pl-9 pr-4 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
              setSearchOpen(false);
              setQuery("");
            }
            if (e.key === "Escape") {
              setSearchOpen(false);
              setQuery("");
            }
          }}
        />

        {/* Search Results Dropdown */}
        {query.trim() && (
          <div className="absolute top-11 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No results found</div>
            ) : (
              results.slice(0, 6).map((anime) => (
                <button
                  key={anime.mal_id}
                  onClick={() => {
                    navigate(`/anime/${anime.mal_id}`);
                    setSearchOpen(false);
                    setQuery("");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                >
                  <img
                    src={anime.images.jpg.image_url}
                    alt={anime.title}
                    className="w-10 h-14 object-cover rounded flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {anime.title_english || anime.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {anime.type} • {anime.year || "??"} •{" "}
                      {anime.score ? `★ ${anime.score}` : "N/A"}
                    </p>
                  </div>
                </button>
              ))
            )}

            {results.length > 0 && (
              <button
                onClick={() => {
                  navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="w-full px-4 py-3 text-center text-red-400 text-sm hover:bg-white/5 transition-colors"
              >
                See all results →
              </button>
            )}
          </div>
        )}
      </div>
    ) : (
      // collapsed search button (normal flex item = perfectly aligned)
      <button
        onClick={() => setSearchOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        aria-label="Open search"
      >
        <Search className="w-5 h-5" />
      </button>
    )}
  </div>

            {/* ── Auth Section ── */}
            {/* Show nothing while clerk is figuring out auth state */}
            {isLoaded && (
              <>
                {isSignedIn ? (
                  // ── Signed In — Avatar + dropdown ──
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen((p) => !p)}
                      className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
                    >
                      {/* Avatar */}
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.username ?? "User"}
                          className="w-7 h-7 rounded-lg object-cover ring-2 ring-red-500/40"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                          {user?.username?.[0]?.toUpperCase() ??
                            user?.firstName?.[0]?.toUpperCase() ??
                            "S"}
                        </div>
                      )}
                      {/* Username — hidden on small screens */}
                      <span className="text-sm text-gray-300 font-medium hidden sm:block max-w-[100px] truncate">
                        {user?.username ?? user?.firstName ?? "Samurai"}
                      </span>
                      {/* Chevron */}
                      <svg
                        className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 hidden sm:block ${
                          userMenuOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 top-12 w-56 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-white text-sm font-semibold truncate">
                            {user?.username ?? user?.firstName ?? "Samurai"}
                          </p>
                          <p className="text-gray-500 text-xs truncate mt-0.5">
                            {user?.primaryEmailAddress?.emailAddress ?? ""}
                          </p>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5 space-y-0.5">
                          <Link
                            to="/library"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <BookOpen className="w-4 h-4 text-gray-500" />
                            My Library
                          </Link>

                          {/* Divider */}
                          <div className="h-px bg-white/5 my-1" />

                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // ── Not Signed In — Login + Signup buttons ──
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                      <LogIn className="w-4 h-4" />
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white rounded-xl
                        bg-gradient-to-r from-red-700 to-red-500
                        hover:from-red-600 hover:to-red-400
                        transition-all duration-200 shadow-lg shadow-red-900/30
                        hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden sm:block">Sign Up</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Mobile Menu Button ── */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/5 px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? "text-red-400 bg-red-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            {/* Mobile Auth */}
            {isLoaded && (
              <div className="pt-2 border-t border-white/5 mt-2 space-y-1">
                {isSignedIn ? (
                  <>
                    {/* Mobile user info */}
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover ring-2 ring-red-500/40"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-sm font-bold text-white">
                          {user?.username?.[0]?.toUpperCase() ?? "S"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {user?.username ?? user?.firstName ?? "Samurai"}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {user?.primaryEmailAddress?.emailAddress ?? ""}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
