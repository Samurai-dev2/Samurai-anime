import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, X, Swords, BookOpen, Home, Compass } from "lucide-react";
import { useAnimeSearch } from "../hooks/useJikan";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: results, loading } = useAnimeSearch(query);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/library", label: "Library", icon: BookOpen },
    { to: "/browse", label: "Browse", icon: Compass },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism bar */}
      <div className="relative bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-6 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-900/50">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-tight hidden sm:block"
              style={{ fontFamily: "Rajdhani, sans-serif" }}
            >
              <span className="text-white">SAMURAI</span>
              <span className="text-red-500"> ANIME</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
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

          {/* Search */}
          <div className="ml-auto flex items-center gap-2" ref={searchRef}>
            <div className={`relative transition-all duration-300 ${searchOpen ? "w-64 sm:w-80" : "w-10"}`}>
              <button
                onClick={() => setSearchOpen(true)}
                className={`absolute left-0 top-0 h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors ${searchOpen ? "pointer-events-none" : ""}`}
              >
                <Search className="w-5 h-5" />
              </button>
              {searchOpen && (
                <>
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search anime..."
                    className="w-full h-10 pl-10 pr-4 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && query.trim()) {
                        navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
                        setSearchOpen(false);
                        setQuery("");
                      }
                    }}
                  />
                  {/* Search results dropdown */}
                  {query.trim() && (
                    <div className="absolute top-12 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
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
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
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
          </div>
        )}
      </div>
    </header>
  );
}
