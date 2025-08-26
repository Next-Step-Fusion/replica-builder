import { cn } from '@/util/cn';
import { Button } from '@mantine/core';
import {
  IconArrowUpRightCircle,
  IconBoxModel2,
  IconOval,
  IconPoint,
  IconRectangle,
  IconSquareRotated
} from '@tabler/icons-react';
import { LucideCircle } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import type { BuilderState } from '../lib/useBuilderState';

export const ToolBox = observer(({ state }: { state: BuilderState }) => {
  return (
    <div className="flex flex-wrap gap-6 gap-y-4">
      <ToolButton
        label="Vessel"
        disabled={!state.shapeStore.canCreateVessel}
        icon={<IconBoxModel2 size={16} />}
        onClick={() => state.shapeStore.toggleCreateVessel()}
        active={state.shapeStore.unfinishedShape?.element === 'vessel'}
      />
      <ToolButton
        label="Limiter"
        disabled={!state.shapeStore.canCreateLimiter}
        icon={<IconOval size={16} />}
        onClick={() => state.shapeStore.toggleCreateLimiter()}
        active={state.shapeStore.unfinishedShape?.element === 'limiter'}
      />
      <ToolButton
        label="Coil"
        disabled={!state.shapeStore.canCreateCoil}
        icon={<IconSquareRotated size={16} />}
        onClick={() => state.shapeStore.toggleCreateCoil()}
        active={state.shapeStore.unfinishedShape?.element === 'coil'}
      />
      <ToolButton
        label="Passive"
        disabled={!state.shapeStore.canCreatePassive}
        icon={<IconSquareRotated size={16} />}
        onClick={() => state.shapeStore.toggleCreatePassive()}
        active={state.shapeStore.unfinishedShape?.element === 'passive'}
      />
      <ToolButton
        label="Probe"
        disabled={!state.shapeStore.canCreateProbe}
        icon={<IconArrowUpRightCircle size={16} />}
        onClick={() => state.shapeStore.toggleCreateProbe()}
        active={state.shapeStore.unfinishedShape?.element === 'probe'}
      />
      <ToolButton
        label="Loop"
        disabled={!state.shapeStore.canCreateLoop}
        icon={<IconPoint size={16} />}
        onClick={() => state.shapeStore.toggleCreateLoop()}
        active={state.shapeStore.unfinishedShape?.element === 'loop'}
      />
      <ToolButton
        label="TF Coil"
        disabled={!state.shapeStore.canCreateTFCoil}
        icon={<LucideCircle size={16} />}
        onClick={() => state.shapeStore.toggleCreateTFCoil()}
        active={state.shapeStore.unfinishedShape?.element === 'tf_coil'}
      />
      <ToolButton
        label="Blanket"
        disabled={!state.shapeStore.canCreateBlanket}
        icon={<IconRectangle size={16} />}
        onClick={() => state.shapeStore.toggleCreateBlanket()}
        active={state.shapeStore.unfinishedShape?.element === 'blanket'}
      />
    </div>
  );
});

function ToolButton({
  label,
  icon,
  onClick,
  disabled,
  active
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <Button
      size="xs"
      variant="light"
      onClick={onClick}
      disabled={disabled}
      leftSection={icon}
      className={cn('w-25', active && 'animate-pulse bg-blue-200')}
    >
      {label}
    </Button>
  );
}
