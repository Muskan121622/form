// src/validation/formValidation.ts
import { body } from 'express-validator';

export const validateFormData = [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('address1').notEmpty(),
  body('city').notEmpty(),
  body('state').notEmpty(),
  body('zipcode').isPostalCode('any'),
];
