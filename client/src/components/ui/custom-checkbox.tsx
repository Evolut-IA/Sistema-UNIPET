import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CustomCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const CustomCheckbox = React.forwardRef<HTMLInputElement, CustomCheckboxProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const stableId = React.useId();
    const checkboxId = id || `checkbox-${stableId}`;
    
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            {...props}
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            className={cn(
              "appearance-none h-4 w-4 shrink-0 rounded border-2 cursor-pointer transition-all duration-200",
              "focus:ring-2 focus:ring-[#22c55e]/20 focus:outline-none",
              checked 
                ? "bg-[#22c55e] border-[#22c55e]" 
                : "border-input bg-white hover:border-[#22c55e]/70",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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