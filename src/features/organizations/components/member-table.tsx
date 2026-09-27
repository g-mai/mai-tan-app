import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Empty, EmptyHeader, EmptyTitle } from "#/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { RoleBadge } from "#/features/organizations/components/role-badge";
import {
  canManageMember,
  type MemberRow,
} from "#/features/organizations/lib/member-management";

export function MemberTable({
  rows,
  userId,
  disabled = false,
  selection,
  callerRole,
  onRole,
  onRemove,
  onAssign,
  emptyMessage,
}: {
  rows: MemberRow[];
  userId: string;
  disabled?: boolean;
  selection?: {
    ids: string[];
    toggle: (id: string) => void;
    toggleAll: () => void;
  };
  callerRole?: string;
  onRole?: (row: MemberRow) => void;
  onRemove?: (row: MemberRow) => void;
  onAssign?: (row: MemberRow) => void;
  emptyMessage: string;
}) {
  if (!rows.length)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{emptyMessage}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  const hasActions = !!(onRole || onRemove || onAssign);
  return (
    <div
      className="min-w-0 overflow-hidden rounded-md border"
      aria-busy={disabled}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {selection && (
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all members on this page"
                  disabled={disabled}
                  checked={
                    selection.ids.length === rows.length
                      ? true
                      : selection.ids.length
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={selection.toggleAll}
                />
              </TableHead>
            )}
            <TableHead>Person</TableHead>
            <TableHead>Organization role</TableHead>
            {hasActions && (
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.userId}
              data-state={
                selection?.ids.includes(row.userId) ? "selected" : undefined
              }
            >
              {selection && (
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${row.email}`}
                    disabled={disabled}
                    checked={selection.ids.includes(row.userId)}
                    onCheckedChange={() => selection.toggle(row.userId)}
                  />
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={row.image ?? undefined} alt="" />
                    <AvatarFallback>
                      {(row.name || row.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="max-w-64 truncate font-medium">
                        {row.name || row.email}
                      </span>
                      {row.userId === userId && (
                        <Badge variant="outline">You</Badge>
                      )}
                    </div>
                    <p className="max-w-64 truncate text-muted-foreground">
                      {row.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <RoleBadge role={row.role} />
              </TableCell>
              {hasActions && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={disabled}
                        aria-label={`Actions for ${row.email}`}
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onRole &&
                        callerRole &&
                        canManageMember(callerRole, row.role) && (
                          <DropdownMenuItem onSelect={() => onRole(row)}>
                            Change role
                          </DropdownMenuItem>
                        )}
                      {onAssign && (
                        <DropdownMenuItem onSelect={() => onAssign(row)}>
                          Add to team
                        </DropdownMenuItem>
                      )}
                      {onRemove &&
                        (!callerRole ||
                          canManageMember(callerRole, row.role)) && (
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => onRemove(row)}
                          >
                            {callerRole
                              ? "Remove from organization"
                              : "Remove from team"}
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
