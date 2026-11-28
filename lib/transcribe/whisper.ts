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
  const cacheKey = cacheKeyId ? `transcript:${cacheKeyId}` : `transcript:${encodeURIComponent(mediaUrl.slice(0, 100))}`;
  
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

      // If mediaUrl is an image, dummy placeholder, DASH manifest, or not from Meta CDN, resolve genuine progressive stream
      if (cacheKeyId && (!targetUrl || isLikelyImage || isDummyUrl || isDash || !targetUrl.includes('fbcdn.net'))) {
        const streamUrl = await extractReelStreamUrl(cacheKeyId);
        if (streamUrl) {
          targetUrl = streamUrl;
        }
      } else if (!targetUrl || isLikelyImage || isDummyUrl || isDash || !targetUrl.includes('.mp4')) {
        const streamUrl = await extractReelStreamUrl(cacheKeyId || targetUrl);
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

      // ─── LANGUAGE-AWARE WHISPER STRATEGY ───────────────────────────────
      // Indian Instagram reels are almost always code-mixed (Hindi + English,
      // Gujarati + English, or all three).  Whisper with auto-detect picks
      // the FIRST language it hears, then hallucinates garbage for every
      // segment in the other language.
      //
      // Fix: ALWAYS run Whisper with language='hi' first.  Hindi-mode Whisper
      // captures English words inside Hindi speech accurately (they appear in
      // Devanagari phonetics or stay Latin), and Qwen converts everything to
      // clean Hinglish + English translation.  If the 'hi' pass produces
      // suspiciously little text (pure-English reel), fall back to auto-detect.
      // ────────────────────────────────────────────────────────────────────

      /**
       * Calls Groq Whisper and returns raw response JSON.
       */
      const callWhisper = async (lang?: string) => {
        const fd = new FormData();
        fd.append('file', mediaBlob, 'audio.mp4');
        fd.append('model', 'whisper-large-v3-turbo');
        fd.append('response_format', 'verbose_json');
        fd.append('temperature', '0');
        if (lang) {
          fd.append('language', lang);
        }
        // Hindi-mode prompt primes the decoder for code-mixed vocabulary
        fd.append(
          'prompt',
          lang === 'hi'
            ? 'Yeh ek Indian Instagram reel hai jismein Hindi aur English dono mili hui hai. Hindi, Hinglish, Gujarati, English code-mixed speech. Transcribe sab kuch accurately.'
            : 'Multilingual Indian Instagram reel. Hindi, Gujarati, Hinglish, Gujlish, English code-mixed conversation.'
        );

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

      // PASS 1: Always try Hindi first — it captures code-mixed speech accurately
      let data: any;
      let usedHindiPass = false;

      try {
        console.log('[Transcription] Pass 1: Whisper with language=hi (captures code-mixed Hindi+English)');
        data = await callWhisper('hi');
        usedHindiPass = true;

        // Safety check: if Hindi-mode produced very little text relative to
        // audio duration, the reel is probably pure English — fall back
        const hiText = data.text?.trim() || '';
        const hiDuration = data.duration || 0;
        const wordsPerSecond = hiText.split(/\s+/).filter(Boolean).length / Math.max(1, hiDuration);

        if (hiText.length < 10 || (hiDuration > 10 && wordsPerSecond < 0.3)) {
          console.log('[Transcription] Hindi pass produced very little text, retrying with auto-detect');
          try {
            data = await callWhisper();
            usedHindiPass = false;
          } catch {
            // Keep Hindi result if auto-detect also fails
          }
        }
      } catch {
        // Hindi pass failed — fall back to auto-detect
        console.log('[Transcription] Hindi pass failed, falling back to auto-detect');
        data = await callWhisper();
        usedHindiPass = false;
      }

      let segments: TranscriptSegment[] = (data.segments || []).map(
        (s: { start: number; end: number; text: string }, idx: number) => ({
          id: idx,
          start: Math.round(s.start * 10) / 10,
          end: Math.round(s.end * 10) / 10,
          text: s.text.trim(),
        })
      );

      let rawFullText = data.text?.trim() || '';
      let translatedText: string | undefined = undefined;
      let hasTranslation = false;

      // ALWAYS run Qwen post-processing for any transcript that contains
      // Devanagari/Gujarati script, was transcribed in Hindi mode, or whose
      // language was detected as Hindi/Gujarati.  This converts:
      //   - Devanagari → natural Hinglish (Roman)
      //   - English words that got Devanagari-ified → back to English
      //   - Generates exact fluent English translation
      const needsIndicProcessing =
        containsIndicScript(rawFullText) ||
        usedHindiPass ||
        data.language === 'hi' ||
        data.language === 'gu';

      if (needsIndicProcessing) {
        console.log(`[Transcription] Running Qwen transliteration pipeline (lang=${data.language}, hindiPass=${usedHindiPass})`);
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
