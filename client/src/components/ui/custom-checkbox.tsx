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
        <div className="relative flex items-center justify-center">
          <input
            {...props}
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            className="sr-only peer"
          />
          <div 
            className={cn(
              "h-4 w-4 rounded-sm border flex items-center justify-center transition-all duration-200 cursor-pointer",
              "peer-focus:ring-2 peer-focus:ring-[#22c55e]/20",
              "hover:border-[#22c55e]/70",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              className
            )}
            style={{
              backgroundColor: checked ? '#22c55e' : 'white',
              borderColor: checked ? '#22c55e' : '#e1eaef',
            }}
            onClick={() => {
              const event = { target: { checked: !checked } } as React.ChangeEvent<HTMLInputElement>;
              props.onChange?.(event);
            }}
          >
            {checked && (
              <Check 
                className="h-3 w-3 text-white"
                strokeWidth={3}
              />
            )}
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