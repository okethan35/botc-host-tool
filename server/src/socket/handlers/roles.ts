import { SOCKET_EVENTS } from 'shared';
import { assignRoles } from '../../services/roleAssignment';
import { resolvePending } from '../../services/roleAssignment/pendingChoices';
import { requireHostState } from './guards';
import type { TypedServer, TypedSocket } from '../types';

/** Triggers/resumes the round-based role assignment pipeline (build plan section 5a). */
export function registerRolesHandlers(io: TypedServer, socket: TypedSocket): void {
  socket.on(SOCKET_EVENTS.ROLES_ASSIGN, () => {
    const state = requireHostState(socket);
    if (!state) return;
    void assignRoles(state, io);
  });

  socket.on(SOCKET_EVENTS.ROLES_SETUP_CHOICE_ANSWER, ({ roleId, chosenValue }) => {
    const state = requireHostState(socket);
    if (!state) return;
    resolvePending(state.game.id, roleId, chosenValue);
  });
}
