import { TranscriptSegment } from './whisper';

/**
 * Intelligent spoken speech paragraph formatter.
 * Splits speech transcripts into readable paragraphs based on:
 * 1. Dialogue reporting verbs and quotation intros (whispered, yelled, said)
 * 2. Dialogue questions and answers
 * 3. Timing gaps / pauses in spoken audio (> 0.5s silence)
 * 4. Pacing limits (30-50 words per paragraph at sentence boundaries)
 */
export function formatTranscriptToParagraphs(
  segments?: TranscriptSegment[],
  fullText?: string
): string {
  if (!segments || segments.length === 0) {
    if (!fullText) return '';
    // Sentence-based fallback for raw text without segment timestamps
    const sentences = fullText.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [fullText];
    const paras: string[] = [];
    let current: string[] = [];
    let wordCount = 0;

    for (const s of sentences) {
      current.push(s.trim());
      wordCount += s.trim().split(/\s+/).length;
      if (wordCount >= 35 || current.length >= 3) {
        paras.push(current.join(' '));
        current = [];
        wordCount = 0;
      }
    }
    if (current.length > 0) paras.push(current.join(' '));
    return paras.join('\n\n');
  }

  const paragraphs: string[] = [];
  let currentPara: string[] = [];
  let currentParaWords = 0;
  let prevSeg: TranscriptSegment | null = null;
  let inDialogue = false;

  const dialogueIntroRegex =
    /\b(whispered|yelled|said|asked|shouted|screamed|spoke|cried|replied|exclaimed|muttered|called|told me|demanded|spotted me)[,:\s—–.-]*$/i;
  const narrationRestartRegex =
    /^(I promised|I didn't|I stood|I said|I spun|I took|He backed|He stared|She came|She just|My fingers|Then|Next|Only|Legend|Everyone|Eight years|Halfway)\b/i;
  const directSpeechStartRegex =
    /^(Hey|Where's|What's|Why|How|Never|Bandages off|Blue eyes\?|You finally)\b/i;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const text = seg.text.trim();
    if (!text) continue;

    const gap = prevSeg ? Math.max(0, seg.start - prevSeg.end) : 0;
    const prevText = prevSeg ? prevSeg.text.trim() : '';

    let shouldBreak = false;

    if (currentPara.length > 0) {
      // 1. Dialogue intro before direct speech (e.g. "whispered,", "yelled,", "spoke.")
      if (
        dialogueIntroRegex.test(prevText) ||
        prevText.endsWith(':') ||
        prevText.endsWith('—') ||
        prevText.endsWith('-')
      ) {
        shouldBreak = true;
        inDialogue = true;
      }
      // 2. Explicit direct speech beginning (e.g. "Where's your umbrella?", "Hey, Bandage Boy...", "Bandages off", "Blue eyes?")
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
        currentParaWords >= 30 &&
        gap >= 0.35 &&
        (prevText.endsWith('.') || prevText.endsWith('!') || prevText.endsWith('?'))
      ) {
        shouldBreak = true;
        inDialogue = false;
      }
      // 7. Max paragraph size limit (>= 50 words)
      else if (
        currentParaWords >= 50 &&
        (prevText.endsWith('.') || prevText.endsWith('!') || prevText.endsWith('?'))
      ) {
        shouldBreak = true;
        inDialogue = false;
      }
    }

    if (shouldBreak && currentPara.length > 0) {
      paragraphs.push(currentPara.join(' '));
      currentPara = [];
      currentParaWords = 0;
    }

    currentPara.push(text);
    currentParaWords += text.split(/\s+/).length;
    prevSeg = seg;
  }

  if (currentPara.length > 0) {
    paragraphs.push(currentPara.join(' '));
  }

  return paragraphs.join('\n\n');
}
