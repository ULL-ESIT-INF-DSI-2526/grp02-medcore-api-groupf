import { Document, connect, model, Schema } from 'mongoose';

connect('mongodb://127.0.0.1:27017/library-app', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log('Connected to the database');

  interface Contacto {
    direccion: string,
    telefono: string,
    correo: string
  }

  interface Pacientes extends Document {
    nombre_completo: string,
    fecha_nacimiento: string,
    identificacion: string,     // unico
    seguridad_social: string,               // unico
    genero: string,
    contacto: Contacto,
    alergias: string,
    grupo_sanguineo: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | '0+' | '0-',
    estado_paciente: 'activo' | 'baja temporal' | 'fallecido',
  }

  const PacientesSchema = new Schema<Pacientes>({
    nombre_completo: {
      type: String,
    },
    fecha_nacimiento: {
      type: String,
      validate: (value: string) => {
        const a_fecha = new Date(value)
        const fecha_actual = new Date()
        if(isNaN(a_fecha.getTime())){
          throw new Error('Fecha de nacimiento no válida');
        } else if(a_fecha > fecha_actual){
          throw new Error('La fecha de nacimiento no puede ser mayor al día de hoy');
        }
      },
    },
    identificacion: {
      type: String,
      unique: true,
      minlength: 9,
      maxlength: 9,
      match: [/^[0-9]{8}[A-Z]$/, 'Documento de identidad no válido'],
      
    },
    seguridad_social: {
      type: String,
      unique: true,
      minlength: 12,
      maxlength: 12,
      match: [/^[0-9]{12}$/, 'Numero de la seguridad social no válido']
    },
    genero: {
      type: String,
    },
    contacto: {
      direccion: {
        type: String,
      },
      telefono: {
        type: String,
        match: [/^(6|7|8|9)[0-9]{8}$/, "Teléfono inválido"]
      },
      correo: {
        type: String,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Correo inválido"]
      }

    },
    alergias: {
      type: String,

    },
    grupo_sanguineo: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-']
    },
    estado_paciente: {
      type: String,
      enum: ['activo', 'baja temporal', 'fallecido']
    },
  });

  const Paciente = model<Pacientes>('Paciente', PacientesSchema);

  const paciente1 = new Paciente({
    /**
    nombre_completo: string,
    fecha_nacimiento: Date,
    identificacion: string,     // unico
    seguridad_social: string,               // unico
    genero: string,
    contacto: string,
    alergias: string,
    grupo_sanguineo: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | '0+' | '0-',
    estado_paciente: 'activo' | 'baja temporal' | 'fallecido',
     */
    nombre_completo: "Nombre Apellido McApellido",


  });

  paciente1.save().then((result) => {
    console.log(result);
  }).catch((error) => {
    console.log(error);
  });
}).catch(() => {
  console.log('Something went wrong when conecting to the database');
});