import { customAlphabet } from 'nanoid';
import { JOIN_CODE_CHARSET, JOIN_CODE_LENGTH } from 'shared';
import { prisma } from '../db/prisma';

const generate = customAlphabet(JOIN_CODE_CHARSET, JOIN_CODE_LENGTH);

/** Generates a join code guaranteed unique against the DB at call time. */
export async function generateUniqueJoinCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = generate();
    const existing = await prisma.game.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error('Failed to generate a unique join code after 20 attempts');
}
