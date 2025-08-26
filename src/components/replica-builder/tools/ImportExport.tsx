
import { Button, FileButton } from '@mantine/core';
import { useRef } from 'react';
import type { BuilderState } from '../lib/useBuilderState';



export function ImportExport({ state }: { state: BuilderState }) {
  const resetRef = useRef<() => void>(() => {});


  const handleImport = (file: File | null) => {
    if (!file) return;
    resetRef.current?.();
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target?.result as string);
      state.shapeStore.import(data);
    };
    reader.readAsText(file);
  };
  const handleExport = () => {
    const data = state.shapeStore.export();
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'replica-builder-export.json';
    a.click();
  };

  return (
    <div className="flex flex-wrap content-start items-center gap-2">
      <MenuButton onClick={() => state.shapeStore.shapes.clear()}>New Replica</MenuButton>


      <FileButton onChange={handleImport} accept=".json" resetRef={resetRef}>
        {(props) => <MenuButton {...props}>Import from file</MenuButton>}
      </FileButton>
      <MenuButton onClick={handleExport}>Export to file</MenuButton>
    </div>
  );
}


const MenuButton = Button.withProps({
  size: 'compact-xs',
  variant: 'transparent'
});
