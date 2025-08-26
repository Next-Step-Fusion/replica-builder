import { ActionIcon, Slider, Tooltip } from '@mantine/core';
import { IconMinus, IconPlus, IconZoomReset } from '@tabler/icons-react';

export function ZoomControl({
  level,
  setZoom,
  min,
  max,
  factor
}: {
  level: number;
  setZoom: (level: number) => void;
  min: number;
  max: number;
  factor: number;
}) {
  return (
    <div className="flex flex-1 items-center justify-end gap-2">
      <ActionIcon size="xs" variant="default" onClick={() => setZoom(level - factor)}>
        <IconMinus />
      </ActionIcon>
      <Slider
        size="md"
        min={min}
        max={max}
        step={factor}
        showLabelOnHover={false}
        value={level}
        onChange={setZoom}
        className="w-full max-w-40 min-w-20"
      />
      <ActionIcon size="xs" variant="default" onClick={() => setZoom(level + factor)}>
        <IconPlus />
      </ActionIcon>
      <Tooltip label="Reset zoom">
        <ActionIcon size="xs" variant="default" onClick={() => setZoom(1)}>
          <IconZoomReset />
        </ActionIcon>
      </Tooltip>
    </div>
  );
}
