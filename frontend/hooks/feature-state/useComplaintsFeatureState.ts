"use client";

export default function useComplaintsFeatureState(ui: any) {
  return {
    complaintForm: {
      cSup: ui.cSup,
      setCSup: ui.setCSup,
      cCat: ui.cCat,
      setCCat: ui.setCCat,
      cSev: ui.cSev,
      setCSev: ui.setCSev,
      cDesc: ui.cDesc,
      setCDesc: ui.setCDesc,
    },
    complaintNotes: {
      cNotes: ui.cNotes,
      setCNotes: ui.setCNotes,
    },
    triage: {
      triageRes: ui.triageRes,
      setTriageRes: ui.setTriageRes,
      triageLd: ui.triageLd,
      setTriageLd: ui.setTriageLd,
    },
  };
}
