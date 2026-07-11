"use client";

import Link from "next/link";
import { useState } from "react";
import { Play, Newspaper } from "lucide-react";
import DocumentModal from "../modals/DocumentModal";

type StudyBuddyCardProps = {
  id: number;
  title: string;
  category: string;
  description: string;
  documents: {
    id: number;
    studyBuddyId: number;
    name: string;
    size: number;
  }[];
};

export default function StudyBuddyCard({
  id,
  title,
  category,
  description,
  documents,
}: StudyBuddyCardProps) {
  const [documentModalOpen, setDocumentModalOpen] = useState<boolean>(false);

  return (
    <div className="flex min-h-70 w-full flex-col justify-between rounded-xl border border-border bg-surface-raised px-5 py-5 text-primary">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="min-w-0 text-heading text-lg break-words">{title}</span>

          <div className="shrink-0 rounded-full bg-surface px-2">
            <span className="text-label text-xs text-muted">{category}</span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <span className="text-body text-muted">{description}</span>
      </div>

      <div className="mt-12 flex items-center gap-2">
        <Link href={`/buddy/${id}`} className="focus-ring flex h-11 cursor-pointer items-center rounded-xl bg-cta px-3 text-label text-cta-text hover:bg-cta-hover">
          <Play className="mr-2 h-4 w-4" />
          <span>Chat</span>
        </Link>

        <button
          className="focus-ring flex h-11 cursor-pointer items-center rounded-xl border border-border-interactive bg-surface px-3 text-label text-primary hover:bg-surface-raised"
          onClick={() => setDocumentModalOpen(true)}
        >
          <Newspaper className="mr-2 h-4 w-4" />
          <span>View Documents</span>
        </button>
      </div>

      <DocumentModal
        open={documentModalOpen}
        onClose={() => setDocumentModalOpen(false)}
        documents={documents}
        buddyName={title}
      />
    </div>
  );
}
