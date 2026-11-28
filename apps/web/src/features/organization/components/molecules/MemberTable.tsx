import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/molecules'

export const MemberTable = ({
  children
}: Readonly<{ children: React.ReactNode }>) => (
  <div className="bg-card overflow-hidden rounded-lg border">
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
