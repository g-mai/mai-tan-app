import { z } from "zod";
import { canManage, hasRole } from "#/features/organizations/lib/org";

export const MEMBER_PAGE_SIZE = 25;
export const organizationRoleSchema = z.enum(["member", "admin", "owner"]);
export type OrganizationRole = z.infer<typeof organizationRoleSchema>;
export type MemberRow = {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
};
export type MemberPage = { rows: MemberRow[]; total: number; page: number };
export type BatchResult = {
  succeeded: string[];
  skipped: { userId: string; reason: string }[];
  failed: { userId: string; code: string; message: string }[];
};
export type MemberFailure = BatchResult["failed"][number] & { label: string };

export const memberSearchSchema = z.object({
  q: z.string().trim().max(200).catch(""),
  page: z.coerce.number().int().positive().catch(1),
});
export const organizationMemberSearchSchema = memberSearchSchema.extend({
  tab: z.enum(["members", "invitations"]).catch("members"),
});
export const organizationIdSchema = z.object({
  organizationId: z.string().min(1),
});
export const teamIdSchema = z.object({ teamId: z.string().min(1) });
export const memberPageInputSchema = z.object({
  q: z.string().trim().max(200).default(""),
  page: z.number().int().positive().default(1),
});
export const batchUserIdsSchema = z
  .array(z.string().min(1))
  .min(1)
  .max(MEMBER_PAGE_SIZE)
  .transform((ids) => [...new Set(ids)]);

/** Shared by the server lists, overview previews, and bounded candidate picker. */
export function memberPage(
  rows: MemberRow[],
  q = "",
  requestedPage = 1,
): MemberPage {
  const search = q.trim().toLowerCase();
  const matching = rows.filter(
    (row) =>
      row.name.toLowerCase().includes(search) ||
      row.email.toLowerCase().includes(search),
  );
  matching.sort(
    (a, b) =>
      (a.name.trim() || a.email)
        .toLowerCase()
        .localeCompare((b.name.trim() || b.email).toLowerCase()) ||
      a.userId.localeCompare(b.userId),
  );
  const page = Math.min(
    requestedPage,
    Math.max(1, Math.ceil(matching.length / MEMBER_PAGE_SIZE)),
  );
  return {
    rows: matching.slice(
      (page - 1) * MEMBER_PAGE_SIZE,
      page * MEMBER_PAGE_SIZE,
    ),
    total: matching.length,
    page,
  };
}

/** UI affordance shared by role changes and organization removals. */
export function canManageMember(callerRole: string, targetRole: string) {
  return (
    canManage(callerRole) &&
    (hasRole(callerRole, "owner") || !hasRole(targetRole, "owner"))
  );
}

/** Retain only unresolved targets that are still eligible on the visible page. */
export function retainFailedSelection(result: BatchResult, rows: MemberRow[]) {
  const visible = new Set(rows.map((row) => row.userId));
  return result.failed
    .map((failure) => failure.userId)
    .filter((id) => visible.has(id));
}

export function memberFailures(
  result: BatchResult,
  targets: MemberRow[],
): MemberFailure[] {
  return result.failed.map((failure) => ({
    ...failure,
    label:
      targets.find((row) => row.userId === failure.userId)?.email ??
      failure.userId,
  }));
}

// Keep partial results visible when self-removal requires leaving the member page.
declare module "@tanstack/react-router" {
  interface HistoryState {
    memberManagementFailures?: MemberFailure[];
  }
}
