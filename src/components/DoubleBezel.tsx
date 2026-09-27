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
        "bg-white/5 border border-white/10 p-1.5 rounded-[2rem]",
        className
      )}
    >
      <div
        className={cn(
          "h-full w-full bg-[#0a0a0a]/90 backdrop-blur-xl rounded-[calc(2rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden",
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
