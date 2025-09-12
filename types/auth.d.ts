import { Request } from 'express';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface ValidateTokenDto {
  token: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user?: User;
}

export interface UsersResponse {
  users: User[];
  count: number;
}

export interface ValidateTokenRequest {
  token: string;
  lang?: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user?: Partial<User>;
  error?: string;
  message?: string;
}

export interface AuthServiceError {
  status: 'error';
  message: string;
}

export type AuthServiceResponse = ValidateTokenResponse | AuthServiceError;

export interface RabbitMQError {
  code?: string;
  name?: string;
  message?: string;
}

export interface CanActivateRequest extends Request {
  user?: Partial<User>;
}
