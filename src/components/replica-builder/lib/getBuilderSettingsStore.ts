import { observable } from 'mobx';

export function getBuilderSettingsStore() {
  const store = observable({
    showGrid: true,
    showAxes: true,
    showAxisLabels: true,
    showCoordinates: true,
    showShapeInspector: true,
    setShowGrid: (value: boolean) => {
      store.showGrid = value;
    },
    setShowAxes: (value: boolean) => {
      store.showAxes = value;
    },
    setShowAxisLabels: (value: boolean) => {
      store.showAxisLabels = value;
    },
    setShowCoordinates: (value: boolean) => {
      store.showCoordinates = value;
    },
    setShowShapeInspector: (value: boolean) => {
      store.showShapeInspector = value;
    }
  });
  return store;
}

export type BuilderSettingsStore = ReturnType<typeof getBuilderSettingsStore>;
