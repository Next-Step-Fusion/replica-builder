import { Slider } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { Shape } from '../shapes/Shape';
import { InspectorNumberInput } from './InspectorInputs';

const labelWidth = '5rem';

export const DimensionEditor = observer(({ shape }: { shape: Shape }) => {
  return (
    <div className="center m-auto flex flex-col gap-1 px-2">
      <InspectorNumberInput
        label="center X"
        value={shape.center?.x ?? 0}
        onChange={(x) => (shape.center = { x: x as number, y: shape.center?.y ?? 0 })}
        labelWidth={labelWidth}
      />
      <InspectorNumberInput
        label="center Y"
        value={-(shape.center?.y ?? 0)}
        onChange={(y) => (shape.center = { x: shape.center?.x ?? 0, y: -y as number })}
        labelWidth={labelWidth}
      />
      <div className="mt-1 h-px w-full bg-gray-200" />
      <InspectorNumberInput
        value={shape.width}
        label="width"
        onChange={(width) => (shape.width = width as number)}
        labelWidth={labelWidth}
      />
      <InspectorNumberInput
        label="height"
        value={shape.height}
        onChange={(height) => (shape.height = height as number)}
        labelWidth={labelWidth}
      />
      {shape.shapeType === 'parallelogram' && (
        <InspectorNumberInput
          label="first angle"
          value={shape.firstAngle}
          onChange={(angle) => (shape.firstAngle = angle as number)}
          labelWidth={labelWidth}
        />
      )}
      <div className="mt-1 h-px w-full bg-gray-200" />
      <InspectorNumberInput
        label="rotate by"
        value={shape.rotationAngleDegrees}
        allowNegative={true}
        min={0}
        max={180}
        onChange={(angle) => shape.rotateDegrees(angle as number)}
        labelWidth={labelWidth}
      />
      <Slider
        className="ml-20"
        value={shape.rotationAngleDegrees}
        size="xs"
        label={null}
        min={-360}
        max={360}
        onChange={(angle) => shape.rotateDegrees(angle as number)}
      />
    </div>
  );
});
