"use client";

import { Toaster as HotToaster } from "react-hot-toast";

/**
 * Toast Design Tokens & States Mapping:
 * - Background: bg-surface-raised (var(--surface-raised))
 * - Border: border border-border (var(--border))
 * - Radius: rounded-xl (12px)
 * - Shadow: shadow-md (soft shadow, reserved per DESIGN.md)
 * - Typography: body-strong (text-body with font-medium, Inter, Medium, 1rem)
 * - Accessibility: success/info/blank/loading toasts use role="status" and aria-live="polite",
 *                  error toasts use role="alert" and aria-live="assertive".
 */

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        className: "!bg-surface-raised !text-primary !border !border-border !rounded-xl !shadow-md !font-sans !font-medium !text-base !py-3 !px-4",
        success: {
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },
          iconTheme: {
            primary: "var(--accent)",
            secondary: "var(--on-accent)",
          },
        },
        error: {
          ariaProps: {
            role: "alert",
            "aria-live": "assertive",
          },
          iconTheme: {
            primary: "var(--error)",
            secondary: "var(--cta-text)",
          },
        },
        blank: {
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },
        },
        loading: {
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },
        },
      }}
    />
  );
}
