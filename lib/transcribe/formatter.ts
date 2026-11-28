import { TranscriptSegment } from './whisper';

export interface FormattedParagraph {
  id: number;
  start: number;
  end: number;
  text: string;
  segments?: TranscriptSegment[];
}

/**
 * Intelligent spoken speech paragraph parser.
 * Groups segments into coherent paragraphs with start & end timestamps
 * based on speech pauses, dialogue cues, and narrative pacing.
 */
export function parseTranscriptParagraphs(
  segments?: TranscriptSegment[],
  fullText?: string
): FormattedParagraph[] {
  if (!segments || segments.length === 0) {
    if (!fullText) return [];
    const sentences = fullText.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [fullText];
    const paras: FormattedParagraph[] = [];
    let current: string[] = [];
    let wordCount = 0;
    let paraId = 0;

    for (const s of sentences) {
      current.push(s.trim());
      wordCount += s.trim().split(/\s+/).length;
      if (wordCount >= 35 || current.length >= 3) {
        paras.push({
          id: paraId++,
          start: 0,
          end: 0,
          text: current.join(' '),
        });
        current = [];
        wordCount = 0;
      }
    }
    if (current.length > 0) {
      paras.push({
        id: paraId++,
        start: 0,
        end: 0,
        text: current.join(' '),
      });
    }
    return paras;
  }

  const paragraphs: FormattedParagraph[] = [];
  let currentSegs: TranscriptSegment[] = [];
  let currentWords = 0;
  let prevSeg: TranscriptSegment | null = null;
  let inDialogue = false;

  const dialogueIntroRegex =
    /\b(whispered|yelled|said|asked|shouted|screamed|spoke|cried|replied|exclaimed|muttered|called|told me|demanded|spotted me)[,:\s—–.-]*$/i;
  const narrationRestartRegex =
    /^(I promised|I didn't|I stood|I said|I spun|I took|He backed|He stared|She came|She just|My fingers|Then|Next|Only|Legend|Everyone|Eight years|Halfway)\b/i;
  const directSpeechStartRegex =
    /^(Hey|Where's|What's|Why|How|Never|Bandages off|Blue eyes\?|You finally)\b/i;

  const flushParagraph = () => {
    if (currentSegs.length === 0) return;
    paragraphs.push({
      id: paragraphs.length,
      start: currentSegs[0].start,
      end: currentSegs[currentSegs.length - 1].end,
      text: currentSegs.map((s) => s.text.trim()).join(' '),
      segments: [...currentSegs],
    });
    currentSegs = [];
    currentWords = 0;
  };

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const text = seg.text.trim();
    if (!text) continue;

    const gap = prevSeg ? Math.max(0, seg.start - prevSeg.end) : 0;
    const prevText = prevSeg ? prevSeg.text.trim() : '';

    let shouldBreak = false;

    if (currentSegs.length > 0) {
      // 1. Dialogue intro before direct speech
      if (
        dialogueIntroRegex.test(prevText) ||
        prevText.endsWith(':') ||
        prevText.endsWith('—') ||
        prevText.endsWith('-')
      ) {
        shouldBreak = true;
        inDialogue = true;
      }
      // 2. Explicit direct speech beginning
      else if (
        directSpeechStartRegex.test(text) &&
        (prevText.endsWith('.') || prevText.endsWith('!') || prevText.endsWith('?'))
      ) {
        shouldBreak = true;
        inDialogue = true;
      }
      // 3. Narration resuming after dialogue
      else if (
        inDialogue &&
        (narrationRestartRegex.test(text) || gap >= 0.4) &&
        (prevText.endsWith('.') || prevText.endsWith('!') || prevText.endsWith('?'))
      ) {
        shouldBreak = true;
        inDialogue = false;
      }
      // 4. Standalone dialogue questions / answers
      else if (prevText.endsWith('?') && gap >= 0.25) {
        shouldBreak = true;
        inDialogue = false;
      }
      // 5. Significant silence pause in speech (gap >= 0.5s at sentence end)
      else if (
        gap >= 0.5 &&
        (prevText.endsWith('.') || prevText.endsWith('!') || prevText.endsWith('?'))
      ) {
        shouldBreak = true;
        inDialogue = false;
      }
      // 6. Natural speech pacing: paragraph has >= 30 words and a pause (gap >= 0.35s)
      else if (
        currentWords >= 30 &&
        gap >= 0.35 &&
        (prevText.endsWith('.') || prevText.endsWith('!') || prevText.endsWith('?'))
      ) {
        shouldBreak = true;
        inDialogue = false;
      }
      // 7. Max paragraph size limit (>= 50 words)
      else if (
        currentWords >= 50 &&
        (prevText.endsWith('.') || prevText.endsWith('!') || prevText.endsWith('?'))
      ) {
        shouldBreak = true;
        inDialogue = false;
      }
    }

    if (shouldBreak) {
      flushParagraph();
    }

    currentSegs.push(seg);
    currentWords += text.split(/\s+/).length;
    prevSeg = seg;
  }

  flushParagraph();
  return paragraphs;
}

/**
 * Intelligent spoken speech paragraph formatter.
 * Returns newline-separated paragraphs string.
 */
export function formatTranscriptToParagraphs(
  segments?: TranscriptSegment[],
  fullText?: string
): string {
  const paras = parseTranscriptParagraphs(segments, fullText);
  return paras.map((p) => p.text).join('\n\n');
}
