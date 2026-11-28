import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/molecules'

export const MemberEmail = ({
  email,
  className
}: Readonly<{ email: string; className: string }>) => {
  const domainStart = email.lastIndexOf('@') + 1

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={`text-muted-foreground focus-visible:ring-ring/50 truncate rounded-sm outline-none focus-visible:ring-[3px] ${className}`}
            data-slot="member-email"
            tabIndex={0}
          />
        }
      >
        {email}
      </TooltipTrigger>
      <TooltipContent>
        {email.slice(0, domainStart)}
        <wbr />
        {email.slice(domainStart)}
      </TooltipContent>
    </Tooltip>
  )
}
