import { cn } from '@/util/cn';
import { observer } from 'mobx-react-lite';
import { DraggablePoint } from '../shapes/DraggablePoint';
import type { Shape } from '../shapes/Shape';
import { getStrokeColor } from './getStrokeColor';
import { getStrokeWidth } from './getStrokeWidth';

const hitboxStrokeWidth = 16;
const boundingBoxPadding = hitboxStrokeWidth / 2 + 2;

export const SVGShape = observer(({ shape }: { shape: Shape }) => {
  return (
    <g>
      {/* Hitbox */}
      <path
        d={shape.path}
        stroke="transparent"
        strokeLinecap="square"
        pointerEvents="stroke"
        strokeWidth={hitboxStrokeWidth}
        fill="none"
        ref={shape.setNode} // Events will be captured by this path
      />
      {/* Visible path */}
      <path
        d={shape.path}
        stroke={getStrokeColor(shape.element, shape.hasValidationError)}
        strokeLinecap="square"
        strokeDasharray={shape.isSelected ? '5, 5' : '0'}
        strokeWidth={getStrokeWidth(shape.element)}
        pointerEvents="none"
        fill="transparent"
        className={cn(
          !shape.isBuilding && 'transition-colors duration-200 ease-in-out hover:stroke-yellow-600'
        )}
      />
      {/* Point Drag Handles */}
      {shape.isSelected &&
        shape.points.map((point) => <DraggablePoint key={point.id} marker={point} />)}
      {/* Bounding Box */}
      {shape.resizeable && shape.isSelected && shape.boundingBox && !shape.isBuilding && (
        <>
          <rect
            x={shape.boundingBox.minX - boundingBoxPadding}
            y={shape.boundingBox.minY - boundingBoxPadding}
            width={shape.boundingBox.maxX - shape.boundingBox.minX + boundingBoxPadding * 2}
            height={shape.boundingBox.maxY - shape.boundingBox.minY + boundingBoxPadding * 2}
            stroke="#dfdfdf"
            strokeWidth={2}
            fill="none"
            pointerEvents="none"
          />
          {shape.resizeHandles?.map((handle) => (
            <DraggablePoint key={handle.id} marker={handle} variant="resize_handle" />
          ))}
        </>
      )}
      {/* Rotation Handle */}
      {shape.rotatable &&
        shape.isSelected &&
        shape.rotationOrigin &&
        shape.rotateHandle &&
        !shape.isBuilding &&
        !shape.isDragging && (
          <>
            <line
              x1={shape.rotationOrigin.x}
              y1={shape.rotationOrigin.y}
              x2={shape.rotateHandle.x}
              y2={shape.rotateHandle.y}
              stroke="#dfdfdf"
              strokeWidth={2}
              pointerEvents="none"
            />
            <DraggablePoint
              key={shape.rotateHandle.id}
              marker={shape.rotateHandle}
              variant="rotate_handle"
            />
          </>
        )}
    </g>
  );
});
