import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ServiceData {
  category: string;
  service: string;
}

export interface DateTimeData {
  date: string;
  time: string;
  timezone: string;
  duration: '30' | '60' | '90';
}

export interface ContactData {
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  companySize: string;
}

export interface RequirementsData {
  useCase: string;
  budget: string;
  timeline: string;
  goals: string[];
  challenges: string;
}

interface BookingState {
  currentStep: number;
  serviceData: ServiceData | null;
  dateTimeData: DateTimeData | null;
  contactData: ContactData | null;
  requirementsData: RequirementsData | null;
  isSubmitting: boolean;
  isComplete: boolean;
  appointmentId: string | null;
  leadScore: number | null;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateServiceData: (data: ServiceData) => void;
  updateDateTimeData: (data: DateTimeData) => void;
  updateContactData: (data: ContactData) => void;
  updateRequirementsData: (data: RequirementsData) => void;
  setSubmitting: (v: boolean) => void;
  setComplete: (appointmentId: string, leadScore: number) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  serviceData: null,
  dateTimeData: null,
  contactData: null,
  requirementsData: null,
  isSubmitting: false,
  isComplete: false,
  appointmentId: null,
  leadScore: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(4, s.currentStep + 1) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),

      updateServiceData: (data) => set({ serviceData: data }),
      updateDateTimeData: (data) => set({ dateTimeData: data }),
      updateContactData: (data) => set({ contactData: data }),
      updateRequirementsData: (data) => set({ requirementsData: data }),

      setSubmitting: (v) => set({ isSubmitting: v }),
      setComplete: (appointmentId, leadScore) =>
        set({ isComplete: true, isSubmitting: false, appointmentId, leadScore }),
      reset: () => set(initialState),
    }),
    { name: 'th-booking' }
  )
);
