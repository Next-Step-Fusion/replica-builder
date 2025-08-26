import { LucideCheck } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import type { Shape } from '../shapes/Shape';

export const ShapePointsInfo = observer(({ shape }: { shape: Shape }) => {
  return (
    <table className="text-right [&_tbody_tr:nth-child(odd)]:bg-blue-100/60 [&_td]:px-3 [&_th]:px-3">
      <thead>
        <tr>
          <th className="text-left text-gray-500">#</th>
          <th>x</th>
          <th>y</th>
          {shape.shapeType === 'polygon' && <th>ctrl</th>}
        </tr>
      </thead>
      <tbody>
        {shape.points.map((point) => (
          <tr key={point.id}>
            <td className="text-left text-gray-500">{point.id}</td>
            <td>{Math.round(point.x)}</td>
            <td>{Math.round(point.y)}</td>
            {shape.shapeType === 'polygon' && (
              <td>{point.isCurveControl ? <LucideCheck className="h-[1em]" /> : null}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
});
