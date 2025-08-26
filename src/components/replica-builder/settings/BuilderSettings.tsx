import { HoverCard, Tooltip } from '@mantine/core';
import { IconHelpSquareRounded } from '@tabler/icons-react';
import { LucideAppWindow, LucideGrid, LucideLocateFixed } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { type BuilderState } from '../lib/useBuilderState';
import { ZOOM_CONFIG } from '../static-elements/constants';
import { BackgroundImageControl } from './BackgroundImageControl';
import { PanControl } from './PanControl';
import { PlasmaShapeControl } from './PlasmaShapeControl';
import { ToggleControl } from './ToggleControl';
import { UsageHelpContent } from './UsageHelpContent';
import { ZoomControl } from './ZoomControl';
const divider = <div className="h-4 w-0.25 bg-gray-200" />;
const spacer = <div className="h-4 flex-1" />;

export function BuilderSettings({ state }: { state: BuilderState }) {
  return (
    <div className="flex w-full flex-initial flex-wrap items-center justify-end gap-4">
      <HoverCard position="bottom-start" withArrow>
        <HoverCard.Target>
          <IconHelpSquareRounded className="size-7.5 overflow-hidden text-stone-400" stroke={1} />
        </HoverCard.Target>
        <HoverCard.Dropdown className="max-h-100 max-w-3/6 overflow-y-auto">
          <UsageHelpContent />
        </HoverCard.Dropdown>
      </HoverCard>
      {/* <Tooltip label="Clear all shapes">
        <ToggleControl
          value={true}
          className="data-[state=on]:bg-red-400"
          toggle={() => state.shapeStore.shapes.clear()}
          icon={<IconTrash />}
        />
      </Tooltip> */}
      <ToggleControls state={state} />
      <PlasmaShapeControl state={state} />
      <BackgroundImageControl state={state} />

      {spacer}
      <ZoomControl
        level={state.viewportState.scale}
        setZoom={state.setZoom}
        min={ZOOM_CONFIG.min}
        max={ZOOM_CONFIG.max}
        factor={ZOOM_CONFIG.factor}
      />
      <PanControl resetPan={state.resetPan} />
    </div>
  );
}

const ToggleControls = observer(({ state }: { state: BuilderState }) => {
  return (
    <div className="flex gap-1">
      <Tooltip label="Show grid">
        <ToggleControl
          value={state.builderSettingsStore.showGrid}
          toggle={() =>
            state.builderSettingsStore.setShowGrid(!state.builderSettingsStore.showGrid)
          }
          icon={<LucideGrid />}
        />
      </Tooltip>
      {/* <ToggleControl
        value={state.showAxes}
        toggle={() => state.setShowAxes(!state.showAxes)}
        icon={<IconAxisX />}
      />
      <ToggleControl
        value={state.showAxisLabels}
        toggle={() => state.setShowAxisLabels(!state.showAxisLabels)}
        icon={<IconNumber123 />}
        disabled={!state.showAxes}
      /> */}
      <Tooltip label="Show coordinates">
        <ToggleControl
          value={state.builderSettingsStore.showCoordinates}
          toggle={() =>
            state.builderSettingsStore.setShowCoordinates(
              !state.builderSettingsStore.showCoordinates
            )
          }
          icon={<LucideLocateFixed />}
        />
      </Tooltip>
      <Tooltip label="Show shape inspector">
        <ToggleControl
          value={state.builderSettingsStore.showShapeInspector}
          toggle={() =>
            state.builderSettingsStore.setShowShapeInspector(
              !state.builderSettingsStore.showShapeInspector
            )
          }
          icon={<LucideAppWindow />}
        />
      </Tooltip>
    </div>
  );
});
