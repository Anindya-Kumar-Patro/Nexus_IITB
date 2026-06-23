import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-medium text-ink-2">{children}</label>;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
