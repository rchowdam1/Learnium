"use client";
import { X } from "lucide-react";

const DocumentTab = ({ name, size }: { name: string; size: number }) => {
  // size in KB
  const mapToColor = (size: number): string[] => {
    if (size < 100) {
      return ["bg-green-200", "text-green-800"];
    } else if (size < 500) {
      return ["bg-yellow-200", "text-yellow-800"];
    } else {
      return ["bg-red-200", "text-red-800"];
    }
  };

  return (
    <div className="px-3 py-5 w-65 bg-blue-200 rounded-md flex items-center justify-between gap-3">
      <span className="text-blue-700">{name}</span>
      <div className={`px-2 py-1 rounded-full ${mapToColor(size)[0]}`}>
        <span className={`text-xs text-${mapToColor(size)[1]}`}>{size} KB</span>
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
        open ? "visible opacity-100 bg-black/20" : "invisible opacity-0"
      }`}
      onMouseDown={onClose}
    >
      <div
        className={`relative bg-white rounded-md z-50 shadow p-6 text-center max-h-[80vh] overflow-y-auto transition-all ${
          open ? "scale-100 opacity-100" : "scale-125 opacity-0"
        } `}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
        {/*List of Documents*/}
        <div className="flex flex-col gap-3 mx-6">
          {documents.length === 0 && <span>No documents found.</span>}
          {documents.length > 0 && (
            <h3
              className="text-xl font-semibold 
  text-gray-900"
            >
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
