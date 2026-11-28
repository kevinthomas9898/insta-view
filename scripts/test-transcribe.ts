import { transcribeMedia } from '../lib/transcribe/whisper';
import { containsIndicScript, deterministicIndicRomanizer } from '../lib/transcribe/indic-romanizer';

async function runTests() {
  console.log('====================================================');
  console.log('   INSTA-VIEW REEL TRANSCRIPTION TEST SUITE        ');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    // Test 1: Fallback transcript generation from caption hint
    const sampleCaption = 'Learn this secret photography trick to take amazing sunset portraits on your phone! Double tap if you agree.';
    const result = await transcribeMedia('https://example.com/demo.mp4', 'test_shortcode_123', sampleCaption);

    assert(Boolean(result.text), 'Transcript produces non-empty text');
    assert(result.segments.length > 0, 'Transcript produces timestamped segments');
    assert(typeof result.segments[0].start === 'number', 'Segment has valid numeric start time');
    assert(typeof result.segments[0].end === 'number', 'Segment has valid numeric end time');
    assert(result.segments[0].end > result.segments[0].start, 'Segment end time is greater than start time');
    assert(Boolean(result.language), 'Language code is detected');

    // Test 2: In-memory cache returns cached transcript on second call
    const cachedResult = await transcribeMedia('https://example.com/demo.mp4', 'test_shortcode_123');
    assert(cachedResult.fromCache === true, 'Subsequent call returns fromCache = true');
    assert(cachedResult.text === result.text, 'Cached text matches original transcript');

    // Test 3: Fallback demo transcription when no caption is provided
    const demoResult = await transcribeMedia('https://example.com/demo_empty.mp4', 'empty_shortcode_456');
    assert(demoResult.segments.length >= 3, 'Default spoken transcript has at least 3 speech segments');
    assert(demoResult.text.includes('channel'), 'Default spoken transcript contains natural spoken words');

    // Test 4: Indic script detection
    const hindiSample = 'नमस्ते दोस्तों आप कैसे हो?';
    const gujaratiSample = 'આજે આપણે એક નવી રીત શીખીશું.';
    const englishSample = 'Hello friends, how are you?';
    const mixedSample = 'Today हम एक new video banayenge, check this out!';

    assert(containsIndicScript(hindiSample) === true, 'Detects Devanagari Hindi script');
    assert(containsIndicScript(gujaratiSample) === true, 'Detects Gujarati script');
    assert(containsIndicScript(mixedSample) === true, 'Detects Indic script in code-mixed text');
    assert(containsIndicScript(englishSample) === false, 'English text does not trigger Indic detector');

    // Test 5: Deterministic transliteration to English alphabet (Hinglish / Gujlish)
    const romanizedHindi = deterministicIndicRomanizer(hindiSample);
    assert(!containsIndicScript(romanizedHindi), 'Romanized Hindi contains no Devanagari script');
    assert(romanizedHindi.toLowerCase().includes('namaste'), 'Romanized Hindi contains phonetic "namaste"');

    const romanizedGuj = deterministicIndicRomanizer(gujaratiSample);
    assert(!containsIndicScript(romanizedGuj), 'Romanized Gujarati contains no Gujarati script');
    assert(romanizedGuj.length > 5, 'Romanized Gujarati produces valid Latin text');

    // Test 6: Fallback transcription handles Indic script captions cleanly
    const indicFallback = await transcribeMedia('https://example.com/demo_hindi.mp4', 'hindi_reel_789', hindiSample);
    assert(!containsIndicScript(indicFallback.text), 'Indic fallback transcript is transliterated into Roman alphabet');
    assert(indicFallback.segments.length > 0, 'Indic fallback produces segments');

    console.log('====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
