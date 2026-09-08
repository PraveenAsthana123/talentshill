import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SurveyAnswer, SurveyResult } from '@/types';

interface SurveyState {
  currentStep: number;
  answers: SurveyAnswer[];
  result: SurveyResult | null;
  isComplete: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setAnswer: (answer: SurveyAnswer) => void;
  setResult: (result: SurveyResult) => void;
  reset: () => void;
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set) => ({
      currentStep: 0,
      answers: [],
      result: null,
      isComplete: false,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
      prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),

      setAnswer: (answer) =>
        set((s) => {
          const existing = s.answers.findIndex((a) => a.questionId === answer.questionId);
          const newAnswers = [...s.answers];
          if (existing >= 0) {
            newAnswers[existing] = answer;
          } else {
            newAnswers.push(answer);
          }
          return { answers: newAnswers };
        }),

      setResult: (result) => set({ result, isComplete: true }),
      reset: () => set({ currentStep: 0, answers: [], result: null, isComplete: false }),
    }),
    { name: 'talentshill-survey' }
  )
);
