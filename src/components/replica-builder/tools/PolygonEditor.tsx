import { observer } from 'mobx-react-lite';
import type { Shape } from '../shapes/Shape';
import { PointEditRow } from './PointEditRow';

export const PolygonEditor = observer(({ shape }: { shape: Shape }) => {
  return (
    <div className="flex flex-col">
      {shape.points.map((point, index) => (
        <PointEditRow key={point.id} shape={shape} index={index} />
      ))}
    </div>
  );
});
