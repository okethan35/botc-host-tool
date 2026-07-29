import { useState } from 'react';
import { Button } from '../shared/Button';
import { TextField } from '../shared/TextField';

interface PhantomPlayerFormProps {
  onAdd: (displayName: string) => void;
}

export function PhantomPlayerForm({ onAdd }: PhantomPlayerFormProps) {
  const [name, setName] = useState('');

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  };

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <TextField
        label="Add phantom player"
        placeholder="Display name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button type="submit" variant="secondary">
        Add
      </Button>
    </form>
  );
}
