// Simple field component placeholder
import * as React from "react"

export interface FieldProps {
  children?: React.ReactNode
  className?: string
}

export function Field({ children, className }: FieldProps) {
  return <div className={className}>{children}</div>
}

export function FieldError({ children }: { children: React.ReactNode }) {
  return <div className="text-red-500 text-sm">{children}</div>
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium">{children}</label>
}