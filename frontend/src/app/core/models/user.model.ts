// core/models/user.model.ts
export type UserRole = 'Admin' | 'General User';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status?: UserStatus;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface LoginPayload {
  userId: string;
  password: string;
}
