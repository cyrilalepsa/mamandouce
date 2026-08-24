/**
 * @typedef {Object} RegisteredUser
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string|null} created_at ISO-8601 date
 * @property {string} role
 * @property {string} subscription_status
 * @property {string} premium_source
 * @property {'free'|'trial'|'premium'|'beta_tester'} display_status
 * @property {boolean} is_test_user
 * @property {boolean} postpartum_purchased
 * @property {boolean} postpartum_free_via_referral
 */

export const EMPTY_REGISTERED_USERS_STATS = Object.freeze({
  total: 0,
  premium: 0,
  beta_tester: 0,
  trial: 0,
  free: 0,
  test_users_count: 0,
});

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function asString(value, fallback = '') {
  return value == null ? fallback : String(value);
}

function asBoolean(value) {
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
}

function asIsoDate(value) {
  if (value == null || value === '') return null;
  const raw = asString(value);
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** @returns {RegisteredUser|null} */
export function normalizeRegisteredUser(raw) {
  const user = asObject(raw);
  const id = user.id ?? user._id;
  if (id == null || id === '') return null;

  const displayStatus = asString(
    user.display_status,
    asString(user.subscription_status, 'free'),
  ).toLowerCase();

  return {
    id: asString(id),
    email: asString(user.email),
    name: asString(user.name),
    created_at: asIsoDate(user.created_at),
    role: asString(user.role, 'user') || 'user',
    subscription_status: asString(user.subscription_status, 'free') || 'free',
    premium_source: asString(user.premium_source),
    display_status: ['free', 'trial', 'premium', 'beta_tester'].includes(displayStatus)
      ? displayStatus
      : 'free',
    is_test_user: asBoolean(user.is_test_user),
    postpartum_purchased: asBoolean(user.postpartum_purchased),
    postpartum_free_via_referral: asBoolean(user.postpartum_free_via_referral),
  };
}

function normalizeUserArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeRegisteredUser).filter(Boolean);
}

function normalizeStats(raw, users, testUsers) {
  const stats = asObject(raw);
  const count = (status) => users.filter((user) => user.display_status === status).length;
  const numberOr = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    total: numberOr(stats.total, users.length),
    premium: numberOr(stats.premium, count('premium')),
    beta_tester: numberOr(stats.beta_tester, count('beta_tester')),
    trial: numberOr(stats.trial, count('trial')),
    free: numberOr(stats.free, count('free')),
    test_users_count: numberOr(stats.test_users_count, testUsers.length),
  };
}

/**
 * Accepts the canonical wrapper, Axios `{data: wrapper}`, a legacy
 * `{data: users[]}` wrapper, or a direct array without ever throwing.
 */
export function normalizeRegisteredUsersResponse(payload) {
  const axiosBody = asObject(payload).data ?? payload;
  const body = asObject(axiosBody);
  const directArray = Array.isArray(axiosBody) ? axiosBody : null;
  const nestedDataArray = Array.isArray(body.data) ? body.data : null;
  const users = normalizeUserArray(
    directArray ?? (Array.isArray(body.users) ? body.users : nestedDataArray),
  );
  const testUsers = normalizeUserArray(body.test_users);

  return {
    users,
    test_users: testUsers,
    stats: normalizeStats(body.stats, users, testUsers),
  };
}
