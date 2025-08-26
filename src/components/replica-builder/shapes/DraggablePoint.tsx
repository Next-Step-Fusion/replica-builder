import { observer } from 'mobx-react-lite';
import type { Marker } from './Marker';

const handleSize = 10;

export type DraggablePointVariant = 'shape_point' | 'resize_handle' | 'rotate_handle';
export const DraggablePoint = observer(function DraggablePoint({
  marker,
  variant = 'shape_point'
}: {
  marker: Marker;
  variant?: DraggablePointVariant;
}) {
  let fill = 'blue';
  if (variant === 'shape_point') {
    if (marker.isCurveControl) {
      fill = 'black';
    } else {
      fill = 'red';
    }
  } else if (variant === 'resize_handle') {
    fill = 'blue';
  } else if (variant === 'rotate_handle') {
    fill = 'green';
  }
  let radius = 5;
  if (variant === 'resize_handle') {
    radius = 0;
  }

  return (
    <rect
      x={marker.x - handleSize / 2}
      y={marker.y - handleSize / 2}
      width={handleSize}
      height={handleSize}
      rx={radius}
      fill={marker.isDragging ? 'black' : fill}
      ref={marker.setNode}
      stroke="black"
      strokeWidth={0}
      className="hover:animate-pulse hover:stroke-2"
    />
  );
});
