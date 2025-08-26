import { FileInput, NumberInput, Popover, Slider } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { BuilderState } from '../lib/useBuilderState';
import { ToggleControl } from './ToggleControl';

export const BackgroundImageControl = observer(({ state }: { state: BuilderState }) => {
  return (
    <Popover withArrow withOverlay position="bottom-start">
      <Popover.Target>
        <ToggleControl value={true} icon={<IconPhoto />} />
      </Popover.Target>
      <Popover.Dropdown className="bg-gray-50">
        <BackgroundImagePopoverContent state={state} />
      </Popover.Dropdown>
    </Popover>
  );
});

const BackgroundImagePopoverContent = observer(({ state }: { state: BuilderState }) => {
  const [width, setWidth] = useState<string | number>(
    state.shapeStore.backgroundImage.width ?? 500
  );
  const [centerX, setCenterX] = useState<string | number>(
    state.shapeStore.backgroundImage.center.x ?? 0
  );
  const [centerY, setCenterY] = useState<string | number>(
    state.shapeStore.backgroundImage.center.y ?? 0
  );
  const currentFile = state.shapeStore.backgroundImage.imageFile;
  return (
    <div className="w-80 max-w-80">
      <FileInput
        clearable
        label="Show custom image on background"
        placeholder="Select image"
        value={currentFile}
        onChange={(file) => (state.shapeStore.backgroundImage.imageFile = file)}
      />
      {currentFile && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="text-xs">
            <div className="text-sm font-medium">Opacity</div>
            <Slider
              showLabelOnHover={false}
              value={state.shapeStore.backgroundImage.opacity}
              onChange={(value) => (state.shapeStore.backgroundImage.opacity = value)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
          <div>
            <NumberInput
              label="Width"
              value={width}
              onChange={(value) => {
                setWidth(value);
                if (typeof value === 'number') {
                  state.shapeStore.backgroundImage.width = value;
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <NumberInput
              label="Center X"
              value={centerX}
              onChange={(value) => {
                setCenterX(value);
                if (typeof value === 'number') {
                  state.shapeStore.backgroundImage.center.x = value;
                }
              }}
            />
            <NumberInput
              label="Center Y"
              value={centerY}
              onChange={(value) => {
                setCenterY(value);
                if (typeof value === 'number') {
                  state.shapeStore.backgroundImage.center.y = value;
                }
              }}
            />
          </div>
          {state.shapeStore.backgroundImage.imageUrl && (
            <img
              src={state.shapeStore.backgroundImage.imageUrl}
              alt="Background image preview"
              className="aspect-auto max-w-full"
              style={{ opacity: state.shapeStore.backgroundImage.opacity }}
            />
          )}
        </div>
      )}
    </div>
  );
});
