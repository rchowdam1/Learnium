"use client";
import { X } from "lucide-react";

const DocumentTab = ({ name, size }: { name: string; size: number }) => {
  const mapToToken = (size: number): { container: string; text: string } => {
    if (size < 100) {
      return { container: "bg-surface", text: "text-muted" };
    } else if (size < 500) {
      return { container: "bg-surface border border-border", text: "text-primary" };
    } else {
      return { container: "bg-surface border border-border-strong", text: "text-primary" };
    }
  };

  const color = mapToToken(size);

  return (
    <div className="flex w-65 items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-5">
      <span className="text-body text-primary">{name}</span>
      <div className={`rounded-full px-2 py-1 ${color.container}`}>
        <span className={`text-xs ${color.text} text-numeral`}>{size} KB</span>
      </div>
    </div>
  );
};

export default function DocumentModal({
  open,
  onClose,
  documents,
  buddyName,
}: {
  open: boolean;
  onClose: () => void;
  documents: { id: number; name: string; size: number }[];
  buddyName: string;
}) {
  if (!open) {
    return;
  }

  return (
    <div
      className={`fixed inset-0 z-40 flex justify-center items-center transition-all duration-200 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
      style={{ backgroundColor: "var(--overlay)" }}
      onMouseDown={onClose}
    >
      <div
        className={`relative z-50 max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-surface-raised p-6 text-center shadow-sm transition-all ${
          open ? "scale-100 opacity-100" : "scale-125 opacity-0"
        } `}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="focus-ring absolute right-3 top-3 rounded-xl p-1 text-muted transition-colors hover:bg-surface hover:text-primary"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
        {/*List of Documents*/}
        <div className="flex flex-col gap-3 mx-6">
          {documents.length === 0 && <span className="text-body text-muted">No documents found.</span>}
          {documents.length > 0 && (
            <h3 className="text-heading text-xl text-primary">
              Documents for {buddyName}
            </h3>
          )}
          {documents.map((doc, index) => {
            return (
              <DocumentTab
                key={index}
                name={doc.name}
                size={Math.trunc(doc.size / 1024)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
