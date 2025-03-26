export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Expiration time in seconds
}
