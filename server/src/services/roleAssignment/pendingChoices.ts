/**
 * In-memory map backing the host-choice pause/resume flow: gameId -> pending
 * resolvers awaiting a `roles:setupChoiceAnswer` for a specific roleId. The
 * assignment pipeline `Promise.all`s a batch of `registerPending(...)` calls;
 * each resolves independently as `resolvePending(...)` is invoked by the
 * socket handler, which is the concrete mechanism for "pausing mid-draw" —
 * no timers, no polling.
 */
interface PendingResolver {
  roleId: string;
  resolve: (chosenValue: number) => void;
}

const pendingByGame = new Map<string, PendingResolver[]>();

export function registerPending(gameId: string, roleId: string): Promise<number> {
  return new Promise((resolve) => {
    const list = pendingByGame.get(gameId) ?? [];
    list.push({ roleId, resolve });
    pendingByGame.set(gameId, list);
  });
}

/** Returns true if a matching pending choice was found and resolved. */
export function resolvePending(gameId: string, roleId: string, chosenValue: number): boolean {
  const list = pendingByGame.get(gameId);
  if (!list) return false;
  const index = list.findIndex((p) => p.roleId === roleId);
  if (index === -1) return false;
  const [item] = list.splice(index, 1);
  if (list.length === 0) {
    pendingByGame.delete(gameId);
  }
  item?.resolve(chosenValue);
  return true;
}

export function hasPending(gameId: string): boolean {
  return (pendingByGame.get(gameId)?.length ?? 0) > 0;
}

export function clearPending(gameId: string): void {
  pendingByGame.delete(gameId);
}
