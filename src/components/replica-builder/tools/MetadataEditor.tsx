import { observer } from 'mobx-react-lite';
import type {
  CoilMetadata,
  LoopMetadata,
  PassiveElementMetadata,
  ProbeMetadata,
  VesselMetadata
} from '../shapes/ElementMetadata';
import { Shape } from '../shapes/Shape';
import { InspectorNumberInput, InspectorTextInput } from './InspectorInputs';

export const MetadataEditor = observer(({ shape }: { shape: Shape }) => {
  return (
    <div className="flex flex-col gap-2 px-2">
      {shape.element === 'vessel' && <VesselMetadataEditor shape={shape} />}
      {shape.element === 'coil' && <CoilMetadataEditor shape={shape} />}
      {shape.element === 'probe' && <ProbeMetadataEditor shape={shape} />}
      {shape.element === 'loop' && <LoopMetadataEditor shape={shape} />}
      {shape.element === 'passive' && <PassiveMetadataEditor shape={shape} />}
    </div>
  );
});

function VesselMetadataEditor({ shape }: { shape: Shape }) {
  const m = shape.metadata as VesselMetadata;
  if (!m) {
    return null;
  }
  return (
    <>
      <InspectorTextInput
        label="name"
        labelSide="top"
        defaultValue={m.name}
        onChange={(ev) => {
          m.name = ev.target.value;
        }}
      />
      <InspectorTextInput
        label="resistivity"
        labelSide="top"
        defaultValue={m.resistivity}
        onChange={(ev) => {
          // @ts-expect-error
          m.resistivity = ev.target.value;
        }}
      />
    </>
  );
}

function CoilMetadataEditor({ shape }: { shape: Shape }) {
  const m = shape.metadata as CoilMetadata;
  if (!m) {
    return null;
  }
  return (
    <>
      <InspectorTextInput
        label="name"
        labelSide="top"
        defaultValue={m.name}
        onChange={(ev) => {
          m.name = ev.target.value;
        }}
      />
      <InspectorNumberInput
        label="turns"
        labelSide="top"
        allowNegative={true}
        defaultValue={m.turns}
        onChange={(value) => {
          if (typeof value === 'number') m.turns = value;
        }}
      />
      <InspectorTextInput
        label="resistance"
        labelSide="top"
        defaultValue={m.resistance}
        onChange={(ev) => {
          // @ts-expect-error
          m.resistance = ev.target.value;
        }}
      />
      <InspectorTextInput
        label="inductance"
        labelSide="top"
        defaultValue={m.inductance}
        onChange={(ev) => {
          // @ts-expect-error
          m.inductance = ev.target.value;
        }}
      />
      <InspectorTextInput
        label="maxCurrent"
        labelSide="top"
        defaultValue={m.maxCurrent}
        onChange={(ev) => {
          // @ts-expect-error
          m.maxCurrent = ev.target.value;
        }}
      />
      <InspectorTextInput
        label="maxVoltage"
        labelSide="top"
        defaultValue={m.maxVoltage}
        onChange={(ev) => {
          // @ts-expect-error
          m.maxVoltage = ev.target.value;
        }}
      />
      <InspectorNumberInput
        label="nFilamentsRadial"
        defaultValue={m.nFilamentsRadial}
        labelSide="top"
        onChange={(value) => {
          if (typeof value === 'number') m.nFilamentsRadial = value;
        }}
      />
      <InspectorNumberInput
        label="nFilamentsVertical"
        labelSide="top"
        defaultValue={m.nFilamentsVertical}
        onChange={(value) => {
          if (typeof value === 'number') m.nFilamentsVertical = value;
        }}
      />
    </>
  );
}

function ProbeMetadataEditor({ shape }: { shape: Shape }) {
  const m = shape.metadata as ProbeMetadata;
  if (!m) {
    return null;
  }
  return (
    <>
      <InspectorTextInput
        label="name"
        labelSide="top"
        defaultValue={m.name}
        onChange={(ev) => {
          m.name = ev.target.value;
        }}
      />
      <InspectorTextInput
        label="effectiveLength"
        labelSide="top"
        defaultValue={m.effectiveLength}
        onChange={(ev) => {
          // @ts-expect-error
          m.effectiveLength = ev.target.value;
        }}
      />
      <InspectorNumberInput
        label="kpb"
        labelSide="top"
        defaultValue={m.kpb}
        onChange={(value) => {
          if (typeof value === 'number') m.kpb = value;
        }}
      />
    </>
  );
}

function LoopMetadataEditor({ shape }: { shape: Shape }) {
  const m = shape.metadata as LoopMetadata;
  if (!m) {
    return null;
  }
  return (
    <>
      <InspectorTextInput
        label="name"
        labelSide="top"
        defaultValue={m.name}
        onChange={(ev) => {
          m.name = ev.target.value;
        }}
      />
    </>
  );
}

function PassiveMetadataEditor({ shape }: { shape: Shape }) {
  const m = shape.metadata as PassiveElementMetadata;
  if (!m) {
    return null;
  }
  return (
    <>
      <InspectorTextInput
        label="name"
        labelSide="top"
        defaultValue={m.name}
        onChange={(ev) => {
          m.name = ev.target.value;
        }}
      />
      <InspectorTextInput
        label="resistance"
        labelSide="top"
        defaultValue={m.resistance}
        onChange={(ev) => {
          // @ts-expect-error
          m.resistance = ev.target.value;
        }}
      />
      <InspectorNumberInput
        label="turns"
        labelSide="top"
        allowNegative={true}
        defaultValue={m.turns}
        onChange={(value) => {
          if (typeof value === 'number') m.turns = value;
        }}
      />
    </>
  );
}
