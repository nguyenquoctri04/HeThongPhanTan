const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const commonHeaders: Record<string, string> = {};

// Use VITE_IS_PROD from .env, default to false if not present
const isProd = String(import.meta.env.VITE_IS_PROD).toLowerCase() === 'true';

if (!isProd) {
  commonHeaders['ngrok-skip-browser-warning'] = 'true';
}

export interface User {
  id: number;
  username: string;
  name: string;
  balance: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TransferRequest {
  fromUserId: number;
  toUsername: string;
  amount: number;
  note?: string;
}

export interface Transaction {
  id: number | string;
  fromUserId: number;
  fromUsername: string;
  fromName: string;
  toUserId: number;
  toUsername: string;
  toName: string;
  amount: number;
  note: string;
  timestamp: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
}

// Users API
export const getUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: commonHeaders
  });
  return response.json();
};

export const getUserById = async (id: number): Promise<ApiResponse<User>> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    headers: commonHeaders
  });
  return response.json();
};

// Auth API
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      ...commonHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return response.json();
};

// Transactions API
export const transferMoney = async (transfer: TransferRequest): Promise<ApiResponse<{ transaction: Transaction; user: User }>> => {
  const response = await fetch(`${API_BASE_URL}/transactions/transfer`, {
    method: 'POST',
    headers: {
      ...commonHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transfer),
  });
  return response.json();
};

export const getTransactions = async (userId?: number): Promise<ApiResponse<Transaction[]>> => {
  const url = userId
    ? `${API_BASE_URL}/transactions?userId=${userId}`
    : `${API_BASE_URL}/transactions`;
  const response = await fetch(url, {
    headers: commonHeaders
  });
  return response.json();
};

export const getTransactionById = async (id: string | number): Promise<ApiResponse<Transaction>> => {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    headers: commonHeaders
  });
  return response.json();
};
