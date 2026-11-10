export type AdminRole = 'super_admin' | 'admin';
export const ADMIN_ROLES: AdminRole[] = ['super_admin', 'admin'];
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  status: string;
  last_login_at?: string | null;
  created_at?: string;
}
export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { success: boolean; token: string; data: AdminUser; }
export interface JwtClaims { exp: number; role: string; }
