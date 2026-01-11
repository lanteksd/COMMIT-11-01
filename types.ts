export interface VitalSigns {
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
}

export interface DailyLog {
  id: string;
  residentId: string;
  timestamp: string; // ISO String
  type: 'VITALS' | 'MEAL' | 'HYGIENE' | 'MEDICATION' | 'MOOD' | 'NOTE';
  description: string;
  vitals?: VitalSigns;
  mood?: 'Happy' | 'Neutral' | 'Sad' | 'Agitated' | 'Confused';
  staffName: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDue: string;
}

export interface Resident {
  id: string;
  name: string;
  age: number;
  roomNumber: string;
  admissionDate: string;
  photoUrl: string;
  medicalConditions: string[];
  allergies: string[];
  dietaryRestrictions: string;
  mobilityStatus: 'Independent' | 'Cane' | 'Walker' | 'Wheelchair' | 'Bedbound';
  medications: Medication[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
}

export type ResidentContextType = {
  residents: Resident[];
  logs: DailyLog[];
  addLog: (log: DailyLog) => void;
  getResidentLogs: (residentId: string) => DailyLog[];
};