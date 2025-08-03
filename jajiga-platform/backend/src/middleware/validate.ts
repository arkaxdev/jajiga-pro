import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors: any[] = [];
    errors.array().map(err => extractedErrors.push({ [err.type]: err.msg }));

    return res.status(422).json({
      success: false,
      error: {
        message: 'داده‌های ورودی معتبر نیستند',
        errors: extractedErrors,
      },
    });
  }
  
  next();
};
