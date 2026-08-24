export type RegisteredUserDisplayStatus =
  | 'free'
  | 'trial'
  | 'premium'
  | 'beta_tester';

export interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  created_at: string | null;
  role: string;
  subscription_status: string;
  premium_source: string;
  display_status: RegisteredUserDisplayStatus;
  is_test_user: boolean;
  postpartum_purchased: boolean;
  postpartum_free_via_referral: boolean;
}

export interface RegisteredUsersStats {
  total: number;
  premium: number;
  beta_tester: number;
  trial: number;
  free: number;
  test_users_count: number;
}

export interface RegisteredUsersResponse {
  users: RegisteredUser[];
  test_users: RegisteredUser[];
  stats: RegisteredUsersStats;
}

export const EMPTY_REGISTERED_USERS_STATS: Readonly<RegisteredUsersStats>;
export function normalizeRegisteredUser(raw: unknown): RegisteredUser | null;
export function normalizeRegisteredUsersResponse(payload: unknown): RegisteredUsersResponse;
