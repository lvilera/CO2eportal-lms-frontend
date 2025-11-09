let memoryAccess: string | null = null;
let memoryRefresh: string | null = null;

const ACCESS_KEY = "lms_access_token";
const REFRESH_KEY = "lms_refresh_token";
const USER_KEY = "lms_user";

export const setAccessToken = (token: string) => {
  memoryAccess = token;
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_KEY, token);
  }
};

export const getAccessToken = (): string | null => {
  if (memoryAccess) return memoryAccess;
  if (typeof window === "undefined") return null;
  const t = localStorage.getItem(ACCESS_KEY);
  memoryAccess = t;
  return t;
};

export const setRefreshToken = (token: string) => {
  memoryRefresh = token;
  if (typeof window !== "undefined") {
    localStorage.setItem(REFRESH_KEY, token);
  }
};

export const getRefreshToken = (): string | null => {
  if (memoryRefresh) return memoryRefresh;
  if (typeof window === "undefined") return null;
  const t = localStorage.getItem(REFRESH_KEY);
  memoryRefresh = t;
  return t;
};

export const clearTokens = () => {
  memoryAccess = null;
  memoryRefresh = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export const setUser = (user: unknown) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getCurrentUser = <T = any>(): T | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
};
