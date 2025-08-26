import { observer } from 'mobx-react-lite';
import type React from 'react';
import type { BuilderState } from '../lib/useBuilderState';
import { CartesianAxes } from './CartesianAxes';
import { Grid } from './Grid';

export const Viewport = observer(
  ({ state, children }: { state: BuilderState; children: React.ReactNode }) => {
    return (
      <svg preserveAspectRatio="xMidYMid meet" className="h-full w-full" ref={state.svgRef}>
        <g
          transform={`translate(${state.viewportState.translateX} ${state.viewportState.translateY}) scale(${state.viewportState.scale})`}
        >
          {state.builderSettingsStore.showGrid && <Grid />}
          {state.shapeStore.backgroundImage.imageUrl && (
            <image
              href={state.shapeStore.backgroundImage.imageUrl}
              x={state.shapeStore.backgroundImage.center.x}
              y={-state.shapeStore.backgroundImage.center.y}
              opacity={state.shapeStore.backgroundImage.opacity}
              width={state.shapeStore.backgroundImage.width}
              // height={state.shapeStore.backgroundImage.scale}
            />
          )}
          <CartesianAxes />
          {state.shapeStore.plasmaShapePath && (
            <path d={state.shapeStore.plasmaShapePath} stroke="red" strokeWidth={2} fill="none" />
          )}
          {children}
        </g>
      </svg>
    );
  }
);
