import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

enum DosageForm {
  TABLET = "Comprimido",
  CAPSULE = "Cápsula",
  ORAL_SOLUTION = "Solución oral",
  INJECTABLE_SOLUTION = "Solución inyectable",
  OINTMENT = "Pomada",
  TRANSDERMAL_PATCH = "Parche transdérmico",
  INHALER = "Inhalador",
  OTHER = "Otro"
}

enum AdministrationChannel {
  ORAL = "Oral",
  INTRAVENOUS = "Intravenosa",
  INTRAMUSCULAR = "Intramuscular",
  SUBCUTANEOUS = "Subcutánea",
  TOPICAL = "Tópica",
  INHALATION = "Inhalatoria"
}

export interface MedicationName {
  comercialName: string;
  activeIngredientName: string;
}

export interface Dose {
  amount: number
  unit: string;
}

export interface MedicationsDocument extends Document {
  name: MedicationName;
  nationalCode: string; // unico en el sistema
  dosageForm: DosageForm;
  standarDose: Dose;
  channel: AdministrationChannel;
  stock: number;
  price: number;
  prescription: boolean;
  expiryDate: Date;
  contraindications: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MedicationsSchema = new Schema<MedicationsDocument>({
  name: {
    type: {
      comercialName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
      },
      activeIngredientName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
      }
     },
    required: true,
  },
  nationalCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 6,
    maxlength: 6,
    validate: (value: string) => {
      if (!validator.isNumeric(value)) {
        throw new Error('National code must be numeric');
      }
    }
  },
  dosageForm: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      const validDosageForms = Object.values(DosageForm);
      if (!validDosageForms.includes(value as DosageForm)) {
        throw new Error(`Dosage form must be one of: ${validDosageForms.join(', ')}`);
      }
    }
  },
  standarDose: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      trim: true
    }
  },
  channel: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      const validChannels = Object.values(AdministrationChannel);
      if (!validChannels.includes(value as AdministrationChannel)) {
        throw new Error(`Administration channel must be one of: ${validChannels.join(', ')}`);
      }
    }
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    validator: (value: number) => {
      if (!Number.isInteger(value)) {
        throw new Error('Stock must be an integer');
      }
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  prescription: {
    type: Boolean,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true,
    validate: {
      validator: (value: Date) => value > new Date(),
      message: 'Expiry date must be in the future'
    }
  },
  contraindications: {
    type: [String],
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Medications = model<MedicationsDocument>('Medications', MedicationsSchema);