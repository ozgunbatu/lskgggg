"use client";

export default function useReportsMutations(mutations: any) {
  return {
    loadDraft: mutations.loadDraft,
    saveDraft: mutations.saveDraft,
    genSection: mutations.genSection,
    sendAi: mutations.sendAi,
  };
}
