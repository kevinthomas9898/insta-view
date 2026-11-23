import { RapidApiProvider } from '../lib/instagram/providers/rapidapi.provider';

async function testSchema() {
  console.log('Testing AnonyIG / ScraperAPI Schema normalization...');

  // Mock fetchFromRapidApi to return the AnonyIG schema
  const provider = new RapidApiProvider({ apiKey: 'dummy_key', host: 'dummy.host' });

  // Test Posts parsing with AnonyIG payload
  const mockPayload = {
    result: {
      items: [
        {
          id: '4035250259319377436',
          type: 'carousel',
          caption: 'Sunset in the mountains #travel',
          timestamp: 1732338000,
          likeCount: 14200,
          commentCount: 230,
          media: [
            {
              type: 'image',
              url: 'https://scontent-iad3-1.cdninstagram.com/photo1.jpg',
              thumbnailUrl: 'https://scontent-iad3-1.cdninstagram.com/photo1_thumb.jpg',
              width: 1080,
              height: 1350,
              versions: [
                {
                  url: 'https://scontent-iad3-1.cdninstagram.com/photo1.jpg',
                  urlDownloadable: 'https://media.anonyig.com/get?sig=123&file=photo1.jpg',
                },
              ],
            },
            {
              type: 'image',
              url: 'https://scontent-iad3-1.cdninstagram.com/photo2.jpg',
              thumbnailUrl: 'https://scontent-iad3-1.cdninstagram.com/photo2_thumb.jpg',
              width: 1080,
              height: 1350,
              versions: [
                {
                  url: 'https://scontent-iad3-1.cdninstagram.com/photo2.jpg',
                  urlDownloadable: 'https://media.anonyig.com/get?sig=456&file=photo2.jpg',
                },
              ],
            },
          ],
        },
        {
          id: '4035250259319377437',
          type: 'video',
          caption: 'Reel highlight',
          media: [
            {
              type: 'video',
              url: 'https://scontent-iad3-1.cdninstagram.com/video1.mp4',
              thumbnailUrl: 'https://scontent-iad3-1.cdninstagram.com/video1_thumb.jpg',
              versions: [
                {
                  url: 'https://scontent-iad3-1.cdninstagram.com/video1.mp4',
                  urlDownloadable: 'https://media.anonyig.com/get?sig=789&file=video1.mp4',
                },
              ],
            },
          ],
        },
      ],
    },
  };

  (provider as any).fetchFromRapidApi = async () => mockPayload;

  const result = await provider.getPosts('test_user');
  console.log(`Parsed ${result.data.length} posts.`);

  const p1 = result.data[0];
  if (p1.type !== 'carousel') throw new Error(`Expected carousel, got ${p1.type}`);
  if (!p1.carouselMedia || p1.carouselMedia.length !== 2) throw new Error('Carousel media missing or incorrect length');
  if (p1.carouselMedia[0].url !== 'https://scontent-iad3-1.cdninstagram.com/photo1.jpg') throw new Error('Carousel slide 1 url mismatch');
  console.log('[PASS] Carousel parsed correctly with 2 slides.');

  const p2 = result.data[1];
  if (p2.type !== 'video') throw new Error(`Expected video, got ${p2.type}`);
  if (p2.url !== 'https://scontent-iad3-1.cdninstagram.com/video1.mp4') throw new Error('Video post URL mismatch');
  console.log('[PASS] Video post parsed correctly.');

  console.log('ALL SCHEMA TESTS PASSED SUCCESSFULLY!');
}

testSchema().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
