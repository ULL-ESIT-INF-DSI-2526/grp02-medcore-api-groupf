import { Schema } from 'mongoose';
import validator from 'validator';

export interface ContactDocument {
  address: string;
  phone: string;
  email: string;
}

export const ContactSchema = new Schema<ContactDocument>({
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    validate(value: string) {
      if (!validator.isMobilePhone(value, 'any')) {
        throw new Error('Invalid phone number format');
      }
    }
  },
  email: {
    type: String,
    trim: true,
    validate(value: string) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email format');
      }
    }
  }
});