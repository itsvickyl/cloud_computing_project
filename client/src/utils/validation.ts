
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};


export const isValidTwitterHandle = (handle: string): boolean => {
  const twitterRegex = /^@?[A-Za-z0-9_]{1,15}$/;
  return twitterRegex.test(handle);
};


export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const normalizeUrl = (url: string): string => {
  return url.startsWith("http") ? url : `https://${url}`;
};


export const normalizeTwitterHandle = (handle: string): string => {
  return handle.startsWith("@") ? handle.slice(1) : handle;
};
