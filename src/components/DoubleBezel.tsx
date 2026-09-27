import { cn } from "@/lib/utils";

export function DoubleBezel({
  children,
  className,
  innerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={cn(
        "bezel-shell p-1 relative overflow-hidden transition-all duration-300",
        className
      )}
    >
      <div
        className={cn(
          "bezel-core h-full w-full overflow-hidden",
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
