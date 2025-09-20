// Simple datefield component placeholder
import * as React from "react"

export interface DateFieldProps {
  value?: Date
  onChange?: (date: Date) => void
  placeholder?: string
}

export function DateField({ value, onChange, placeholder }: DateFieldProps) {
  return (
    <input
      type="date"
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={(e) => onChange?.(new Date(e.target.value))}
      placeholder={placeholder}
      className="border rounded px-3 py-2"
    />
  )
}