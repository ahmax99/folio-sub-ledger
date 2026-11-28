import type { MemberListItem } from '@shared/config'

import { MemberRow } from '../molecules/MemberRow'
import { MemberTable } from '../molecules/MemberTable'

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
