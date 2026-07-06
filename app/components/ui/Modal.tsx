"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Modal Design Tokens & States Mapping:
 * - Surface Background: bg-surface-raised (var(--surface-raised))
 * - Border: border border-border (var(--border))
 * - Radius: rounded-2xl (16px)
 * - Backdrop: var(--overlay) + backdrop-blur-sm
 * - Shadow: shadow-md (soft shadow, reserved for floating elements per DESIGN.md)
 * - Typography: Title in h2 typography (text-heading, Space Grotesk, Bold), Body in body typography (text-body, Inter, Regular)
 */

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: ModalProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);
  const modalRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle ESC key and focus trapping
  React.useEffect(() => {
    if (!isOpen) return;

    if (typeof document !== "undefined") {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab: trap focus at start
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          // Tab: trap focus at end
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Set initial focus to first focusable element
    if (modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        setTimeout(() => {
          focusableElements[0].focus();
        }, 50);
      } else {
        modalRef.current.focus();
      }
    }

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-200"
      style={{ backgroundColor: "var(--overlay)" }}
      onMouseDown={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full max-w-lg max-h-[90vh] overflow-y-auto outline-none
          rounded-2xl border border-border bg-surface-raised p-6 shadow-md
          transition-all duration-200
          ${className}
        `}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="focus-ring absolute right-4 top-4 rounded-xl p-1 text-muted transition-colors hover:bg-surface hover:text-primary cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        {title && (
          <h2
            id="modal-title"
            className="text-heading text-xl md:text-2xl text-primary font-bold pr-8 mb-4"
          >
            {title}
          </h2>
        )}

        {/* Content */}
        <div className="text-body text-primary text-base">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
