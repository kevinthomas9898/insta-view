import { spawn, ChildProcess } from 'child_process';

async function testHttpEndpoints() {
  console.log('--- Starting Next.js Production Server for HTTP Endpoints Verification ---');
  
  const server = spawn('npm', ['start', '--', '-p', '3005'], {
    shell: true,
    stdio: 'pipe',
  });

  server.stdout?.on('data', (d) => {
    const msg = d.toString();
    if (msg.includes('Ready in') || msg.includes('started server') || msg.includes('http://localhost:3005')) {
      console.log('[SERVER READY]:', msg.trim());
    }
  });

  server.stderr?.on('data', (d) => {
    console.error('[SERVER LOG]:', d.toString().trim());
  });

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 5000));

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string, extra?: unknown) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`, extra ?? '');
      failed++;
    }
  }

  try {
    // 1. Test Homepage
    console.log('\n1. Testing Homepage Route (GET /)');
    const homeRes = await fetch('http://localhost:3005/');
    assert(homeRes.status === 200, `Homepage returned HTTP 200 (${homeRes.status})`);
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes('InstaView'), 'Homepage contains "InstaView" branding');

    // 2. Test Live Profile API Endpoint
    console.log('\n2. Testing Live Profile Endpoint (GET /api/profile?username=instagram)');
    const liveRes = await fetch('http://localhost:3005/api/profile?username=instagram');
    assert(liveRes.status === 200, `Live profile returned HTTP 200 (${liveRes.status})`);
    const liveJson = await liveRes.json();
    assert(liveJson.success === true, 'Live profile response success === true');
    assert(liveJson.data.username === 'instagram', `Returned username: ${liveJson.data.username}`);
    assert(Boolean(liveJson.data.avatarUrl), `Returned avatar URL: ${liveJson.data.avatarUrl?.substring(0, 50)}...`);

    // 3. Test Demo Posts API Endpoint
    console.log('\n3. Testing Demo Posts Endpoint (GET /api/posts?username=test&demo=true)');
    const postsRes = await fetch('http://localhost:3005/api/posts?username=test&demo=true');
    assert(postsRes.status === 200, `Posts returned HTTP 200 (${postsRes.status})`);
    const postsJson = await postsRes.json();
    assert(postsJson.success === true, 'Posts response success === true');
    assert(postsJson.data.length >= 3, `Returned ${postsJson.data.length} posts`);
    const videoPost = postsJson.data.find((p: any) => p.type === 'video');
    assert(Boolean(videoPost && videoPost.downloadUrl), 'Video post has downloadUrl');

    // 4. Test Media Proxy & Download Endpoint
    console.log('\n4. Testing Media Streaming & Download (GET /api/media?url=...&download=true)');
    const sampleMediaUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    const mediaRes = await fetch(
      `http://localhost:3005/api/media?url=${encodeURIComponent(sampleMediaUrl)}&download=true&filename=test_video.mp4`,
      {
        headers: { Range: 'bytes=0-1024' },
      }
    );
    assert(mediaRes.status === 206 || mediaRes.status === 200, `Media endpoint returned partial/ok stream (${mediaRes.status})`);
    const contentDisp = mediaRes.headers.get('content-disposition');
    assert(Boolean(contentDisp && contentDisp.includes('attachment; filename="test_video.mp4"')), `Content-Disposition header set: ${contentDisp}`);
    const contentType = mediaRes.headers.get('content-type');
    assert(Boolean(contentType && contentType.includes('video')), `Content-Type is video: ${contentType}`);

    // 5. Test SSRF Block on Media Endpoint
    console.log('\n5. Testing SSRF Rejection (GET /api/media?url=http://127.0.0.1:8080/evil)');
    const ssrfRes = await fetch(
      `http://localhost:3005/api/media?url=${encodeURIComponent('http://127.0.0.1:8080/evil')}`
    );
    assert(ssrfRes.status === 403, `SSRF attempt blocked with 403 Forbidden (${ssrfRes.status})`);

    // 6. Test Invalid Username Validation
    console.log('\n6. Testing Input Validation (GET /api/profile?username=bad<script>)');
    const badUserRes = await fetch('http://localhost:3005/api/profile?username=bad<script>');
    assert(badUserRes.status === 400, `Invalid username returned 400 Bad Request (${badUserRes.status})`);
  } finally {
    // Kill the test server
    console.log('\nShutting down test server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(server.pid), '/f', '/t']);
    } else {
      server.kill();
    }
  }

  console.log('\n====================================================');
  console.log(`HTTP ENDPOINTS TEST: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

testHttpEndpoints();
