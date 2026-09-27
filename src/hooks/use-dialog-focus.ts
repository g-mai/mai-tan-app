import { useRef } from "react";

/** Restore focus for controlled dialogs opened without a Radix trigger. */
export function useDialogFocus() {
  const fallback = useRef<HTMLElement | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  return {
    rememberFocus: () => {
      const active = document.activeElement;
      const menuId =
        active instanceof HTMLElement
          ? active.closest('[role="menu"]')?.id
          : undefined;
      opener.current = menuId
        ? (Array.from(
            document.querySelectorAll<HTMLElement>("[aria-controls]"),
          ).find(
            (trigger) => trigger.getAttribute("aria-controls") === menuId,
          ) ?? null)
        : active instanceof HTMLElement
          ? active
          : null;
      fallback.current =
        opener.current
          ?.closest("main")
          ?.querySelector<HTMLElement>("input:not([type=hidden])") ?? null;
    },
    restoreFocus: (event: Event) => {
      const target = opener.current?.isConnected
        ? opener.current
        : fallback.current;
      if (target?.isConnected) {
        event.preventDefault();
        requestAnimationFrame(() => target.focus());
      }
    },
  };
}
