import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const content = fs.readFileSync(envPath, 'utf8');
const key = content.split('\n').find(l => l.startsWith('GROQ_API_KEY='))?.split('=')[1]?.trim();

async function check() {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` }
    });
    const d = await res.json();
    console.log('STATUS:', res.status);
    console.log('WHISPER MODELS:', d.data?.filter((m: any) => m.id.includes('whisper')).map((m: any) => m.id));
  } catch (err) {
    console.error(err);
  }
}

check();
