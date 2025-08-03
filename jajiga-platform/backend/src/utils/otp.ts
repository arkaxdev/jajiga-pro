import crypto from 'crypto';

// Generate a 6-digit OTP
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Verify OTP
export const verifyOTPCode = (
  inputCode: string,
  storedCode: string,
  expiry: Date
): boolean => {
  // Check if OTP has expired
  if (new Date() > expiry) {
    return false;
  }

  // Check if codes match
  return inputCode === storedCode;
};

// Generate a secure random token
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};
