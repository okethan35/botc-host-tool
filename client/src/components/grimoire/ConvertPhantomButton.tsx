import { QRCodeSVG } from 'qrcode.react';
import type { Player } from 'shared';
import { Button } from '../shared/Button';

interface ConvertPhantomButtonProps {
  player: Player;
  claimUrl?: string;
  onConvert: (playerId: string) => void;
}

/**
 * Phantom -> real conversion. Two distinct states, not one - the server
 * flips `hasDevice` to true in the very same event that hands back the
 * claim link, so gating this whole block on `!player.hasDevice` (the old
 * behavior) made the QR/link disappear the instant it became available.
 * Now driven by whether a `claimUrl` is cached for this player instead.
 */
export function ConvertPhantomButton({ player, claimUrl, onConvert }: ConvertPhantomButtonProps) {
  if (claimUrl) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-ink/30 p-3">
        <p className="text-center text-sm text-ink/80">
          Have {player.displayName} scan this code or open the link on their own phone to claim this seat.
        </p>
        <QRCodeSVG value={claimUrl} size={160} bgColor="#f4ecd8" fgColor="#2b2013" />
        <a href={claimUrl} target="_blank" rel="noreferrer" className="break-all text-xs text-neutral underline">
          {claimUrl}
        </a>
        <Button variant="ghost" className="text-xs" onClick={() => onConvert(player.id)}>
          Generate a new link
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-ink/30 p-3">
      <p className="text-sm text-ink/80">
        No device attached. Convert to let this player claim their seat from their own phone.
      </p>
      <Button variant="secondary" onClick={() => onConvert(player.id)}>
        Convert to real player
      </Button>
    </div>
  );
}
