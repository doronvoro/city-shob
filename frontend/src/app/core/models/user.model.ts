/**
 * User type - represents an authenticated user
 */
export type User = {
  id: string;
  email: string;
};

/**
 * Authentication response from login/register API
 */
export type AuthResponse = {
  token: string;
  user: User;
  message?: string;
};
