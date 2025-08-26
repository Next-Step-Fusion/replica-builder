import { cn } from '@/util/cn';

export function InspectorSection({
  label,
  children,
  className
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className={cn('font-mono text-xs', className)}>{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1.5 mb-2 flex flex-row items-center gap-1 text-xs font-semibold text-gray-500">
      <div className="h-0.5 grow border-b-1 border-gray-300" />
      <div className="mx-2">{children}</div>
      <div className="h-0.5 grow border-b-1 border-gray-300" />
    </div>
  );
}
