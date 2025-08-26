import React, { useCallback, useEffect, useState } from 'react';

/**
 * @param draggableId - The id of the draggable element, DO NOT use array index
 */
export function useDraggable(
  draggableId: number,
  onDrag: (draggableId: number, event: MouseEvent) => void
) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      onDrag(draggableId, event);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onDrag, draggableId]);

  return { handleMouseDown, isDragging };
}
