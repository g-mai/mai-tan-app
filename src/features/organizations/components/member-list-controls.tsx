import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
      <Field className="sm:w-64" data-disabled={disabled}>
        <FieldLabel htmlFor={id} className="sr-only">
          Search members
        </FieldLabel>
        <Input
          id={id}
          type="search"
          value={value}
          maxLength={200}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder="Search by name or email…"
        />
      </Field>
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
    <div className="flex w-full flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="tabular-nums">
        Showing {members.total ? (members.page - 1) * MEMBER_PAGE_SIZE + 1 : 0}–
        {Math.min(members.page * MEMBER_PAGE_SIZE, members.total)} of{" "}
        {members.total} members
      </p>
      <Pagination className="m-0 w-auto">
        <PaginationContent className="w-full justify-between sm:w-auto">
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              aria-label="Previous page"
              disabled={disabled || members.page <= 1}
              onClick={() => onPage(members.page - 1)}
            >
              <ChevronLeft data-icon="inline-start" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
          </PaginationItem>
          <PaginationItem>
            <span className="px-3 tabular-nums">
              Page {members.page} of {pages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              aria-label="Next page"
              disabled={disabled || members.page >= pages}
              onClick={() => onPage(members.page + 1)}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight data-icon="inline-end" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function MembersPending() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-label="Loading members"
    >
      <Skeleton className="h-8 w-40" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
