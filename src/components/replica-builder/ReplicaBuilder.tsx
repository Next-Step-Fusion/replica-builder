import { observer } from 'mobx-react-lite';
import { useBuilderState } from './lib/useBuilderState';
import { BuilderSettings } from './settings/BuilderSettings';
import { ImportExport } from './tools/ImportExport';
import { ShapeInspector } from './tools/ShapeInspector';
import { ToolBox } from './tools/ToolBox';
import { SVGShape } from './viewport/SVGShape';
import { Viewport } from './viewport/Viewport';

export const ReplicaBuilder = observer(() => {
  const state = useBuilderState();

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <ImportExport state={state} />
      <div className="flex flex-col gap-0">
        <BuilderSettings state={state} />
        <div className="mt-3 mb-3 h-0.25 bg-gray-100" />
        <div className="flex w-full justify-between gap-5">
          <ToolBox state={state} />
        </div>
      </div>
      <div className="relative h-full w-full">
        <Viewport state={state}>
          {state.shapeStore.shapes.map((shape) => (
            <SVGShape key={shape.id} shape={shape} />
          ))}
        </Viewport>
        <ShapeInspector state={state} />
      </div>
    </div>
  );
});
