import fs from 'fs';
import path from 'path';

// Load .env.local if present
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=');
      process.env[k.trim()] = v.join('=').trim();
    }
  });
}

import { InstagramService } from '../lib/instagram/services/instagram.service';

async function testScraperApiLive() {
  console.log('--- Testing Live ScraperAPI Provider for shraddhakapoor ---');
  
  // 1. Profile
  console.log('1. Fetching Profile...');
  const prof = await InstagramService.getProfile('shraddhakapoor');
  console.log('Profile Success:', prof.success);
  if (!prof.success) throw new Error('Profile failed: ' + JSON.stringify(prof.error));
  console.log('Username:', prof.data?.username);
  console.log('Full Name:', prof.data?.fullName);
  console.log('Followers:', prof.data?.followers);
  console.log('Provider:', prof.metadata?.provider);

  // 2. Posts
  console.log('\n2. Fetching Posts...');
  const posts = await InstagramService.getPosts('shraddhakapoor');
  console.log('Posts Success:', posts.success);
  if (!posts.success) throw new Error('Posts failed: ' + JSON.stringify(posts.error));
  console.log('Posts Count:', posts.data?.length);
  const p1 = posts.data?.[0];
  console.log('Post 1 Type:', p1?.type);
  console.log('Post 1 Download URL:', p1?.downloadUrl);
  if (p1?.type === 'carousel') {
    console.log('Post 1 Carousel slides count:', p1.carouselMedia?.length);
    console.log('Post 1 Slide 1 download URL:', p1.carouselMedia?.[0]?.downloadUrl);
  }

  // 3. Reels
  console.log('\n3. Fetching Reels...');
  const reels = await InstagramService.getReels('shraddhakapoor');
  console.log('Reels Success:', reels.success);
  if (!reels.success) throw new Error('Reels failed: ' + JSON.stringify(reels.error));
  console.log('Reels Count:', reels.data?.length);
  console.log('Reel 1 URL:', reels.data?.[0]?.url?.slice(0, 80));

  // 4. Highlights
  console.log('\n4. Fetching Highlights...');
  const highlights = await InstagramService.getHighlights('shraddhakapoor');
  console.log('Highlights Success:', highlights.success);
  if (!highlights.success) throw new Error('Highlights failed: ' + JSON.stringify(highlights.error));
  console.log('Highlights Count:', highlights.data?.length);
  console.log('Highlight 1 Title:', highlights.data?.[0]?.title);

  console.log('\n=============================================');
  console.log('ALL LIVE SCRAPERAPI ENDPOINTS SUCCEEDED 100%!');
  console.log('=============================================');
}

testScraperApiLive().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
