// src/data/animeData.ts
// ─── All IMDb IDs now come from fribb's mapper automatically ──
// ─── No more manual ID maintenance! ──────────────────────────

export interface AnimeEntry {
  malId: number;
  title: string;
  englishTitle: string;
  description: string;
  genre: string[];
  year: number;
  rating: number;
  episodes: number | null;
  status: "Finished" | "Airing" | "Upcoming";
  coverImage: string;
  bannerImage: string;
  season?: number;
  studio: string;
  trailer?: string;
  type: "TV" | "Movie" | "OVA";
  tags: string[];
  // ✅ No more imdbId or tmdbId here — fribb handles it!
}

// ─── Featured / Hero Anime (MAL IDs only) ────────────────────
export const FEATURED_ANIME: AnimeEntry[] = [
  {
    malId: 813,
    title: "Dragon Ball Z",
    englishTitle: "Dragon Ball Z",
    description:
      "Five years after winning the World Martial Arts tournament, Goku is now living a peaceful life with his wife and son. This changes with the arrival of a mysterious enemy named Raditz who presents himself as Goku's long-lost brother.",
    genre: ["Action", "Adventure", "Fantasy", "Sci-Fi"],
    year: 1989,
    rating: 8.18,
    episodes: 291,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/1277/142022.jpg",
    bannerImage:
      "https://artworks.thetvdb.com/banners/v4/series/76666/backgrounds/655a6b5dd88f3.jpg",
    season: 1,
    studio: "Toei Animation",
    type: "TV",
    tags: ["Saiyan", "Power Levels", "Classic", "Shonen"],
  },
  {
    malId: 1535,
    title: "Death Note",
    englishTitle: "Death Note",
    description:
      "A high school student named Light Yagami discovers a supernatural notebook that grants its user the power to kill anyone whose name and face he knows.",
    genre: ["Mystery", "Psychological", "Supernatural", "Thriller"],
    year: 2006,
    rating: 8.62,
    episodes: 37,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
    bannerImage:
      "https://artworks.thetvdb.com/banners/v4/series/79481/backgrounds/6268e9eeb1ea1.jpg",
    season: 1,
    studio: "Madhouse",
    type: "TV",
    tags: ["Cat and Mouse", "Psychological", "Dark", "Genius"],
  },
  {
    malId: 21,
    title: "One Piece",
    englishTitle: "One Piece",
    description:
      "Gold Roger was known as the Pirate King. His last words revealed the existence of the greatest treasure in the world, One Piece, which brought about the Grand Age of Pirates.",
    genre: ["Action", "Adventure", "Comedy", "Fantasy"],
    year: 1999,
    rating: 8.72,
    episodes: null,
    status: "Airing",
    coverImage: "https://cdn.myanimelist.net/images/anime/1244/138851.jpg",
    bannerImage:
      "https://artworks.thetvdb.com/banners/v4/series/81797/backgrounds/627f03ab07e14.jpg",
    season: 1,
    studio: "Toei Animation",
    type: "TV",
    tags: ["Pirates", "Adventure", "Grand Line", "Shonen"],
  },
  {
    malId: 14719,
    title: "JoJo no Kimyou na Bouken (TV)",
    englishTitle: "JoJo's Bizarre Adventure",
    description:
      "A generations-spanning tale of the heroic Joestar family and their never-ending battle against the supernatural forces of evil.",
    genre: ["Action", "Adventure", "Supernatural"],
    year: 2012,
    rating: 7.87,
    episodes: 26,
    status: "Finished",
    coverImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaghQ6UwmiO_jgTk3QAHoEQo_sUxZ2Qy-low&s",
    bannerImage:
      "https://artworks.thetvdb.com/banners/v4/series/263023/backgrounds/62b9b7745568f.jpg",
    season: 1,
    studio: "David Production",
    type: "TV",
    tags: ["Stands", "Bizarre", "Iconic", "Shonen"],
  },
];

// ─── Library Anime ────────────────────────────────────────────
export const LIBRARY_ANIME: AnimeEntry[] = [
  ...FEATURED_ANIME,
  {
    malId: 16498,
    title: "Shingeki no Kyojin",
    englishTitle: "Attack on Titan",
    description:
      "Humanity lives within enormous walled cities to protect themselves from the Titans. After the walls are breached and his mother is killed, Eren Yeager swears revenge.",
    genre: ["Action", "Dark Fantasy", "Post-Apocalyptic"],
    year: 2013,
    rating: 8.55,
    episodes: 25,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    bannerImage:
      "https://artworks.thetvdb.com/banners/v4/series/267440/backgrounds/626d89a32d43b.jpg",
    season: 1,
    studio: "Wit Studio",
    type: "TV",
    tags: ["Titans", "Dark", "Military", "Survival"],
  },
  {
    malId: 5114,
    title: "Fullmetal Alchemist: Brotherhood",
    englishTitle: "Fullmetal Alchemist: Brotherhood",
    description:
      "Edward and Alphonse Elric seek the Philosopher's Stone to restore their bodies after a failed attempt to resurrect their mother using alchemy.",
    genre: ["Action", "Adventure", "Fantasy"],
    year: 2009,
    rating: 9.09,
    episodes: 64,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
    bannerImage:
      "https://artworks.thetvdb.com/banners/v4/series/83322/backgrounds/5e5c4cd0bb7b9.jpg",
    season: 1,
    studio: "Bones",
    type: "TV",
    tags: ["Alchemy", "Brotherhood", "Dark", "Shonen"],
  },
  {
    malId: 20,
    title: "Naruto",
    englishTitle: "Naruto",
    description:
      "Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage.",
    genre: ["Action", "Adventure", "Fantasy"],
    year: 2002,
    rating: 8.00,
    episodes: 220,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
    bannerImage:
      "https://artworks.thetvdb.com/banners/v4/series/78857/backgrounds/5e5c3c3a7e42c.jpg",
    season: 1,
    studio: "Studio Pierrot",
    type: "TV",
    tags: ["Ninja", "Friendship", "Classic", "Shonen"],
  },
  {
    malId: 269,
    title: "Bleach",
    englishTitle: "Bleach",
    description:
      "Ichigo Kurosaki becomes a substitute Soul Reaper and must protect humans from evil spirits known as Hollows.",
    genre: ["Action", "Adventure", "Supernatural"],
    year: 2004,
    rating: 7.92,
    episodes: 366,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/3/40451.jpg" // ✅ FIXED - was using JoJo's image
    bannerImage:
      "https://artworks.thetvdb.com/banners/v4/series/74796/backgrounds/5e5c4e7a62459.jpg",
    season: 1,
    studio: "Studio Pierrot",
    type: "TV",
    tags: ["Soul Reaper", "Zanpakuto", "Classic", "Shonen"],
  },
  {
    malId: 11757,
    title: "Sword Art Online",
    englishTitle: "Sword Art Online",
    description:
      "Players of a virtual reality MMORPG find themselves trapped inside the game with no way to log out.",
    genre: ["Action", "Adventure", "Fantasy", "Romance"],
    year: 2012,
    rating: 7.21,
    episodes: 25,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/11/39717.jpg",
    bannerImage: "https://artworks.thetvdb.com/banners/v4/series/259640/backgrounds/5f5e80ccd3c36.jpg",
    season: 1,
    studio: "A-1 Pictures",
    type: "TV",
    tags: ["Virtual Reality", "MMORPG", "Isekai", "Action"],
  },
  {
    malId: 31964,
    title: "Boku no Hero Academia",
    englishTitle: "My Hero Academia",
    description:
      "In a world where most people have superpowers, Izuku Midoriya dreams of becoming a hero despite being born without a Quirk.",
    genre: ["Action", "Comedy", "School", "Superhero"],
    year: 2016,
    rating: 7.87,
    episodes: 13, // ✅ FIXED - was 88, Season 1 has 13 episodes
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
    bannerImage: "https://artworks.thetvdb.com/banners/v4/series/305074/backgrounds/5f284e5a23989.jpg",
    season: 1,
    studio: "Bones",
    type: "TV",
    tags: ["Quirks", "Heroes", "School", "Shonen"],
  },
  {
    malId: 38000,
    title: "Kimetsu no Yaiba",
    englishTitle: "Demon Slayer",
    description:
      "After his family is slaughtered by a demon, Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
    genre: ["Action", "Dark Fantasy", "Historical"],
    year: 2019,
    rating: 8.49,
    episodes: 26,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    bannerImage: "https://artworks.thetvdb.com/banners/v4/series/362696/backgrounds/5dd0ba536c718.jpg",
    season: 1,
    studio: "ufotable",
    type: "TV",
    tags: ["Demons", "Swords", "Family", "Shonen"],
  },
  {
    malId: 40748,
    title: "Jujutsu Kaisen",
    englishTitle: "Jujutsu Kaisen",
    description:
      "A boy swallows a cursed talisman and becomes the vessel of a dangerous demon, attending Tokyo Jujutsu High to learn to control his power.",
    genre: ["Action", "Dark Fantasy", "Supernatural"],
    year: 2020,
    rating: 8.61,
    episodes: 24,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    bannerImage: "https://artworks.thetvdb.com/banners/v4/series/384833/backgrounds/5fa4b93f3765d.jpg",
    season: 1,
    studio: "MAPPA",
    type: "TV",
    tags: ["Cursed Energy", "Sorcerers", "Dark", "Shonen"],
  },
  {
    malId: 1,
    title: "Cowboy Bebop",
    englishTitle: "Cowboy Bebop",
    description:
      "Bounty hunters travel through space on their ship the Bebop, chasing bounties and confronting their pasts.",
    genre: ["Action", "Adventure", "Comedy", "Sci-Fi"],
    year: 1998,
    rating: 8.75,
    episodes: 26,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/4/19644.jpg",
    bannerImage: "https://artworks.thetvdb.com/banners/v4/series/76885/backgrounds/5fc3c8cc37921.jpg",
    season: 1,
    studio: "Sunrise",
    type: "TV",
    tags: ["Space", "Bounty Hunters", "Jazz", "Classic"],
  },
  {
    malId: 11061,
    title: "Hunter x Hunter (2011)",
    englishTitle: "Hunter x Hunter",
    description:
      "Gon Freecss aspires to become a Hunter and find his father, but must first pass the dangerous Hunter Examination.",
    genre: ["Action", "Adventure", "Fantasy"],
    year: 2011,
    rating: 9.03,
    episodes: 148,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
    bannerImage: "https://artworks.thetvdb.com/banners/v4/series/252322/backgrounds/5f5db45c0c88d.jpg",
    season: 1,
    studio: "Madhouse",
    type: "TV",
    tags: ["Nen", "Adventure", "Friendship", "Shonen"],
  },
  {
    malId: 1575,
    title: "Code Geass: Hangyaku no Lelouch",
    englishTitle: "Code Geass: Lelouch of the Rebellion",
    description:
      "An exiled prince obtains a mysterious power called Geass and uses it to lead a rebellion against the Britannian Empire.",
    genre: ["Action", "Military", "Mecha", "Sci-Fi"],
    year: 2006,
    rating: 8.70,
    episodes: 25,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/5/50331.jpg",
    bannerImage: "https://artworks.thetvdb.com/banners/v4/series/79568/backgrounds/5fc5309b50b3b.jpg",
    season: 1,
    studio: "Sunrise",
    type: "TV",
    tags: ["Geass", "Rebellion", "Mecha", "Psychological"],
  },
  {
    malId: 9253,
    title: "Steins;Gate",
    englishTitle: "Steins;Gate",
    description:
      "A self-proclaimed mad scientist discovers time travel through a microwave and must deal with the consequences of altering the past.",
    genre: ["Sci-Fi", "Thriller", "Psychological"],
    year: 2011,
    rating: 9.07,
    episodes: 24,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/5/73199.jpg",
    bannerImage: "https://artworks.thetvdb.com/banners/v4/series/244061/backgrounds/5f5e8b88e98c4.jpg",
    season: 1,
    studio: "White Fox",
    type: "TV",
    tags: ["Time Travel", "Science", "Thriller", "Classic"],
  },
  {
    malId: 1735,
    title: "Naruto: Shippuden",
    englishTitle: "Naruto: Shippuden",
    description:
      "Naruto returns after two and a half years of training to face a greater threat to his village.",
    genre: ["Action", "Adventure", "Fantasy"],
    year: 2007,
    rating: 8.26,
    episodes: 500,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/1565/111305.jpg",
    bannerImage: "https://artworks.thetvdb.com/banners/v4/series/78857/backgrounds/5e5c3c3a7e42c.jpg",
    season: 1,
    studio: "Studio Pierrot",
    type: "TV",
    tags: ["Ninja", "Akatsuki", "Shonen", "Classic"],
  },
  {
    malId: 37999,
    title: "Kaguya-sama wa Kokurasetai: Tensai-tachi no Renai Zunousen",
    englishTitle: "Kaguya-sama: Love is War",
    description:
      "Two geniuses at an elite school are in love but both refuse to confess, leading to elaborate psychological schemes to make the other confess first.",
    genre: ["Comedy", "Romance", "School"],
    year: 2019,
    rating: 8.40,
    episodes: 12,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/1295/106551.jpg",
    bannerImage: "https://artworks.thetvdb.com/banners/v4/series/355869/backgrounds/5e2c3d8f3aa2d.jpg",
    season: 1,
    studio: "A-1 Pictures",
    type: "TV",
    tags: ["Romance", "Comedy", "School", "Psychological"],
  },
  {
    malId: 40456,
    title: "Kimetsu no Yaiba: Mugen Ressha-hen",
    englishTitle: "Demon Slayer: Mugen Train Arc",
    description:
      "Tanjiro and his friends join the Flame Hashira Rengoku on the Mugen Train to investigate a series of disappearances.",
    genre: ["Action", "Dark Fantasy", "Historical"],
    year: 2021,
    rating: 8.41,
    episodes: 7,
    status: "Finished",
    coverImage: "https://cdn.myanimelist.net/images/anime/1704/106947.jpg",
    bannerImage: "https://artworks.thetvdb.com/banners/v4/series/362696/backgrounds/5dd0ba536c718.jpg",
    season: 2,
    studio: "ufotable",
    type: "TV",
    tags: ["Demons", "Hashira", "Train", "Shonen"],
  },
];

// ─── Genre List ───────────────────────────────────────────────
export const GENRES = [
  "Action", "Adventure", "Comedy", "Dark Fantasy",
  "Fantasy", "Historical", "Mecha", "Military",
  "Mystery", "Psychological", "Romance", "Sci-Fi",
  "School", "Supernatural", "Thriller", "Superhero",
  "Post-Apocalyptic",
];

// ─── localStorage helpers ─────────────────────────────────────
const CONTINUE_WATCHING_KEY = "samurai_continue_watching";
const WATCH_HISTORY_KEY     = "samurai_watch_history";

export interface WatchProgress {
  malId: number;
  season: number;
  episode: number;
  timestamp: number;
  percent: number;
}

export function getContinueWatching(): WatchProgress[] {
  try {
    return JSON.parse(localStorage.getItem(CONTINUE_WATCHING_KEY) || "[]");
  } catch { return []; }
}

export function saveContinueWatching(progress: WatchProgress) {
  const list = getContinueWatching().filter((p) => p.malId !== progress.malId);
  list.unshift(progress);
  localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(list.slice(0, 20)));
}

export interface WatchHistoryEntry {
  malId: number;
  timestamp: number;
}

export function getWatchHistory(): WatchHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(WATCH_HISTORY_KEY) || "[]");
  } catch { return []; }
}

export function addToWatchHistory(malId: number) {
  const list = getWatchHistory().filter((h) => h.malId !== malId);
  list.unshift({ malId, timestamp: Date.now() });
  localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
}

export function getRecommendations(watchedMalIds: number[]): AnimeEntry[] {
  if (watchedMalIds.length === 0) {
    return LIBRARY_ANIME.filter(
      (a) => !FEATURED_ANIME.map((f) => f.malId).includes(a.malId)
    ).slice(0, 6);
  }
  const watchedGenres = new Set<string>();
  watchedMalIds.forEach((id) => {
    LIBRARY_ANIME.find((a) => a.malId === id)?.genre.forEach((g) =>
      watchedGenres.add(g)
    );
  });
  return LIBRARY_ANIME.filter((a) => !watchedMalIds.includes(a.malId))
    .map((a) => ({
      anime: a,
      score: a.genre.filter((g) => watchedGenres.has(g)).length,
    }))
    .sort((a, b) => b.score - a.score || b.anime.rating - a.anime.rating)
    .slice(0, 8)
    .map((x) => x.anime);
}
