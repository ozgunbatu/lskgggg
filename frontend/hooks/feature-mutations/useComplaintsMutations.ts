"use client";

export default function useComplaintsMutations(mutations: any) {
  return {
    submitComplaint: mutations.submitComplaint,
    triageComplaint: mutations.triageComplaint,
    updateComplaintStatus: mutations.updateComplaintStatus,
    saveComplaintNote: mutations.saveComplaintNote,
  };
}
