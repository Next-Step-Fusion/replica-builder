import { ActionIcon, Tooltip } from '@mantine/core';
import { IconFocusCentered } from '@tabler/icons-react';

interface PanControlProps {
  resetPan: () => void;
}

export function PanControl({ resetPan }: PanControlProps) {
  return (
    <Tooltip label="Reset pan">
      <ActionIcon size="xs" variant="default" onClick={resetPan}>
        <IconFocusCentered />
      </ActionIcon>
    </Tooltip>
  );
}
