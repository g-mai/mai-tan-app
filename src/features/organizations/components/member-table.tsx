import {
  MoreHorizontal,
  ShieldCheck,
  UserMinus,
  Users,
  UsersRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
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
      <Empty className="min-h-64">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersRound />
          </EmptyMedia>
          <EmptyTitle>{emptyMessage}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  const hasActions = !!(onRole || onRemove || onAssign);
  return (
    <div className="min-w-0 overflow-hidden" aria-busy={disabled}>
      <Table className="min-w-120">
        <TableHeader className="bg-muted/50">
          <TableRow>
            {selection && (
              <TableHead className="h-11 w-12 pl-5">
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
            <TableHead className="h-11 px-5">Member</TableHead>
            <TableHead className="h-11 w-40 px-5">Organization role</TableHead>
            {hasActions && (
              <TableHead className="w-14 pr-5">
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
                <TableCell className="pl-5">
                  <Checkbox
                    aria-label={`Select ${row.email}`}
                    disabled={disabled}
                    checked={selection.ids.includes(row.userId)}
                    onCheckedChange={() => selection.toggle(row.userId)}
                  />
                </TableCell>
              )}
              <TableCell className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 shrink-0">
                    <AvatarImage src={row.image ?? undefined} alt="" />
                    <AvatarFallback>
                      {(row.name || row.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="max-w-48 truncate font-medium sm:max-w-64">
                        {row.name || row.email}
                      </span>
                      {row.userId === userId && (
                        <Badge variant="outline">You</Badge>
                      )}
                    </div>
                    <p className="max-w-48 truncate text-xs text-muted-foreground sm:max-w-64">
                      {row.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-5">
                <RoleBadge role={row.role} />
              </TableCell>
              {hasActions && (
                <TableCell className="pr-5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={disabled}
                        aria-label={`Actions for ${row.email}`}
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        {onRole &&
                          callerRole &&
                          canManageMember(callerRole, row.role) && (
                            <DropdownMenuItem onSelect={() => onRole(row)}>
                              <ShieldCheck />
                              Change role
                            </DropdownMenuItem>
                          )}
                        {onAssign && (
                          <DropdownMenuItem onSelect={() => onAssign(row)}>
                            <Users />
                            Add to team
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>
                      {onRemove &&
                        (!callerRole ||
                          canManageMember(callerRole, row.role)) && (
                          <>
                            {(onAssign ||
                              (onRole &&
                                callerRole &&
                                canManageMember(callerRole, row.role))) && (
                              <DropdownMenuSeparator />
                            )}
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => onRemove(row)}
                              >
                                <UserMinus />
                                {callerRole
                                  ? "Remove from organization"
                                  : "Remove from team"}
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </>
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
