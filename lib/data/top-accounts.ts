/**
 * Curated Top 50 Most Viewed & Followed Instagram Accounts
 * Organized by category for quick 1-click discovery.
 */

export interface TopAccount {
  username: string;
  name: string;
  category: 'trending' | 'sports' | 'music' | 'cinema' | 'creators';
  badge?: string;
}

export const TOP_CATEGORIES = [
  { id: 'trending', label: '🔥 Trending' },
  { id: 'sports', label: '⚽ Sports' },
  { id: 'music', label: '🎵 Music' },
  { id: 'cinema', label: '🎬 Cinema & TV' },
  { id: 'creators', label: '🌍 Creators & Brands' },
] as const;

export type TopCategoryId = (typeof TOP_CATEGORIES)[number]['id'];

export const TOP_ACCOUNTS: TopAccount[] = [
  // --- Trending Top 10 ---
  { username: 'cristiano', name: 'Cristiano Ronaldo', category: 'trending', badge: '640M' },
  { username: 'leomessi', name: 'Lionel Messi', category: 'trending', badge: '504M' },
  { username: 'selenagomez', name: 'Selena Gomez', category: 'trending', badge: '425M' },
  { username: 'kyliejenner', name: 'Kylie Jenner', category: 'trending', badge: '397M' },
  { username: 'therock', name: 'Dwayne Johnson', category: 'trending', badge: '395M' },
  { username: 'arianagrande', name: 'Ariana Grande', category: 'trending', badge: '377M' },
  { username: 'kimkardashian', name: 'Kim Kardashian', category: 'trending', badge: '361M' },
  { username: 'beyonce', name: 'Beyoncé', category: 'trending', badge: '316M' },
  { username: 'khloekardashian', name: 'Khloé Kardashian', category: 'trending', badge: '307M' },
  { username: 'nike', name: 'Nike', category: 'trending', badge: '304M' },

  // --- Sports ---
  { username: 'neymarjr', name: 'Neymar Jr', category: 'sports', badge: '224M' },
  { username: 'realmadrid', name: 'Real Madrid C.F.', category: 'sports', badge: '165M' },
  { username: 'fcbarcelona', name: 'FC Barcelona', category: 'sports', badge: '130M' },
  { username: 'championsleague', name: 'UEFA Champions League', category: 'sports', badge: '115M' },
  { username: 'virat.kohli', name: 'Virat Kohli', category: 'sports', badge: '271M' },
  { username: 'kingjames', name: 'LeBron James', category: 'sports', badge: '159M' },
  { username: 'k.mbappe', name: 'Kylian Mbappé', category: 'sports', badge: '122M' },
  { username: 'davidbeckham', name: 'David Beckham', category: 'sports', badge: '88M' },
  { username: 'ronaldinho', name: 'Ronaldinho', category: 'sports', badge: '77M' },
  { username: 'karimbenzema', name: 'Karim Benzema', category: 'sports', badge: '76M' },

  // --- Music ---
  { username: 'taylorswift', name: 'Taylor Swift', category: 'music', badge: '283M' },
  { username: 'justinbieber', name: 'Justin Bieber', category: 'music', badge: '293M' },
  { username: 'billieeilish', name: 'Billie Eilish', category: 'music', badge: '120M' },
  { username: 'badbunnypr', name: 'Bad Bunny', category: 'music', badge: '46M' },
  { username: 'dualipa', name: 'Dua Lipa', category: 'music', badge: '88M' },
  { username: 'shakira', name: 'Shakira', category: 'music', badge: '91M' },
  { username: 'cardib', name: 'Cardi B', category: 'music', badge: '166M' },
  { username: 'champagnepapi', name: 'Drake', category: 'music', badge: '144M' },
  { username: 'jlo', name: 'Jennifer Lopez', category: 'music', badge: '251M' },
  { username: 'bts.bighitofficial', name: 'BTS Official', category: 'music', badge: '74M' },

  // --- Cinema & TV ---
  { username: 'shraddhakapoor', name: 'Shraddha Kapoor', category: 'cinema', badge: '93M' },
  { username: 'aliaabhatt', name: 'Alia Bhatt', category: 'cinema', badge: '85M' },
  { username: 'zendaya', name: 'Zendaya', category: 'cinema', badge: '182M' },
  { username: 'priyankachopra', name: 'Priyanka Chopra', category: 'cinema', badge: '91M' },
  { username: 'tomholland2013', name: 'Tom Holland', category: 'cinema', badge: '66M' },
  { username: 'vindiesel', name: 'Vin Diesel', category: 'cinema', badge: '102M' },
  { username: 'deepikapadukone', name: 'Deepika Padukone', category: 'cinema', badge: '80M' },
  { username: 'milliebobbybrown', name: 'Millie Bobby Brown', category: 'cinema', badge: '63M' },
  { username: 'gal_gadot', name: 'Gal Gadot', category: 'cinema', badge: '108M' },
  { username: 'emmawatson', name: 'Emma Watson', category: 'cinema', badge: '75M' },

  // --- Creators, Nature & Brands ---
  { username: 'mrbeast', name: 'MrBeast', category: 'creators', badge: '61M' },
  { username: 'natgeo', name: 'National Geographic', category: 'creators', badge: '281M' },
  { username: 'nasa', name: 'NASA', category: 'creators', badge: '97M' },
  { username: 'khaby00', name: 'Khaby Lame', category: 'creators', badge: '80M' },
  { username: 'charlidamelio', name: 'Charli D’Amelio', category: 'creators', badge: '46M' },
  { username: 'nasawebb', name: 'NASA Webb Telescope', category: 'creators', badge: '3.6M' },
  { username: 'discovery', name: 'Discovery', category: 'creators', badge: '22M' },
  { username: 'redbull', name: 'Red Bull', category: 'creators', badge: '21M' },
  { username: 'apple', name: 'Apple', category: 'creators', badge: '33M' },
  { username: 'gucci', name: 'Gucci', category: 'creators', badge: '52M' },
];
