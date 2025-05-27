import { body } from 'express-validator';

export const signupValidator = [
    body('firstName')
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    body('lastName')
        .notEmpty().withMessage('Last name is required'),
    body('email')
        .isEmail().withMessage('Invalid email address'),
    body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        }).withMessage('Password must be strong'),
    body('age')
        .optional().isInt({ min: 18 }).withMessage('Minimum age is 18'),
    body('gender')
        .optional().isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
        .withMessage('Invalid gender value'),
    body('profilePicture')
        .optional()
        .matches(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)$/)
        .withMessage('Profile picture must be a valid image URL'),
];
