"use client";

export default function useReportsFeatureState(runtime: any) {
  return {
    reports: {
      rYear: runtime.rYear,
      setRYear: runtime.setRYear,
      draft: runtime.draft,
      setDraft: runtime.setDraft,
      draftTs: runtime.draftTs,
      setDraftTs: runtime.setDraftTs,
      genLd: runtime.genLd,
      setGenLd: runtime.setGenLd,
    },
    ai: {
      aiMsgs: runtime.aiMsgs,
      setAiMsgs: runtime.setAiMsgs,
      aiInput: runtime.aiInput,
      setAiInput: runtime.setAiInput,
      aiLd: runtime.aiLd,
      setAiLd: runtime.setAiLd,
      aiEnd: runtime.aiEnd,
    },
  };
}
