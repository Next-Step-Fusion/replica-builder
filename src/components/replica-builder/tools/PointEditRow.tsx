import { LucideCircle } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Shape } from '../shapes/Shape';
import { InspectorNumberInput } from './InspectorInputs';

export const PointEditRow = observer(({ shape, index }: { shape: Shape; index: number }) => {
  const point = shape.points[index]!;

  const setX = (x: string | number) => {
    if (typeof x === 'string') {
      point.x = parseFloat(x);
    } else {
      point.x = x;
    }
  };
  const setY = (y: string | number) => {
    if (typeof y === 'string') {
      point.y = parseFloat(y);
    } else {
      point.y = -y;
    }
  };

  return (
    <div className={`px-2 py-1 ${index % 2 === 1 ? 'bg-blue-100/60' : ''}`}>
      <div className="flex flex-row items-center gap-1">
        <div className="flex w-14 flex-row items-center gap-1">
          <LucideCircle
            fill={point.isCurveControl ? 'black' : 'red'}
            stroke="none"
            className="inline size-2"
          />
          {point.id}
        </div>
        <div className="flex items-center gap-1">
          <InspectorNumberInput value={point.x} onChange={setX} label="x" labelWidth="0.8rem" />
        </div>
        <div className="flex items-center gap-1 pl-1">
          <InspectorNumberInput value={-point.y} onChange={setY} label="y" labelWidth="0.8rem" />
        </div>
      </div>
    </div>
  );
});
