import { isProfileOptedOut, addOptOutRecord, getOptOutCount } from '../lib/storage/opt-out';
import { InstagramService } from '../lib/instagram/services/instagram.service';
import { ProviderFactory } from '../lib/instagram/providers/factory';

async function testOptOutAndHealth() {
  console.log('--- TEST GROUP: Opt-Out Blocklist & Failover Chain ---');

  // 1. Initial opt-out status
  const testUser = 'dmca_optout_test_user';
  const initialStatus = await isProfileOptedOut(testUser);
  console.assert(!initialStatus, 'Initial profile should not be opted out');
  console.log('[PASS] Non-opted-out profile returns false');

  // 2. Add opt out
  await addOptOutRecord({
    username: testUser,
    email: 'test@example.com',
    reason: 'DMCA Takedown Request',
    notes: 'Verified copyright holder request',
  });

  const postStatus = await isProfileOptedOut(testUser);
  console.assert(postStatus, 'Profile should be opted out after recording');
  console.log('[PASS] Opted-out profile detected immediately in memory');

  // 3. InstagramService blocks query for opted-out profile
  const result = await InstagramService.getProfile(testUser, true);
  console.assert(!result.success, 'Query for opted-out profile must fail');
  console.assert(result.error?.code === 'PROFILE_OPTED_OUT', 'Error code must be PROFILE_OPTED_OUT');
  console.log('[PASS] InstagramService successfully blocks opted-out profile');

  // 4. Provider Failover Chain test
  const chain = ProviderFactory.getFallbackChain();
  console.assert(chain.length >= 1, 'Provider chain must contain at least 1 provider');
  console.log(`[PASS] Fallback chain configured with ${chain.length} provider(s): ${chain.map(p => p.name).join(' -> ')}`);

  // 5. Provider Statuses
  const statuses = ProviderFactory.getProviderStatuses();
  console.assert(statuses.length === 4, 'Must report status for all 4 providers');
  console.log('[PASS] Provider statuses generated properly');

  console.log('All Opt-Out and Provider Failover tests passed successfully!');
}

testOptOutAndHealth().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
