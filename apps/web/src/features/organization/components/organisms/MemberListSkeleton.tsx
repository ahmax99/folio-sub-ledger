import { Skeleton } from '@/components/atoms/Skeleton'
import { TableCell, TableRow } from '@/components/molecules'

import { MemberTable } from '../molecules/MemberTable'

const PLACEHOLDER_ROWS = [
  { name: 'w-32', email: 'w-38' },
  { name: 'w-26', email: 'w-32' },
  { name: 'w-36', email: 'w-40' },
  { name: 'w-24', email: 'w-30' }
]

export const MemberListSkeleton = () => (
  <section
    aria-busy="true"
    aria-label="Loading members"
    className="flex flex-col gap-4"
  >
    <div aria-hidden="true" className="flex flex-col gap-1">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-5 w-22" />
    </div>
    <MemberTable>
      {PLACEHOLDER_ROWS.map((row) => (
        <TableRow key={row.name}>
          <TableCell className="max-sm:py-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className={`h-4 ${row.name}`} />
                <Skeleton className={`h-3 sm:hidden ${row.email}`} />
              </div>
            </div>
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <Skeleton className={`h-3 ${row.email}`} />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
        </TableRow>
      ))}
    </MemberTable>
  </section>
)
