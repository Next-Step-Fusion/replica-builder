import { LucideX } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { BuilderState } from '../lib/useBuilderState';
import type { Shape } from '../shapes/Shape';
import { DimensionEditor } from './DimensionEditor';
import { InspectorSection } from './InspectorSection';
import { MetadataEditor } from './MetadataEditor';
import { PointEditor } from './PointEditor';
import { PolygonEditor } from './PolygonEditor';
import { ShapePointsInfo } from './ShapePointsInfo';
import { VectorEditor } from './VectorEditor';

export const ShapeInspector = observer(({ state }: { state: BuilderState }) => {
  if (
    state.builderSettingsStore.showShapeInspector === false ||
    state.shapeStore.selectedShapes.length === 0 ||
    !!state.shapeStore.unfinishedShape
  ) {
    return null;
  }

  const shape = state.shapeStore.selectedShapes[0]!;

  return (
    <div className="absolute top-2 right-2 max-h-full w-60 overflow-y-scroll rounded-sm bg-blue-50 shadow-xl select-none">
      <div className="flex flex-row items-center justify-between bg-blue-100 px-2 py-1">
        <div className="text-md font-bold text-black">{shape.element}</div>
        <LucideX
          className="size-4"
          onClick={() => state.builderSettingsStore.setShowShapeInspector(false)}
        />
      </div>

      {shape.isBuilding ? null : <ShapeView key={shape.id} shape={shape} />}
    </div>
  );
});

const ShapeView = observer(({ shape }: { shape: Shape }) => {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-gray-200 last-of-type:border-b-0">
      <InspectorSection label="shape id" className="text-center">
        {shape.id}
      </InspectorSection>
      {shape.shapeType === 'point' && (
        <InspectorSection label="edit point">
          <PointEditor shape={shape} />
        </InspectorSection>
      )}
      {shape.shapeType === 'polygon' && (
        <>
          <InspectorSection label="edit shape">
            <DimensionEditor shape={shape} />
          </InspectorSection>
          <InspectorSection label="edit points">
            <PolygonEditor shape={shape} />
          </InspectorSection>
        </>
      )}
      {shape.shapeType === 'vector' && (
        <InspectorSection label="edit points">
          <VectorEditor shape={shape} />
        </InspectorSection>
      )}
      {shape.shapeType === 'parallelogram' && (
        <InspectorSection label="edit shape">
          <DimensionEditor shape={shape} />
        </InspectorSection>
      )}
      {shape.metadata && (
        <InspectorSection label="metadata">
          <MetadataEditor shape={shape} />
        </InspectorSection>
      )}
      <InspectorSection label="points" className="flex items-center justify-center">
        <ShapePointsInfo shape={shape} />
      </InspectorSection>
    </div>
  );
});
