import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EMPTY_REGISTERED_USERS_STATS,
  normalizeRegisteredUser,
  normalizeRegisteredUsersResponse,
} from "./registeredUsers.js";

const rawUser = {
  _id: "507f1f77bcf86cd799439011",
  email: "maman@example.com",
  name: null,
  created_at: "2026-08-20T10:00:00Z",
  subscription_status: "trial",
  display_status: "trial",
  postpartum_purchased: null,
};

test("normalizes Mongo _id, date and nullable fields", () => {
  const user = normalizeRegisteredUser(rawUser);
  assert.equal(user.id, "507f1f77bcf86cd799439011");
  assert.equal(user.name, "");
  assert.equal(user.created_at, "2026-08-20T10:00:00.000Z");
  assert.equal(user.display_status, "trial");
  assert.equal(user.postpartum_purchased, false);
  assert.equal("_id" in user, false);
});

test("accepts canonical, Axios, legacy data and direct-array shapes", () => {
  const canonical = normalizeRegisteredUsersResponse({
    users: [{ ...rawUser, id: "canonical" }],
    test_users: [],
    stats: { total: 1, trial: 1 },
  });
  assert.equal(canonical.users[0].id, "canonical");
  assert.equal(canonical.stats.trial, 1);

  const axios = normalizeRegisteredUsersResponse({
    data: { users: [rawUser], stats: { total: 1 } },
  });
  assert.equal(axios.users.length, 1);

  const legacy = normalizeRegisteredUsersResponse({ data: [rawUser] });
  assert.equal(legacy.users.length, 1);

  const direct = normalizeRegisteredUsersResponse([rawUser]);
  assert.equal(direct.users.length, 1);
});

test("malformed or null payload always returns safe empty arrays", () => {
  for (const payload of [null, undefined, {}, { users: null }, { data: "bad" }]) {
    const result = normalizeRegisteredUsersResponse(payload);
    assert.deepEqual(result.users, []);
    assert.deepEqual(result.test_users, []);
    assert.deepEqual(result.stats, EMPTY_REGISTERED_USERS_STATS);
  }
});
