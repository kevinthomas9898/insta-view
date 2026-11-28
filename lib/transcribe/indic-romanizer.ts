import { TranscriptSegment } from './whisper';

/**
 * Detects if text contains Devanagari (Hindi) or Gujarati Unicode scripts.
 */
export function containsIndicScript(text: string): boolean {
  if (!text) return false;
  // \u0900-\u097F: Devanagari (Hindi, Marathi, Sanskrit)
  // \u0A80-\u0AFF: Gujarati
  return /[\u0900-\u097F\u0A80-\u0AFF]/.test(text);
}

const DEVA_VOWELS: Record<string, string> = {
  '\u0905': 'a', '\u0906': 'aa', '\u0907': 'i', '\u0908': 'ee', '\u0909': 'u', '\u090A': 'oo',
  '\u090F': 'e', '\u0910': 'ai', '\u0913': 'o', '\u0914': 'au'
};

const DEVA_MATRAS: Record<string, string> = {
  '\u093E': 'aa', '\u093F': 'i', '\u0940': 'ee', '\u0941': 'u', '\u0942': 'oo',
  '\u0947': 'e', '\u0948': 'ai', '\u094B': 'o', '\u094C': 'au',
  '\u0902': 'n', '\u0901': 'n', '\u0903': 'h'
};

const DEVA_CONSONANTS: Record<string, string> = {
  '\u0915': 'k', '\u0916': 'kh', '\u0917': 'g', '\u0918': 'gh',
  '\u091A': 'ch', '\u091B': 'chh', '\u091C': 'j', '\u091D': 'jh',
  '\u091F': 't', '\u0920': 'th', '\u0921': 'd', '\u0922': 'dh', '\u0923': 'n',
  '\u0924': 't', '\u0925': 'th', '\u0926': 'd', '\u0927': 'dh', '\u0928': 'n',
  '\u092A': 'p', '\u092B': 'ph', '\u092C': 'b', '\u092D': 'bh', '\u092E': 'm',
  '\u092F': 'y', '\u0930': 'r', '\u0932': 'l', '\u0935': 'v',
  '\u0936': 'sh', '\u0937': 'sh', '\u0938': 's', '\u0939': 'h'
};

const GUJ_VOWELS: Record<string, string> = {
  '\u0A85': 'a', '\u0A86': 'aa', '\u0A87': 'i', '\u0A88': 'ee', '\u0A89': 'u', '\u0A8A': 'oo',
  '\u0A8F': 'e', '\u0A90': 'ai', '\u0A93': 'o', '\u0A94': 'au'
};

const GUJ_MATRAS: Record<string, string> = {
  '\u0ABE': 'aa', '\u0ABF': 'i', '\u0AC0': 'ee', '\u0AC1': 'u', '\u0AC2': 'oo',
  '\u0AC7': 'e', '\u0AC8': 'ai', '\u0ACB': 'o', '\u0ACC': 'au',
  '\u0A82': 'n', '\u0A81': 'n', '\u0A83': 'h'
};

const GUJ_CONSONANTS: Record<string, string> = {
  '\u0A95': 'k', '\u0A96': 'kh', '\u0A97': 'g', '\u0A98': 'gh',
  '\u0A9A': 'ch', '\u0A9B': 'chh', '\u0A9C': 'j', '\u0A9D': 'jh',
  '\u0A9F': 't', '\u0AA0': 'th', '\u0AA1': 'd', '\u0AA2': 'dh', '\u0AA3': 'n',
  '\u0AA4': 't', '\u0AA5': 'th', '\u0AA6': 'd', '\u0AA7': 'dh', '\u0AA8': 'n',
  '\u0AAA': 'p', '\u0AAB': 'ph', '\u0AAC': 'b', '\u0AAD': 'bh', '\u0AAE': 'm',
  '\u0AAF': 'y', '\u0AB0': 'r', '\u0AB2': 'l', '\u0AB5': 'v',
  '\u0AB6': 'sh', '\u0AB7': 'sh', '\u0AB8': 's', '\u0AB9': 'h', '\u0AB3': 'l'
};

const DEVA_HALANT = '\u094D';
const GUJ_HALANT = '\u0ACD';

/**
 * Deterministic pure-JS transliterator for Devanagari and Gujarati words.
 * Acts as an instant offline/fail-safe Romanizer.
 */
export function deterministicIndicRomanizer(text: string): string {
  if (!text) return '';
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (DEVA_VOWELS[ch]) {
      out += DEVA_VOWELS[ch];
    } else if (GUJ_VOWELS[ch]) {
      out += GUJ_VOWELS[ch];
    } else if (DEVA_CONSONANTS[ch]) {
      out += DEVA_CONSONANTS[ch];
      if (next === DEVA_HALANT) {
        i++;
      } else if (DEVA_MATRAS[next]) {
        out += DEVA_MATRAS[next];
        i++;
      } else if (next && DEVA_CONSONANTS[next]) {
        out += 'a';
      }
    } else if (GUJ_CONSONANTS[ch]) {
      out += GUJ_CONSONANTS[ch];
      if (next === GUJ_HALANT) {
        i++;
      } else if (GUJ_MATRAS[next]) {
        out += GUJ_MATRAS[next];
        i++;
      } else if (next && GUJ_CONSONANTS[next]) {
        out += 'a';
      }
    } else if (DEVA_MATRAS[ch]) {
      out += DEVA_MATRAS[ch];
    } else if (GUJ_MATRAS[ch]) {
      out += GUJ_MATRAS[ch];
    } else {
      out += ch;
    }
  }
  return out;
}

export interface IndicProcessResult {
  hinglishSegments: TranscriptSegment[];
  hinglishText: string;
  translatedText: string;
}

/**
 * Transliterates Hindi/Gujarati to Hinglish/Gujlish (English letters)
 * and generates exact fluent English translation using Groq's high-speed neural models.
 */
export async function romanizeAndTranslateIndic(
  segments: TranscriptSegment[],
  fullText: string,
  groqApiKey: string
): Promise<IndicProcessResult> {
  const lineTexts = segments.map((s) => s.text);

  try {
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
              'Given a JSON array of spoken lines from an Indian Instagram reel (which may contain Hindi, Gujarati, English, or a mix of all three switching mid-sentence):\n' +
              'Return a JSON object with two fields:\n' +
              '1. "hinglish": array of strings of the exact same length. Rules:\n' +
              '   - English words MUST stay in English exactly as spoken (do NOT translate them)\n' +
              '   - Hindi in Devanagari → write in natural Hinglish (Roman/Latin alphabet phonetically). E.g. "मेरी saas ने" → "Meri saas ne"\n' +
              '   - Gujarati script → write in natural Gujlish (Roman/Latin alphabet phonetically)\n' +
              '   - If a line is entirely English, keep it exactly as-is\n' +
              '   - Preserve code-mixing naturally: "My mother-in-law ने मुझे लाल nighty दिखाई" → "My mother-in-law ne mujhe laal nighty dikhai"\n' +
              '2. "translation": array of strings of the exact same length where each line is translated accurately and fluently into natural English.\n' +
              'Never omit any line. Keep array lengths identical to input lines. Never add extra lines.',
          },
          {
            role: 'user',
            content: JSON.stringify({ lines: lineTexts }),
          },
        ],
      }),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        const hinglishArr: string[] = Array.isArray(parsed.hinglish) ? parsed.hinglish : [];
        const translationArr: string[] = Array.isArray(parsed.translation) ? parsed.translation : [];

        const updatedSegments: TranscriptSegment[] = segments.map((seg, idx) => {
          const romanized = hinglishArr[idx] || deterministicIndicRomanizer(seg.text);
          const translated = translationArr[idx] || romanized;
          return {
            ...seg,
            originalText: seg.text,
            text: romanized,
            translatedText: translated,
          };
        });

        const hinglishFullText = updatedSegments.map((s) => s.text).join(' ');
        const translatedFullText = updatedSegments.map((s) => s.translatedText || s.text).join(' ');

        return {
          hinglishSegments: updatedSegments,
          hinglishText: hinglishFullText,
          translatedText: translatedFullText,
        };
      }
    }
  } catch (err) {
    console.warn('[Indic Transliteration] Groq translation call failed, falling back to deterministic romanizer:', err);
  }

  // Fallback: Pure-JS deterministic transliterator
  const fallbackSegments: TranscriptSegment[] = segments.map((seg) => {
    const romanized = deterministicIndicRomanizer(seg.text);
    return {
      ...seg,
      originalText: seg.text,
      text: romanized,
      translatedText: romanized,
    };
  });

  const fallbackText = fallbackSegments.map((s) => s.text).join(' ');
  return {
    hinglishSegments: fallbackSegments,
    hinglishText: fallbackText,
    translatedText: fallbackText,
  };
}
