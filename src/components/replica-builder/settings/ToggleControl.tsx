import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/util/cn';

interface ToggleControlProps {
  value: boolean;
  toggle?: () => void;
  onClick?: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
  className?: string;
}

export function ToggleControl({
  value,
  toggle,
  onClick,
  icon,
  disabled,
  ref,
  className
}: ToggleControlProps) {
  return (
    <Toggle
      ref={ref}
      size="xs"
      className={cn('rounded-xs', className)}
      pressed={value}
      onPressedChange={toggle}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
    </Toggle>
  );
}
