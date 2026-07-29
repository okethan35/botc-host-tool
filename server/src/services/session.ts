import { nanoid } from 'nanoid';
import { SESSION_TOKEN_LENGTH } from 'shared';

/** Opaque per-player reconnect secret. Conversion (phantom -> real) issues a fresh one. */
export function generateSessionToken(): string {
  return nanoid(SESSION_TOKEN_LENGTH);
}

/** Opaque host-authority secret, issued once at game creation. */
export function generateHostToken(): string {
  return nanoid(SESSION_TOKEN_LENGTH);
}
