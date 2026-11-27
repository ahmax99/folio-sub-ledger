import type { MemberListItem } from '@shared/config'

import { Badge } from '@/components/atoms/Badge'
import { Skeleton } from '@/components/atoms/Skeleton'
import {
  Avatar,
  AvatarFallback,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/molecules'

import { ROLE_LABELS } from '../constants/role'
import { getInitials } from '../utils/initials'

// table-fixed lets long names and emails truncate instead of widening the page.
// Emails run longer than names, so at sm: Email takes the width left over.
const MemberTable = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <div className="overflow-hidden rounded-lg border">
    <Table className="table-fixed">
      <TableHeader className="bg-muted [&_th]:text-muted-foreground">
        <TableRow>
          <TableHead className="sm:w-60" scope="col">
            Member
          </TableHead>
          <TableHead className="hidden sm:table-cell" scope="col">
            Email
          </TableHead>
          <TableHead className="w-28" scope="col">
            Role
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  </div>
)

const MemberRow = ({
  member,
  isCaller
}: Readonly<{ member: MemberListItem; isCaller: boolean }>) => (
  <TableRow>
    {/* Below sm the email folds under the name: 20px + 16px lines fit the 40px row. */}
    <TableCell>
      <div className="flex min-w-0 items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback className="group-data-[size=sm]/avatar:text-xs">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className="flex h-5 min-w-0 items-center gap-2 text-sm leading-5 font-medium"
            data-slot="member-name"
          >
            <span className="truncate">{member.name}</span>
            {isCaller && (
              <>
                {' '}
                <Badge className="h-5" variant="outline">
                  You
                </Badge>
              </>
            )}
          </span>
          <span
            className="text-muted-foreground truncate text-xs leading-4 sm:hidden"
            title={member.email}
          >
            {member.email}
          </span>
        </div>
      </div>
    </TableCell>
    <TableCell className="hidden sm:table-cell">
      <span
        className="text-muted-foreground block truncate text-sm"
        title={member.email}
      >
        {member.email}
      </span>
    </TableCell>
    <TableCell>
      <Badge className="h-5" variant="secondary">
        {ROLE_LABELS[member.role]}
      </Badge>
    </TableCell>
  </TableRow>
)

export const MemberList = ({
  members,
  currentUserId
}: Readonly<{ members: MemberListItem[]; currentUserId: string }>) => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h1 className="text-3xl font-semibold">Members</h1>
      <p className="text-muted-foreground text-sm">
        <span className="text-foreground font-mono">{members.length}</span>{' '}
        {members.length === 1 ? 'member' : 'members'}
      </p>
    </div>
    <MemberTable>
      {members.map((member) => (
        <MemberRow
          isCaller={member.id === currentUserId}
          key={member.id}
          member={member}
        />
      ))}
    </MemberTable>
  </section>
)

// Varied bar widths from the Loading board, so the skeleton doesn't read as a grid.
const PLACEHOLDER_ROWS = [
  { name: 'w-32', email: 'w-38' },
  { name: 'w-26', email: 'w-32' },
  { name: 'w-36', email: 'w-40' },
  { name: 'w-24', email: 'w-30' }
]

export const MemberListSkeleton = () => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-5 w-22" />
    </div>
    <MemberTable>
      {PLACEHOLDER_ROWS.map((row) => (
        <TableRow key={row.name}>
          <TableCell>
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
