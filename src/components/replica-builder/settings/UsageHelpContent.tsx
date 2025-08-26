import { Kbd } from '@mantine/core';
import { useOs } from '@mantine/hooks';
import { LucideMousePointerClick } from 'lucide-react';

function Description({ children }: { children: React.ReactNode }) {
  return <div className="col-span-3">{children}</div>;
}

function Gesture({ children }: { children: React.ReactNode }) {
  return <div className="col-span-4 italic">{children}</div>;
}

function Divider() {
  return <div className="col-span-full border-b border-gray-200" />;
}

export function UsageHelpContent() {
  const isMac = useOs() === 'macos';
  return (
    <div className="grid grid-cols-7 gap-x-2 gap-y-3 py-2 text-xs">
      <div className="col-span-full">
        <h3 className="mt-0 mb-2 text-sm font-bold">Units</h3>
        <div>
          Coordinates and dimensions - <b>millimeters</b>. Angles - <b>degrees</b>.
        </div>
        <h3 className="mt-4 mb-2 text-sm font-bold">Keyboard shortcuts and gestures</h3>
      </div>
      <Gesture>
        <Kbd size="xs">SHIFT</Kbd> + <ClickIcon />
      </Gesture>
      <Description>Add/remove shape to selection.</Description>
      <Divider />
      <Gesture>
        <Kbd size="xs">BACKSPACE</Kbd>
      </Gesture>
      <Description>Delete selected shapes.</Description>
      <Divider />
      <Gesture>
        <Kbd size="xs">{isMac ? 'CMD' : 'CTRL'}</Kbd> + <Kbd size="xs">C</Kbd> /{' '}
        <Kbd size="xs">{isMac ? 'CMD' : 'CTRL'}</Kbd> + <Kbd size="xs">V</Kbd>
      </Gesture>
      <Description>Copy/paste.</Description>
      <Divider />
      <Gesture>
        <Kbd size="xs">{isMac ? 'CMD' : 'CTRL'}</Kbd> + <Kbd size="xs">Z</Kbd> /{' '}
        <Kbd size="xs">{isMac ? 'CMD' : 'CTRL'}</Kbd> +{' '}
        {isMac ? (
          <>
            <Kbd size="xs">SHIFT</Kbd>+ <Kbd size="xs">Z</Kbd>
          </>
        ) : (
          <Kbd size="xs">Y</Kbd>
        )}
      </Gesture>
      <Description>Undo/redo.</Description>
      <Divider />
      <Gesture>
        <Kbd size="xs">ESC</Kbd>
      </Gesture>
      <Description>Deselect all shapes, cancel currently unfinished shape.</Description>
      <Divider />
      <Gesture>
        <Kbd size="xs">↑</Kbd> <Kbd size="xs">↓</Kbd> <Kbd size="xs">←</Kbd> <Kbd size="xs">→</Kbd>{' '}
        [ + <Kbd size="xs">SHIFT</Kbd> ]
      </Gesture>
      <Description>Move selected shapes. SHIFT to move faster.</Description>
      <Divider />
      <Gesture>
        <AltKey isMac={isMac} /> + <ClickIcon />
      </Gesture>
      <Description>Add/remove a point on polygon.</Description>
      <Divider />
      <Gesture>
        <AltKey isMac={isMac} /> + <Kbd size="xs">SHIFT</Kbd> +
        <ClickIcon />
      </Gesture>
      <Description>Add/remove curve control point on polygon.</Description>
      <Divider />
      <Gesture>scroll</Gesture>
      <Description>Zoom in/out.</Description>
      <Divider />
      <Gesture>
        <AltKey isMac={isMac} /> + drag canvas
      </Gesture>
      <Description>Pan.</Description>
      <Divider />
      <Gesture>
        <Kbd size="xs">SHIFT</Kbd> + drag corner shape handles
      </Gesture>
      <Description>Resize shape with fixed aspect ratio.</Description>
      <Divider />
      <Gesture>
        <AltKey isMac={isMac} /> + draw or drag shape or point
      </Gesture>
      <Description>Restrict movement to vertical axis.</Description>
      <Divider />
      <Gesture>
        <MetaKey isMac={isMac} /> + draw or drag shape or point
      </Gesture>
      <Description>Restrict movement to horizontal axis.</Description>
      <Divider />
      <Gesture>
        <Kbd size="xs">SHIFT</Kbd> + drag curve control point
      </Gesture>
      <Description>Draw symmetric curve.</Description>
    </div>
  );
}

function AltKey({ isMac }: { isMac: boolean }) {
  // if mac, return option, otherwise alt
  return <Kbd size="xs">{isMac ? 'OPTION' : 'ALT'}</Kbd>;
}

function MetaKey({ isMac }: { isMac: boolean }) {
  return <Kbd size="xs">{isMac ? 'COMMAND' : 'WIN/META'}</Kbd>;
}

function ClickIcon() {
  return <LucideMousePointerClick className="mr-2 inline-block size-4 stroke-1" />;
}
