import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/mergeClass'

import Horizontal from '../../../brand/folio-horizontal.svg?react'
import Stacked from '../../../brand/folio-stacked.svg?react'
// The symbol renders at 32px, where the brand kit calls for the small cut.
import SymbolMark from '../../../brand/folio-symbol-small.svg?react'

const defaultType = 'horizontal'

// The masters keep their hex fills; the .ink and .pencil classes on their
// paths let the theme tokens override them here.
const LogoVariants = cva(
  'shrink-0 [&_.ink]:fill-primary [&_.pencil]:fill-muted-foreground',
  {
    variants: {
      type: {
        horizontal: 'h-7.5 w-auto',
        symbol: 'size-8',
        stacked: 'h-auto w-24'
      }
    },
    defaultVariants: { type: defaultType }
  }
)

type LogoProps = Readonly<
  Omit<React.ComponentProps<'svg'>, 'type'> & VariantProps<typeof LogoVariants>
>

const marks = {
  horizontal: Horizontal,
  symbol: SymbolMark,
  stacked: Stacked
} satisfies Record<
  NonNullable<LogoProps['type']>,
  React.FC<React.SVGProps<SVGSVGElement>>
>

const Logo = ({ type, className, ...props }: LogoProps) => {
  const Mark = marks[type ?? defaultType]

  return (
    <Mark
      data-slot="logo"
      role="img"
      aria-label="Folio"
      className={cn(LogoVariants({ type }), className)}
      {...props}
    />
  )
}

export { Logo, LogoVariants }
