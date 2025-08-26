import { useEffect, useRef, useState } from 'react';
import { CoordinatesViewportPlugin } from '../viewport/CoordinatesViewportPlugin';
import { CopyPasteViewportPlugin } from '../viewport/CopyPasteViewportPlugin';
import { DragSelectionViewportPlugin } from '../viewport/DragSelectionViewportPlugin';
import { HotkeyViewportPlugin } from '../viewport/HotkeyViewportPlugin';
import { SelectionViewportPlugin } from '../viewport/SelectionViewportPlugin';
import { ZoomPanPlugin } from '../viewport/ZoomPanPlugin';
import { ShapeStore } from './ShapeStore';
import { getBuilderSettingsStore } from './getBuilderSettingsStore';

export function useBuilderState() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [shapeStore] = useState(() => new ShapeStore());
  const [builderSettingsStore] = useState(() => getBuilderSettingsStore());
  const [coordinatesPlugin] = useState(() => new CoordinatesViewportPlugin(builderSettingsStore));
  const [selectionPlugin] = useState(() => new SelectionViewportPlugin(shapeStore));
  const [dragSelectionPlugin] = useState(() => new DragSelectionViewportPlugin(shapeStore));
  const [deleteHotkeysPlugin] = useState(() => new HotkeyViewportPlugin(shapeStore));
  const [copyPastePlugin] = useState(() => new CopyPasteViewportPlugin(shapeStore));
  const [viewportState, setViewportState] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0
  });
  const [zoomPanPlugin] = useState(
    () =>
      new ZoomPanPlugin((newState) => {
        setViewportState(newState);
      })
  );

  const setZoom = (newScale: number) => {
    zoomPanPlugin.setZoom(newScale);
  };

  const resetPan = () => {
    zoomPanPlugin.resetPan();
  };

  const screenToWorld = (screenX: number, screenY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = screenX;
    svgPoint.y = screenY;

    const invertedMatrix = svgRef.current.getScreenCTM()?.inverse();
    if (!invertedMatrix) return { x: 0, y: 0 };

    const worldPoint = svgPoint.matrixTransform(invertedMatrix);

    return {
      x: (worldPoint.x - viewportState.translateX) / viewportState.scale,
      y: (worldPoint.y - viewportState.translateY) / viewportState.scale
    };
  };

  const worldToScreen = (worldX: number, worldY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };

    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };

    return {
      x: worldX * viewportState.scale + viewportState.translateX,
      y: worldY * viewportState.scale + viewportState.translateY
    };
  };

  useEffect(() => {
    document.addEventListener('keydown', (event) => {
      // Check if Ctrl (Windows/Linux) or Cmd (Mac) is pressed
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (isCtrlOrCmd && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        shapeStore.undo();
      } else if (isCtrlOrCmd && ((event.key === 'z' && event.shiftKey) || event.key === 'y')) {
        event.preventDefault();
        shapeStore.redo();
      }
    });
  }, [shapeStore]);

  useEffect(() => {
    if (!svgRef.current) return;
    const node = svgRef.current;

    selectionPlugin.attach(node);
    dragSelectionPlugin.attach(node);
    deleteHotkeysPlugin.attach(node);
    copyPastePlugin.attach(node);
    zoomPanPlugin.attach(node);
    zoomPanPlugin.resetPan();
    zoomPanPlugin.setZoom(1);

    return () => {
      selectionPlugin.detach();
      dragSelectionPlugin.detach();
      deleteHotkeysPlugin.detach();
      copyPastePlugin.detach();
      zoomPanPlugin.detach();
    };
  }, [svgRef.current, shapeStore, coordinatesPlugin, dragSelectionPlugin, zoomPanPlugin]);

  useEffect(() => {
    if (!svgRef.current) return;
    coordinatesPlugin.attach(svgRef.current);
    return () => {
      coordinatesPlugin.detach();
    };
  }, [svgRef.current]);

  useEffect(() => {
    return () => {
      shapeStore.dispose();
    };
  }, []);

  return {
    builderSettingsStore,
    containerRef,
    svgRef,
    shapeStore,
    viewportState,
    setZoom,
    resetPan,
    screenToWorld,
    worldToScreen
  };
}

export type BuilderState = ReturnType<typeof useBuilderState>;
