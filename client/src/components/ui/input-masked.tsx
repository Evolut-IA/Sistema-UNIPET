import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface InputMaskedProps extends React.ComponentProps<typeof Input> {
  mask?: "cpf" | "cnpj" | "phone" | "whatsapp" | "email" | "price" | "cep";
  onMaskedChange?: (value: string) => void;
}

const InputMasked = React.forwardRef<HTMLInputElement, InputMaskedProps>(
  ({ className, mask, onMaskedChange, onChange, ...props }, ref) => {
    const applyMask = (value: string, maskType?: string) => {
      switch (maskType) {
        case "cpf":
          return value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        
        case "cnpj":
          return value
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1/$2")
            .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
        
        case "phone":
          const phoneNumbers = value.replace(/\D/g, "");
          if (phoneNumbers.length <= 10) {
            return phoneNumbers
              .replace(/(\d{2})(\d)/, "($1) $2")
              .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
          } else {
            return phoneNumbers
              .replace(/(\d{2})(\d)/, "($1) $2")
              .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
          }
        
        case "whatsapp":
          return value
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
        
        case "cep":
          return value
            .replace(/\D/g, "")
            .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
        
        case "price":
          return value
            .replace(/[^\d.,]/g, "")
            .replace(",", ".")
            .replace(/(\d+\.\d{2})\d+/, "$1");
        
        case "email":
          return value.toLowerCase().trim();
        
        default:
          return value;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = applyMask(e.target.value, mask);
      
      // Atualiza o valor do input com a máscara
      e.target.value = maskedValue;
      
      // Chama o onChange original
      onChange?.(e);
      
      // Chama o callback personalizado com o valor mascarado
      onMaskedChange?.(maskedValue);
    };

    return (
      <Input
        className={cn(className)}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

InputMasked.displayName = "InputMasked";

export { InputMasked };
