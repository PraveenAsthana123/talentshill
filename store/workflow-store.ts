import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkflowState {
  currentStep: number;
  workflowId: string | null;
  workflowName: string;
  contentId: string | null;
  assetId: string | null;
  shareLinkIds: string[];
  listId: string | null;
  campaignId: string | null;
  approvalStatus: string;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setWorkflowId: (id: string) => void;
  setWorkflowName: (name: string) => void;
  setContentId: (id: string | null) => void;
  setAssetId: (id: string | null) => void;
  addShareLinkId: (id: string) => void;
  removeShareLinkId: (id: string) => void;
  setListId: (id: string | null) => void;
  setCampaignId: (id: string | null) => void;
  setApprovalStatus: (status: string) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  workflowId: null as string | null,
  workflowName: '',
  contentId: null as string | null,
  assetId: null as string | null,
  shareLinkIds: [] as string[],
  listId: null as string | null,
  campaignId: null as string | null,
  approvalStatus: 'draft',
};

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 7) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
      setWorkflowId: (id) => set({ workflowId: id }),
      setWorkflowName: (name) => set({ workflowName: name }),
      setContentId: (id) => set({ contentId: id }),
      setAssetId: (id) => set({ assetId: id }),
      addShareLinkId: (id) => set((s) => ({ shareLinkIds: [...s.shareLinkIds, id] })),
      removeShareLinkId: (id) => set((s) => ({ shareLinkIds: s.shareLinkIds.filter(x => x !== id) })),
      setListId: (id) => set({ listId: id }),
      setCampaignId: (id) => set({ campaignId: id }),
      setApprovalStatus: (status) => set({ approvalStatus: status }),
      reset: () => set(initialState),
    }),
    { name: 'th-marketing-workflow' }
  )
);
