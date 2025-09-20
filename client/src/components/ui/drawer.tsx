// Simple drawer component placeholder
import * as React from "react"

export interface DrawerProps {
  children?: React.ReactNode
}

export function Drawer({ children }: DrawerProps) {
  return <div>{children}</div>
}

export function DrawerTrigger({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function DrawerContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function DrawerHeader({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function DrawerTitle({ children }: { children: React.ReactNode }) {
  return <h2>{children}</h2>
}

export function DrawerDescription({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>
}

export function DrawerFooter({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function DrawerClose({ children }: { children: React.ReactNode }) {
  return <button>{children}</button>
}