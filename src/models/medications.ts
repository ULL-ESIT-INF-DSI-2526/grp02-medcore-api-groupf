import { Document, Schema, model } from 'mongoose';

enum Names {
  COMERCIAL_NAME = "Nombre comercial",
  ACTIVE_INGREDIENT_NAME = "Nombre del principio activo"
}

enum DosageForm {
  TABLET = "Comprimido",
  CAPSULE = "Cápsula",
  ORAL_SOLUTION = "Solución oral",
  INJECTABLE_SOLUTION = "Solución inyectable",
  OINTMENT = "Pomada",
  TRANSDERMAL_PATCH = "Parche transdérmico",
  INHALER = "Inhalador"
}

enum AdministrationChannel {
  ORAL = "Oral",
  INTRAVENOUS = "Intravenosa",
  INTRAMUSCULAR = "Intramuscular",
  SUBCUTANEOUS = "Subcutánea",
  TOPICAL = "Tópica",
  INHALATION = "Inhalatoria"
}

export interface Dose {
  amount: number
  unit: string;
}

export interface MedicationsDocument extends Document {
  name: Names;
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
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      const validNames = Object.values(Names);
      if (!validNames.includes(value as Names)) {
        throw new Error(`Medication name must be one of: ${validNames.join(', ')}`);
      }
    }
  },
  nationalCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
    min: 0
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