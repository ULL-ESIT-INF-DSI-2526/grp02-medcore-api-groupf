import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

/**
 * Farmaceutic form of the doses
 */
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
/**
 * Administration routes for a medication
 */
enum AdministrationChannel {
  ORAL = "Oral",
  INTRAVENOUS = "Intravenosa",
  INTRAMUSCULAR = "Intramuscular",
  SUBCUTANEOUS = "Subcutánea",
  TOPICAL = "Tópica",
  INHALATION = "Inhalatoria"
}

/**
 * Represents the brand names of a medication
 */
export interface MedicationName {
  /**
   * Commercial name of the medication
   */
  comercialName: string;
  /**
   * Active Ingredicent Name of the medication
   */
  activeIngredientName: string;
}
/**
 * Represents the standard prescrcibed dose
 * 
 */
export interface Dose {
  /**
   * Number of doses
   */
  amount: number
  /**
   * Unit of measurement for the dose (mg, g, ml)
   */
  unit: string;
}

/**
 * Represents medication document
 */
export interface MedicationsDocument extends Document {
  /**
   * Brand names of the medication
   */
  name: MedicationName;
  /**
   * National Code of the medication
   * @remarks Must be unique
   */
  nationalCode: string;
  /**
   * Farmaceutic form of the dose
   */
  dosageForm: DosageForm;
  /**
   * Standard prescribed dose for the medication
   */
  standarDose: Dose;
  /**
   * Route of administration
   */
  channel: AdministrationChannel;
  /**
   * Current number of units available
   */
  stock: number;
  /**
   * Price of the medication
   */
  price: number;
  /**
   * Whether the medication requires a medical prescription
   */
  prescription: boolean;
  /**
   * Date after which the medication should not be used
   */
  expiryDate: Date;
  /**
   * List of known contraindications for this medication
   */
  contraindications: string[];
  /**
   * Marks when was created the document
   */
  createdAt: Date;
  /**
   * Marks when was updated the document
   */
  updatedAt: Date;
}

const MedicationsSchema = new Schema<MedicationsDocument>({
  name: {
    type: {
      /** Trimmed, min lenght 3 */
      comercialName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
      },
      /** Trimmed, min lenght 3 */
      activeIngredientName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
      }
     },
    required: true,
  },
  /**
   * 6 numeric digits. Must be unique.
   * Valitated by 'validator.isNumeric'
   */
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
  /**
   * Rejects if the string does not have any known form 
   */
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
    /**min 0 */
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
  /**
   * Rejects if the string does not have any known channel 
   */
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

  /**
   * Must be a non-negative integer
   */
  stock: {
    type: Number,
    required: true,
    min: 0,
    validate: (value: number) => {
      if (!Number.isInteger(value)) {
        throw new Error('Stock must be an integer');
      }
    }
  },
  /**min 0 */
  price: {
    type: Number,
    required: true,
    min: 0
  },
  prescription: {
    type: Boolean,
    required: true
  },
  /**
   * Must be a future date, today is valid.
   * 
   */
  expiryDate: {
    type: Date,
    required: true,
    validate: {
      validator: (value: Date) => value > new Date(),
      message: 'Expiry date must be in the future'
    }
  },
  /**
   * List of contraindication descriptions. Required, may be an empty array.
   */
  contraindications: {
    type: [String],
    required: true,
    trim: true
  },
  /**
   * Marks when the document was created
   */
  createdAt: {
    type: Date,
    default: Date.now
  },
  /**
   * Marks when the document was updated
   */
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Medications = model<MedicationsDocument>('Medications', MedicationsSchema);