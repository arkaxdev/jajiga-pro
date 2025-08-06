import axios from 'axios';
import { logger } from '../utils/logger';

// Kavenegar SMS Service
const KAVENEGAR_API_KEY = process.env.KAVENEGAR_API_KEY;
const KAVENEGAR_BASE_URL = 'https://api.kavenegar.com/v1';

export const sendSMS = async (receptor: string, message: string): Promise<boolean> => {
  try {
    // In development, just log the SMS
    if (process.env.NODE_ENV === 'development') {
      logger.info(`SMS to ${receptor}: ${message}`);
      return true;
    }

    // In production, send via Kavenegar
    if (!KAVENEGAR_API_KEY) {
      logger.error('Kavenegar API key not configured');
      return false;
    }

    const url = `${KAVENEGAR_BASE_URL}/${KAVENEGAR_API_KEY}/sms/send.json`;
    
    const response = await axios.post(url, null, {
      params: {
        receptor,
        message,
        sender: '10004346', // Kavenegar default sender
      },
    });

    if (response.data.return.status === 200) {
      logger.info(`SMS sent successfully to ${receptor}`);
      return true;
    } else {
      logger.error(`Failed to send SMS: ${response.data.return.message}`);
      return false;
    }
  } catch (error) {
    logger.error('SMS sending error:', error);
    return false;
  }
};

// Send OTP SMS with template (for production)
export const sendOTPSMS = async (receptor: string, token: string): Promise<boolean> => {
  try {
    // In development, just log the SMS
    if (process.env.NODE_ENV === 'development') {
      logger.info(`OTP SMS to ${receptor}: ${token}`);
      return true;
    }

    if (!KAVENEGAR_API_KEY) {
      logger.error('Kavenegar API key not configured');
      return false;
    }

    const url = `${KAVENEGAR_BASE_URL}/${KAVENEGAR_API_KEY}/verify/lookup.json`;
    
    const response = await axios.post(url, null, {
      params: {
        receptor,
        token,
        template: 'verify', // You need to create this template in Kavenegar panel
      },
    });

    if (response.data.return.status === 200) {
      logger.info(`OTP SMS sent successfully to ${receptor}`);
      return true;
    } else {
      logger.error(`Failed to send OTP SMS: ${response.data.return.message}`);
      return false;
    }
  } catch (error) {
    logger.error('OTP SMS sending error:', error);
    return false;
  }
};
