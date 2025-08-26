import { observer } from 'mobx-react-lite';
import type { Shape } from '../shapes/Shape';
import { PointEditRow } from './PointEditRow';

export const VectorEditor = observer(({ shape }: { shape: Shape }) => {
  return (
    <div className="flex flex-col gap-1">
      <PointEditRow shape={shape} index={0} />
      <PointEditRow shape={shape} index={1} />
    </div>
  );
});
