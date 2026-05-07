import { Schema } from 'mongoose';

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
    trim: true
    // Añadir opcionalmente validador de formato para número de teléfono
  },
  email: {
    type: String,
    trim: true
    // Añadir opcionalmente validador de formato para correo electrónico
  }
});