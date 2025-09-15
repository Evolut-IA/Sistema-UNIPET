import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { useMobileViewport } from "@/hooks/use-mobile"
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

// Responsive Popover that converts to Drawer on mobile
interface ResponsivePopoverProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
}

const ResponsivePopover = ({ children, open, onOpenChange, modal }: ResponsivePopoverProps) => {
  const { isMobile } = useMobileViewport()
  
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} modal={modal}>
        {children}
      </Drawer>
    )
  }
  
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange} modal={modal}>
      {children}
    </PopoverPrimitive.Root>
  )
}

// Responsive Trigger that works with both Popover and Drawer
const ResponsivePopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>((props, ref) => {
  const { isMobile } = useMobileViewport()
  
  if (isMobile) {
    return <DrawerTrigger ref={ref} {...props} />
  }
  
  return <PopoverPrimitive.Trigger ref={ref} {...props} />
})
ResponsivePopoverTrigger.displayName = "ResponsivePopoverTrigger"

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    mobileAsDrawer?: boolean
  }
>(({ className, align = "center", sideOffset = 4, mobileAsDrawer = true, ...props }, ref) => {
  const { isMobile } = useMobileViewport()
  
  if (isMobile && mobileAsDrawer) {
    return (
      <DrawerContent className={cn("max-h-[85vh]", className)} {...props}>
        {props.children}
      </DrawerContent>
    )
  }
  
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", 
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "origin-[--radix-popover-content-transform-origin]",
          // Mobile responsive width - properly centered
          isMobile ? "w-[calc(100vw-2rem)] max-w-sm mx-4" : "w-72",
          // Mobile padding
          isMobile ? "p-3" : "p-4",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { 
  Popover, 
  PopoverTrigger, 
  PopoverContent,
  ResponsivePopover,
  ResponsivePopoverTrigger
}
