import { useState } from 'react';
import type { PendingSetupChoice } from 'shared';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

interface SetupChoiceModalProps {
  pending: PendingSetupChoice[];
  onAnswer: (roleId: string, chosenValue: number) => void;
}

/**
 * Renders when `roles:setupChoiceRequired` arrives - blocks the grimoire
 * with a stepper per pending role (e.g. "Baron drawn - add how many
 * outsiders? 0 / 1 / 2") until every pending choice has been answered.
 */
export function SetupChoiceModal({ pending, onAnswer }: SetupChoiceModalProps) {
  if (pending.length === 0) return null;
  return (
    <Modal open onClose={() => undefined} title="Setup choice required">
      <div className="flex flex-col gap-4">
        {pending.map((choice) => (
          <SetupChoiceRow key={choice.roleId} choice={choice} onAnswer={onAnswer} />
        ))}
      </div>
    </Modal>
  );
}

function SetupChoiceRow({
  choice,
  onAnswer,
}: {
  choice: PendingSetupChoice;
  onAnswer: (roleId: string, chosenValue: number) => void;
}) {
  const options = Array.from({ length: choice.max - choice.min + 1 }, (_, i) => choice.min + i);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="rounded-lg border border-ink/30 p-3">
      <p className="mb-2 text-sm text-ink">
        <span className="font-semibold">{choice.roleName}</span> drawn - choose a value from {choice.min} to{' '}
        {choice.max} (adjusts the {choice.offsetTeam} count accordingly).
      </p>
      <div className="flex gap-2">
        {options.map((value) => (
          <Button
            key={value}
            variant={selected === value ? 'primary' : 'secondary'}
            onClick={() => setSelected(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      <Button
        className="mt-3"
        disabled={selected === null}
        onClick={() => selected !== null && onAnswer(choice.roleId, selected)}
      >
        Confirm
      </Button>
    </div>
  );
}
