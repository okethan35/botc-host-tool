export function gameRoom(gameId: string): string {
  return `game:${gameId}`;
}

export function hostRoom(gameId: string): string {
  return `game:${gameId}:host`;
}
