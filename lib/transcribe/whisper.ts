import { globalCache, CACHE_TTL } from '@/lib/cache';
import { extractReelStreamUrl } from './media-resolver';
import { formatTranscriptToParagraphs } from './formatter';
import { containsIndicScript, romanizeAndTranslateIndic, deterministicIndicRomanizer } from './indic-romanizer';

export interface TranscriptSegment {
  id?: number;
  start: number;
  end: number;
  text: string;
  translatedText?: string;
  originalText?: string;
}

export interface TranscriptResult {
  text: string;
  translatedText?: string;
  language: string;
  duration?: number;
  segments: TranscriptSegment[];
  fromCache?: boolean;
  provider: 'groq' | 'fallback';
  hasTranslation?: boolean;
}

/**
 * Transcribes audio/video media using Groq's high-speed Whisper Large v3 Turbo API.
 * Includes intelligent caching and seamless development fallback.
 */
export async function transcribeMedia(
  mediaUrl: string,
  cacheKeyId?: string,
  captionHint?: string
): Promise<TranscriptResult> {
  // Use v7 cache key to ensure any stale English hallucinations are cleared
  const cacheKey = cacheKeyId
    ? `transcript:v7:${cacheKeyId}`
    : `transcript:v7:${encodeURIComponent(mediaUrl.slice(0, 100))}`;
  
  // 1. Check in-memory cache
  const cached = globalCache.get<TranscriptResult>(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  const groqApiKey = process.env.GROQ_API_KEY;

  // 2. If Groq API Key is available, execute live high-speed transcription
  if (groqApiKey) {
    try {
      let targetUrl = mediaUrl;
      const isLikelyImage = targetUrl.includes('.jpg') || targetUrl.includes('.jpeg') || targetUrl.includes('.png');
      const isDummyUrl = targetUrl.includes('flower.mp4') || targetUrl.includes('interactive-examples') || targetUrl.includes('pexels');
      const isDash = targetUrl.includes('dashinit');
      const isMetaCdn = targetUrl.includes('fbcdn.net') || targetUrl.includes('cdninstagram.com');

      // If mediaUrl is missing, dummy, or not from Meta CDN, resolve genuine progressive stream
      if (cacheKeyId && (!targetUrl || isLikelyImage || isDummyUrl || isDash || !isMetaCdn)) {
        const streamUrl = await extractReelStreamUrl(cacheKeyId);
        if (streamUrl) {
          targetUrl = streamUrl;
        }
      }

      // Fetch media buffer (with safety timeout and size check)
      const mediaResponse = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://www.instagram.com/',
        },
        signal: AbortSignal.timeout(25000), // 25s timeout
      });

      if (!mediaResponse.ok) {
        throw new Error(`Failed to fetch media file for transcription: ${mediaResponse.statusText}`);
      }

      const mediaBlob = await mediaResponse.blob();
      
      // Enforce 25MB max size limit for speech API
      if (mediaBlob.size > 25 * 1024 * 1024) {
        throw new Error('Media file exceeds the 25MB transcription limit.');
      }

      /**
       * Calls Groq Whisper Large v3 (full 32-layer model) without prompt biasing.
       */
      const callWhisper = async (lang?: string) => {
        const fd = new FormData();
        fd.append('file', mediaBlob, 'audio.mp4');
        fd.append('model', 'whisper-large-v3');
        fd.append('response_format', 'verbose_json');
        fd.append('temperature', '0');
        if (lang) {
          fd.append('language', lang);
        }
        // Never pass a Romanized prompt: prompts force Whisper to decode into that script/language.

        const resp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${groqApiKey}` },
          body: fd,
          signal: AbortSignal.timeout(30000),
        });

        if (!resp.ok) {
          const errorText = await resp.text();
          console.warn(`[Transcription] Groq Whisper (lang=${lang || 'auto'}) error:`, errorText);
          throw new Error(`Groq Whisper API error: ${resp.status}`);
        }

        return resp.json();
      };

      // PASS 1: Natural Auto-detect (captures clean multilingual speech)
      console.log('[Transcription] Pass 1: Whisper Large v3 auto-detect');
      let data = await callWhisper();
      let rawFullText = data.text?.trim() || '';

      // PASS 2: If no Indic script detected, verify whether spoken Hindi was misclassified as English
      // In code-mixed reels (starts in English, switches to Hindi), Whisper auto-detect sometimes
      // locks to English from the first few seconds. Running a Hindi verification pass checks if
      // the audio actually contains spoken Hindi in Devanagari.
      if (!containsIndicScript(rawFullText)) {
        try {
          console.log('[Transcription] No Indic script in auto-detect, running Hindi verification pass...');
          const hiData = await callWhisper('hi');
          const hiText = hiData.text?.trim() || '';
          if (containsIndicScript(hiText)) {
            console.log('[Transcription] Hindi verification pass detected genuine Hindi speech in Devanagari!');
            data = hiData;
            rawFullText = hiText;
          }
        } catch (e) {
          console.warn('[Transcription] Hindi verification pass error, keeping initial result:', e);
        }
      }

      let segments: TranscriptSegment[] = (data.segments || []).map(
        (s: { start: number; end: number; text: string }, idx: number) => ({
          id: idx,
          start: Math.round(s.start * 10) / 10,
          end: Math.round(s.end * 10) / 10,
          text: s.text.trim(),
        })
      );

      let translatedText: string | undefined = undefined;
      let hasTranslation = false;

      // When Devanagari (Hindi) or Gujarati script is present, run Qwen transliteration:
      // - English parts stay in English
      // - Hindi parts become natural conversational Hinglish
      // - Gujarati parts become natural Gujlish
      // - Generates exact fluent English translation
      if (containsIndicScript(rawFullText) || data.language === 'hi' || data.language === 'gu') {
        console.log(`[Transcription] Running Qwen transliteration pipeline for code-mixed speech...`);
        const indicResult = await romanizeAndTranslateIndic(segments, rawFullText, groqApiKey);
        segments = indicResult.hinglishSegments;
        rawFullText = indicResult.hinglishText;
        translatedText = indicResult.translatedText;
        hasTranslation = Boolean(translatedText && translatedText.toLowerCase() !== rawFullText.toLowerCase());
      }

      const formattedText = formatTranscriptToParagraphs(segments, rawFullText);
      const formattedTranslation = translatedText
        ? formatTranscriptToParagraphs(
            segments.map((s) => ({ ...s, text: s.translatedText || s.text })),
            translatedText
          )
        : undefined;

      const result: TranscriptResult = {
        text: formattedText,
        translatedText: formattedTranslation,
        language: data.language || 'en',
        duration: data.duration || 0,
        segments,
        hasTranslation,
        provider: 'groq',
      };

      // Cache genuine groq transcript for 24 hours
      globalCache.set(cacheKey, result, CACHE_TTL.TRANSCRIPT);
      return result;
    } catch (err) {
      console.error('[Transcription] Groq live transcription failed, falling back to smart generator:', err);
    }
  }

  // 3. Fallback / Dev Mock: Generate realistic transcript from caption and timing (short 60s cache for fallbacks)
  const fallbackResult = generateFallbackTranscript(captionHint);
  globalCache.set(cacheKey, fallbackResult, 60);
  return fallbackResult;
}

/**
 * Creates realistic transcript segments for development, testing, and fallback.
 */
function generateFallbackTranscript(captionHint?: string): TranscriptResult {
  const cleanCaption = (captionHint || '').replace(/#[a-zA-Z0-9_]+/g, '').trim();
  
  if (cleanCaption && cleanCaption.length > 20) {
    const isIndic = containsIndicScript(cleanCaption);
    const romanizedCaption = isIndic ? deterministicIndicRomanizer(cleanCaption) : cleanCaption;
    const sentences = romanizedCaption.split(/[.!?\n]+/).map(s => s.trim()).filter(Boolean);
    let currentTime = 0;
    const segments: TranscriptSegment[] = sentences.slice(0, 8).map((sentence, idx) => {
      const duration = Math.max(2.5, Math.min(6, sentence.split(' ').length * 0.4));
      const seg: TranscriptSegment = {
        id: idx,
        start: Math.round(currentTime * 10) / 10,
        end: Math.round((currentTime + duration) * 10) / 10,
        text: sentence,
      };
      currentTime += duration + 0.3;
      return seg;
    });

    return {
      text: romanizedCaption,
      language: isIndic ? 'hi' : 'en',
      duration: Math.round(currentTime * 10) / 10,
      segments,
      hasTranslation: false,
      provider: 'fallback',
    };
  }

  // Default demo spoken transcript
  const demoLines = [
    'Hey guys, welcome back to my channel! Today I want to show you this amazing trick.',
    'A lot of you have been asking about how to do this consistently without losing quality.',
    'Step one is to make sure you have everything saved in high resolution.',
    'Then, apply the custom preset we talked about in the last video.',
    'Drop a comment down below if this helped you out, and make sure to follow for part two!',
  ];

  let currentTime = 0;
  const segments: TranscriptSegment[] = demoLines.map((line, idx) => {
    const duration = Math.max(2.8, line.split(' ').length * 0.35);
    const seg = {
      id: idx,
      start: Math.round(currentTime * 10) / 10,
      end: Math.round((currentTime + duration) * 10) / 10,
      text: line,
    };
    currentTime += duration + 0.4;
    return seg;
  });

  return {
    text: demoLines.join(' '),
    language: 'en',
    duration: Math.round(currentTime * 10) / 10,
    segments,
    provider: 'fallback',
  };
}
