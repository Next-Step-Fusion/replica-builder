import { NumberInput, TextInput, type NumberInputProps, type TextInputProps } from '@mantine/core';

const stopPropagation = (e: React.KeyboardEvent<HTMLInputElement>) => {
  e.stopPropagation();
};

const normalNumber: NumberInputProps['classNames'] = {
  input: 'border-none outline-none rounded-xs'
};

const leftNumber: NumberInputProps['classNames'] = {
  input: normalNumber.input,
  root: 'grid grid-cols-[auto_1fr] items-center'
};

export function InspectorNumberInput({
  labelSide = 'left',
  labelWidth,
  decimalScale = 1,
  ...props
}: Omit<NumberInputProps, 'decimalScale'> & {
  labelSide?: 'left' | 'top';
  labelWidth?: string;
  decimalScale?: number | null;
}) {
  return (
    <NumberInput
      size="xs"
      allowDecimal={true}
      decimalScale={decimalScale === null ? undefined : decimalScale}
      allowNegative={true}
      onKeyDown={stopPropagation}
      classNames={labelSide === 'left' ? leftNumber : normalNumber}
      labelProps={labelWidth ? { style: { width: labelWidth } } : undefined}
      {...props}
    />
  );
}

const normalText: TextInputProps['classNames'] = {
  input: 'border-none outline-none rounded-xs'
};

const leftText: TextInputProps['classNames'] = {
  input: normalText.input,
  root: 'grid grid-cols-[auto_1fr] items-center'
};

export function InspectorTextInput({
  labelSide = 'left',
  labelWidth,
  ...props
}: TextInputProps & { labelSide?: 'left' | 'top'; labelWidth?: string }) {
  return (
    <TextInput
      size="xs"
      onKeyDown={stopPropagation}
      classNames={labelSide === 'left' ? leftText : normalText}
      labelProps={labelWidth ? { style: { width: labelWidth } } : undefined}
      {...props}
    />
  );
}
