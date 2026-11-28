import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');
const getEnv = (k: string) => lines.find(l => l.startsWith(k + '='))?.split('=')[1]?.trim();

const rapidApiKey = getEnv('INSTAGRAM_RAPIDAPI_KEY');
const rapidApiHost = getEnv('INSTAGRAM_RAPIDAPI_HOST') || 'instagram-scraper-api2.p.rapidapi.com';

async function getReelUrl() {
  console.log('Host:', rapidApiHost);
  const url = `https://${rapidApiHost}/v1/post_info?code_or_id_or_url=DgRZk8ktcGW`;
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': rapidApiKey || '',
      'X-RapidAPI-Host': rapidApiHost,
      'Accept': 'application/json'
    }
  });
  console.log('RapidAPI status:', res.status);
  const data = await res.json();
  const videoUrl = data?.data?.video_url || data?.result?.video_url || data?.video_versions?.[0]?.url;
  console.log('Found videoUrl:', Boolean(videoUrl));
  if (videoUrl) {
    fs.writeFileSync('scripts/test-video-url.txt', videoUrl);
    console.log('Video URL saved to scripts/test-video-url.txt');
  } else {
    console.log('Response keys:', Object.keys(data));
    console.log('Response sample:', JSON.stringify(data).slice(0, 300));
  }
}

getReelUrl();
