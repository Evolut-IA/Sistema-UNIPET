import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CustomCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const CustomCheckbox = React.forwardRef<HTMLInputElement, CustomCheckboxProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            {...props}
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            className="sr-only"
          />
          <div
            className={cn(
              "h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center",
              checked 
                ? "bg-[var(--chart-4)] border-[var(--chart-4)]" 
                : "border-input bg-background hover:border-[var(--chart-4)]/70",
              props.disabled && "cursor-not-allowed opacity-50",
              className
            )}
            onClick={() => {
              if (!props.disabled) {
                const event = {
                  target: { checked: !checked }
                } as React.ChangeEvent<HTMLInputElement>;
                props.onChange?.(event);
              }
            }}
          >
            <Check 
              className={cn(
                "h-3 w-3 text-white transition-opacity duration-200",
                checked ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
        </div>
        {label && (
          <label 
            htmlFor={checkboxId} 
            className="text-sm font-medium cursor-pointer select-none"
          >
            {label}
          </label>
        )}
        {description && (
          <span className="text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </div>
    );
  }
);

CustomCheckbox.displayName = "CustomCheckbox";

export { CustomCheckbox };