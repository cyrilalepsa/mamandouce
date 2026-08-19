import assert from "node:assert/strict";
import { test } from "node:test";
import {
  APP_HOME_PATH,
  bypassesPaywall,
  destinationAfterAuth,
  isPremiumSubscriber,
  isPrivilegedAccount,
  shouldAutoRedirectToPricing,
  shouldLeavePricingPage,
  subscriptionStatusOf,
} from "./postLogin.js";

const cyril = { email: "CyrilAlepsa@Gmail.com", role: "user", subscription_status: "free" };
const neria = { email: "superadmin@neriacorp.com", role: "user", subscription_status: "free" };
const premium = { email: "maman@test.com", role: "user", subscription_status: "premium" };
const trial = { email: "essai@test.com", role: "user", subscription_status: "trial" };
const free = { email: "free@test.com", role: "user", subscription_status: "free" };

test("privileged emails bypass paywall even if DB says free", () => {
  assert.equal(isPrivilegedAccount(cyril), true);
  assert.equal(isPrivilegedAccount(neria), true);
  assert.equal(bypassesPaywall(cyril), true);
  assert.equal(bypassesPaywall(neria), true);
  assert.equal(isPremiumSubscriber(cyril), false);
});

test("premium and trial go home with paywall bypass, never pricing", () => {
  assert.equal(isPremiumSubscriber(premium), true);
  assert.equal(isPremiumSubscriber(trial), true);
  assert.equal(bypassesPaywall(premium), true);
  assert.equal(destinationAfterAuth(premium), APP_HOME_PATH);
  assert.equal(shouldAutoRedirectToPricing(premium), false);
  assert.equal(shouldLeavePricingPage(premium, { isOnboarding: true }), true);
  assert.equal(shouldLeavePricingPage(premium, { isOnboarding: false }), false);
});

test("free users land on home; pricing only if they open it themselves", () => {
  assert.equal(subscriptionStatusOf(free), "free");
  assert.equal(bypassesPaywall(free), false);
  assert.equal(destinationAfterAuth(free), APP_HOME_PATH);
  assert.equal(shouldAutoRedirectToPricing(free), false);
  assert.equal(shouldLeavePricingPage(free, { isOnboarding: true }), true);
  assert.equal(shouldLeavePricingPage(free, { isOnboarding: false }), false);
});

test("privileged accounts never stay on pricing", () => {
  assert.equal(shouldLeavePricingPage(cyril, { isOnboarding: false }), true);
  assert.equal(destinationAfterAuth(cyril), "/");
});
