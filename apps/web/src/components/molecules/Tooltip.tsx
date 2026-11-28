'use client'

import {
  createContext,
  type Dispatch,
  type SetStateAction,
  use,
  useRef,
  useState
} from 'react'

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'

import { cn } from '@/utils/mergeClass'

// Base UI opens a tooltip on mouse hover and keyboard focus only. A touch or
// pen tap opens it here too; an outside tap or Escape closes it through Base
// UI's own dismiss handling.
const TooltipOpenContext = createContext<Dispatch<SetStateAction<boolean>>>(
  () => {}
)

function Tooltip({
  ...props
}: Readonly<
  Omit<TooltipPrimitive.Root.Props, 'open' | 'defaultOpen' | 'onOpenChange'>
>) {
  const [open, setOpen] = useState(false)

  return (
    <TooltipOpenContext value={setOpen}>
      <TooltipPrimitive.Root
        data-slot="tooltip"
        onOpenChange={setOpen}
        open={open}
        {...props}
      />
    </TooltipOpenContext>
  )
}

const TAP_POINTERS = new Set(['touch', 'pen'])

function TooltipTrigger({
  onPointerDown,
  onClick,
  ...props
}: Readonly<TooltipPrimitive.Trigger.Props>) {
  const setOpen = use(TooltipOpenContext)
  // The click event's own pointerType isn't reliable across browsers.
  const pointerType = useRef('')

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      onClick={(event) => {
        onClick?.(event)
        if (!TAP_POINTERS.has(pointerType.current)) return
        // Base UI closes a tooltip on a trigger press; for a tap the press is what opens it.
        event.preventBaseUIHandler()
        setOpen(true)
      }}
      onPointerDown={(event) => {
        pointerType.current = event.pointerType
        onPointerDown?.(event)
      }}
      {...props}
    />
  )
}

// No arrow: DESIGN.md's Tooltip leaves out TooltipArrow.
function TooltipContent({
  className,
  side = 'top',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  ...props
}: Readonly<
  TooltipPrimitive.Popup.Props &
    Pick<
      TooltipPrimitive.Positioner.Props,
      'align' | 'alignOffset' | 'side' | 'sideOffset'
    >
>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <TooltipPrimitive.Popup
          className={cn(
            'data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 z-50 w-fit max-w-xs origin-(--transform-origin) rounded-md bg-foreground px-3 py-1.5 text-background text-xs break-all duration-100 data-closed:animate-out data-open:animate-in',
            className
          )}
          data-slot="tooltip-content"
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipTrigger }
