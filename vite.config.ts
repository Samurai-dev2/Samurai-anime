import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// ⚠️ Removed viteSingleFile — it's incompatible with large JSON imports
// viteSingleFile tries to inline everything into one file which breaks
// with a 4MB JSON like fribb's mapper

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // viteSingleFile() ← removed, breaks large JSON
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  json: {
    stringify: true, // handles large JSON without crashing
  },
  build: {
    chunkSizeWarningLimit: 5000, // stops Vite warning about file size
    rollupOptions: {
      output: {
        // Split the large JSON into its own chunk so the app loads faster
        manualChunks: {
          "fribb-mapper": ["./src/data/anime-seasons.json"],
        },
      },
    },
  },
});