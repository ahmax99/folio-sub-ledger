import type { MemberListItem } from '@shared/config'

import { Badge } from '@/components/atoms/Badge'
import {
  Avatar,
  AvatarFallback,
  TableCell,
  TableRow
} from '@/components/molecules'

import { ROLE_LABELS } from '../../constants/role'
import { getInitials } from '../../utils/initials'

import { MemberEmail } from './MemberEmail'

export const MemberRow = ({
  member,
  isCaller
}: Readonly<{ member: MemberListItem; isCaller: boolean }>) => (
  <TableRow>
    <TableCell className="max-sm:py-2">
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
          <MemberEmail
            className="text-xs leading-4 sm:hidden"
            email={member.email}
          />
        </div>
      </div>
    </TableCell>
    <TableCell className="hidden sm:table-cell">
      <MemberEmail className="block text-sm" email={member.email} />
    </TableCell>
    <TableCell>
      <Badge className="h-5" variant="secondary">
        {ROLE_LABELS[member.role]}
      </Badge>
    </TableCell>
  </TableRow>
)
