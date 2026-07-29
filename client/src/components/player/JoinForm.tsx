import { useState } from 'react';
import { Button } from '../shared/Button';
import { TextField } from '../shared/TextField';

interface JoinFormProps {
  initialCode?: string;
  submitting?: boolean;
  errorMessage?: string | null;
  onJoin: (code: string, displayName: string) => void;
}

export function JoinForm({ initialCode = '', submitting, errorMessage, onJoin }: JoinFormProps) {
  const [code, setCode] = useState(initialCode);
  const [displayName, setDisplayName] = useState('');

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!code.trim() || !displayName.trim()) return;
        onJoin(code.trim().toUpperCase(), displayName.trim());
      }}
    >
      <TextField
        label="Game code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="ABCDE"
        maxLength={5}
        autoCapitalize="characters"
      />
      <TextField
        label="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name"
        maxLength={40}
      />
      {errorMessage ? <p className="text-sm text-evil">{errorMessage}</p> : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Joining…' : 'Join game'}
      </Button>
    </form>
  );
}
