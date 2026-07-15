import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

const NAV_COOKIE_NAME = "sidebar_nav_state";
const NAV_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function serializeNavState(open: Set<string>) {
  return [...open].join(",");
}

export function writeNavCookie(open: Set<string>) {
  // biome-ignore lint/suspicious/noDocumentCookie: keeps the open nav items across refreshes
  document.cookie = `${NAV_COOKIE_NAME}=${serializeNavState(open)}; path=/; max-age=${NAV_COOKIE_MAX_AGE}`;
}

export const getNavOpenState = createServerFn({ method: "GET" }).handler(() => {
  const cookie = getCookie(NAV_COOKIE_NAME);
  return cookie ? cookie.split(",").filter(Boolean) : [];
});

// Reads shadcn's own sidebar collapse cookie so the expanded/collapsed state
// survives a refresh. Defaults to open when the cookie is absent.
export const getSidebarState = createServerFn({ method: "GET" }).handler(() => {
  return getCookie("sidebar_state") !== "false";
});
