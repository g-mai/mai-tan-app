import { useId } from "react";
import { Button } from "#/components/ui/button";
import { Field, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "#/components/ui/pagination";
import { Skeleton } from "#/components/ui/skeleton";
import {
  MEMBER_PAGE_SIZE,
  type MemberPage,
} from "#/features/organizations/lib/member-management";

export function MemberSearch({
  value,
  onChange,
  disabled,
  total,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  total: number;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2 sm:max-w-sm">
      <Field>
        <FieldLabel htmlFor={id}>Search members</FieldLabel>
        <Input
          id={id}
          value={value}
          maxLength={200}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder="Name or email"
        />
      </Field>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {total} matching member{total === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function MemberPagination({
  members,
  disabled,
  onPage,
}: {
  members: MemberPage;
  disabled?: boolean;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(members.total / MEMBER_PAGE_SIZE));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p>
        Showing {members.total ? (members.page - 1) * MEMBER_PAGE_SIZE + 1 : 0}–
        {Math.min(members.page * MEMBER_PAGE_SIZE, members.total)} of{" "}
        {members.total} members.
      </p>
      <Pagination className="m-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || members.page <= 1}
              onClick={() => onPage(members.page - 1)}
            >
              Previous
            </Button>
          </PaginationItem>
          <PaginationItem>
            <span className="px-2">
              Page {members.page} of {pages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || members.page >= pages}
              onClick={() => onPage(members.page + 1)}
            >
              Next
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function MembersPending() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading members">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
