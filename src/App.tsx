import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AnimeDetailPage from "./pages/AnimeDetailPage";
import WatchPage from "./pages/WatchPage";
import LibraryPage from "./pages/LibraryPage";
import BrowsePage from "./pages/BrowsePage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white" style={{ fontFamily: "Inter, sans-serif" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/anime/:malId" element={<AnimeDetailPage />} />
          <Route path="/watch/:malId" element={<WatchPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          {/* 404 */}
          <Route
            path="*"
            element={
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
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
