import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const content = fs.readFileSync(envPath, 'utf8');
const groqApiKey = content.split('\n').find(l => l.startsWith('GROQ_API_KEY='))?.split('=')[1]?.trim();

const sampleLines = [
  "My mother in law took me out for shopping before my marriage to this red lacy nightwear.",
  "वैसे लाल लाल nighty के सामने खड़ा कर दिया मुझे। बोले चुनो। क्या चुनु? है ही क्या इसमें चुनने के लिए?",
  "यह ऐसे खुल जाता है, वैसे खुल जाता है। फूंक मारो खुल जाता है।",
  "इकलौती ऐसी दुकान है जो कह रही है यह बिल्कुल durable नहीं है। यू फट जाता है।",
  "भाई उसमें क्या कह रहा है ये slip off है। आपको क्या लग रहा है 10 साल से बिना slip करे मामला चल रहा है?",
  "It is extremely extremely uncomfortable and for me it doesn't serve any purpose.",
  "मैं उसको कैसे बताऊं कि आप किसी आदमी से इतनी मोहब्बत करते हो, उसकी मां की आंखों में आंखें डाल के कैसे कहोगे कि आपके बेटे का जब mood कर जाता है ना वो दांत से नाड़ा खोल लेता है। मुझे जरूरत नहीं है इसकी।"
];

async function test() {
  console.log('Testing Qwen on exact reel text...');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      response_format: { type: 'json_object' },
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert Indic multilingual speech transliterator and translator.\n' +
            'Given a JSON array of spoken lines from an Instagram reel (which may contain Hindi, Gujarati, English, or a mix of all three):\n' +
            'Return a JSON object with two fields:\n' +
            '1. "hinglish": array of strings of the exact same length where Hindi is written in natural conversational Hinglish (Roman/Latin alphabet), Gujarati is written in natural Gujlish (Roman/Latin alphabet), and English words remain in English. Keep code-mixing natural and phonetic.\n' +
            '2. "translation": array of strings of the exact same length where each line is translated accurately and fluently into English.\n' +
            'Never omit any line. Keep array lengths identical to input lines.',
        },
        {
          role: 'user',
          content: JSON.stringify({ lines: sampleLines }),
        },
      ],
    }),
  });

  console.log('Status:', res.status);
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  console.log('--- HINGLISH ---');
  parsed.hinglish.forEach((l: string, i: number) => console.log(`[${i+1}] ${l}`));
  console.log('\n--- TRANSLATION ---');
  parsed.translation.forEach((l: string, i: number) => console.log(`[${i+1}] ${l}`));
}

test();
