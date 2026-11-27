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
const MemberTable = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <Table className="table-fixed">
    <TableHeader>
      <TableRow>
        <TableHead scope="col">Member</TableHead>
        <TableHead className="hidden sm:table-cell sm:w-2/5" scope="col">
          Email
        </TableHead>
        <TableHead className="w-28" scope="col">
          Role
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>{children}</TableBody>
  </Table>
)

const MemberRow = ({
  member,
  isCaller
}: Readonly<{ member: MemberListItem; isCaller: boolean }>) => (
  <TableRow>
    {/* Below sm the email folds under the name, so both lines fit the 40px row. */}
    <TableCell className="py-0.5">
      <div className="flex min-w-0 items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <span
            className="truncate text-sm leading-5 font-medium"
            data-slot="member-name"
          >
            {member.name}
            {isCaller && (
              <>
                {' '}
                <Badge variant="outline">You</Badge>
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
      <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
    </TableCell>
  </TableRow>
)

export const MemberList = ({
  members,
  currentUserId
}: Readonly<{ members: MemberListItem[]; currentUserId: string }>) => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h1 className="text-3xl font-bold">Members</h1>
      <p className="text-muted-foreground font-mono text-sm">
        {members.length} {members.length === 1 ? 'member' : 'members'}
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

const PLACEHOLDER_ROWS = ['a', 'b', 'c', 'd']

export const MemberListSkeleton = () => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-5 w-24" />
    </div>
    <MemberTable>
      {PLACEHOLDER_ROWS.map((row) => (
        <TableRow key={row}>
          <TableCell className="py-0.5">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
        </TableRow>
      ))}
    </MemberTable>
  </section>
)
