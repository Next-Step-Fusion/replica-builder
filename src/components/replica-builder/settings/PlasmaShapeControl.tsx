import { NumberInput, Popover, SimpleGrid, Switch } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import type { PlasmaShape } from '../lib/ShapeStore';
import { BuilderState } from '../lib/useBuilderState';
import { ToggleControl } from './ToggleControl';

const plasmaParams: { key: PlasmaShapeParam; label: string }[] = [
  { key: 'R', label: 'R' },
  { key: 'upperElongation', label: 'k - top' },
  { key: 'lowerElongation', label: 'k - bottom' },
  { key: 'Z', label: 'Z' },
  { key: 'upperTriangularity', label: 'δ - top' },
  { key: 'lowerTriangularity', label: 'δ - bottom' },
  { key: 'a', label: 'a' },
  { key: 'upperXPointSeverity', label: 'S - top' },
  { key: 'lowerXPointSeverity', label: 'S - bottom' }
];

type PlasmaShapeParam = keyof Omit<PlasmaShape, 'show'>;

export const PlasmaShapeControl = observer(({ state }: { state: BuilderState }) => {
  return (
    <Popover
      withArrow
      withOverlay
      position="bottom-start"
      onOpen={() => (state.shapeStore.pausePlasmaShapeCalculation = true)}
      onClose={() => (state.shapeStore.pausePlasmaShapeCalculation = false)}
    >
      <Popover.Target>
        <ToggleControl value={true} icon={<PlasmaIcon />} />
      </Popover.Target>
      <Popover.Dropdown className="bg-gray-50">
        <PlasmaShapeParamPopoverContent state={state} />
      </Popover.Dropdown>
    </Popover>
  );
});

const PlasmaShapeParamPopoverContent = observer(({ state }: { state: BuilderState }) => {
  const { plasmaShape } = state.shapeStore;

  const setPlasmaShapeParam = (key: PlasmaShapeParam, value: number) => {
    plasmaShape[key] = value;
  };

  return (
    <div className="p-4">
      <Switch
        label="Show plasma shape"
        className="mb-6 font-medium"
        checked={plasmaShape.show}
        onChange={(event) => (plasmaShape.show = event.currentTarget.checked)}
      />

      <SimpleGrid cols={3}>
        {plasmaParams.map(({ key: paramKey, label }) => (
          <NumberInput
            key={paramKey}
            size="xs"
            label={label}
            defaultValue={plasmaShape[paramKey] as number}
            onChange={(v) => {
              if (typeof v === 'string') return;
              setPlasmaShapeParam(paramKey, v);
            }}
            step={1}
            decimalScale={9}
          />
        ))}
      </SimpleGrid>
    </div>
  );
});

function PlasmaIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon icon-tabler icons-tabler-outline icon-tabler-oval"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-6 0a5.2 8 14 1 0 12 0a5 9 -11 1 0 -12.2 0" />
    </svg>
  );
}
