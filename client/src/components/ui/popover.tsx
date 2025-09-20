// Simple popover component placeholder
import * as React from "react"

export interface PopoverProps {
  children?: React.ReactNode
}

export function Popover({ children }: PopoverProps) {
  return <div>{children}</div>
}

export function PopoverTrigger({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function PopoverContent({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border rounded-lg shadow-lg p-4">{children}</div>
}