export function snapshotValue<T>(value: T): T {
  if (Array.isArray(value)) return [...value] as T;
  if (value && typeof value === "object") return { ...(value as any) } as T;
  return value;
}

export async function withRollback<T>({
  snapshot,
  apply,
  rollback,
  commit,
}: {
  snapshot: T;
  apply: () => void;
  rollback: (prev: T) => void;
  commit: () => Promise<void>;
}) {
  apply();
  try {
    await commit();
  } catch (error) {
    rollback(snapshot);
    throw error;
  }
}
