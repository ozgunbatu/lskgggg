"use client";

export default function useSuppliersMutations(mutations: any) {
  return {
    saveSupplier: mutations.saveSupplier,
    delSupplier: mutations.delSupplier,
    recalc: mutations.recalc,
    importCsv: mutations.importCsv,
    getSupAI: mutations.getSupAI,
    getSupCAP: mutations.getSupCAP,
  };
}
