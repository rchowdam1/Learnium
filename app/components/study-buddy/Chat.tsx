"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Bot, User, SendHorizontal, FileText } from "lucide-react";
import { Message, APIResponse, ChatCitation } from "@/app/buddy/[buddyId]/page";
import { Modal } from "@/app/components/ui/Modal";
import toast from "react-hot-toast";

/** Strip model-emitted [Source N] / [Source 1, Source 8] markers from display text. */
export function stripSourceMarkers(text: string): string {
  return text
    .replace(/\[\s*Source\s+\d+(?:\s*,\s*Source\s+\d+)*\s*\]/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function uniqueDocumentCount(citations: ChatCitation[]): number {
  return new Set(citations.map((c) => c.documentName)).size;
}

function Bubble({ role }: { role: boolean }) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full px-2 py-2 ${
        role
          ? "bg-brand text-cta-text"
          : "border border-border bg-surface text-primary"
      }`}
    >
      {role ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
    </div>
  );
}

function SourcesChip({
  citations,
  onOpen,
}: {
  citations: ChatCitation[];
  onOpen: () => void;
}) {
  const docCount = uniqueDocumentCount(citations);
  const label = docCount === 1 ? "1 source" : `${docCount} sources`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1.5 text-caption text-muted transition-colors hover:border-border-strong hover:bg-surface hover:text-primary"
      aria-label={`View ${label} used in this answer`}
    >
      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="text-numeral text-sm text-primary">{docCount}</span>
      <span>{docCount === 1 ? "source" : "sources"}</span>
    </button>
  );
}

function SourcesPanel({
  open,
  onClose,
  citations,
}: {
  open: boolean;
  onClose: () => void;
  citations: ChatCitation[];
}) {
  const sorted = useMemo(
    () => [...citations].sort((a, b) => a.index - b.index),
    [citations],
  );

  return (
    <Modal isOpen={open} onClose={onClose} title="Sources">
      <p className="text-caption mb-4 text-muted">
        Passages retrieved from your uploaded materials for this answer.
      </p>
      <ul className="flex flex-col gap-3">
        {sorted.map((cite) => (
          <li
            key={`${cite.chunkId ?? cite.index}-${cite.documentName}-${cite.chunkIndex}`}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-label text-sm text-primary">
                {cite.documentName}
              </p>
              <p className="text-numeral text-caption text-muted">
                Source {cite.index}
                <span className="mx-1 text-disabled" aria-hidden="true">
                  ·
                </span>
                §{cite.chunkIndex}
              </p>
            </div>
            <p className="text-caption line-clamp-4 whitespace-pre-wrap text-muted">
              {cite.preview || "No preview available."}
            </p>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

function ChatMessage({
  message,
  loading,
  isUser,
  citations,
  onOpenSources,
}: {
  message: string;
  loading?: boolean;
  isUser?: boolean;
  citations?: ChatCitation[] | null;
  onOpenSources?: () => void;
}) {
  const display = loading || isUser ? message : stripSourceMarkers(message);
  const hasSources = !isUser && !loading && citations && citations.length > 0;

  return (
    <div className="mx-3 flex max-w-[85%] flex-col">
      <div
        className={`break-words whitespace-pre-wrap rounded-xl px-3 py-3 text-body ${
          isUser ? "bg-brand text-cta-text" : "bg-surface text-primary"
        }`}
      >
        {loading ? (
          <span className="animate-pulse text-muted">Thinking...</span>
        ) : (
          display
        )}
      </div>
      {hasSources && onOpenSources && (
        <SourcesChip citations={citations} onOpen={onOpenSources} />
      )}
    </div>
  );
}

export default function Chat({ buddyId }: { buddyId: string }) {
  const chatWindowRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[] | undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [activeCitations, setActiveCitations] = useState<ChatCitation[]>([]);

  useEffect(() => {
    const getBuddyData = async () => {
      try {
        const response = await fetch(`/api/get-buddy-data/${buddyId}`);

        if (response.ok) {
          const data: APIResponse = await response.json();

          if (data.error) {
            toast.error("Could not retrieve study buddy data");
            return;
          }

          setTitle(data.title);
          setMessages(
            (data.chats || []).map((chat) => ({
              ...chat,
              citations: Array.isArray(chat.citations) ? chat.citations : null,
            })),
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    getBuddyData();
  }, [buddyId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const openSources = (citations: ChatCitation[]) => {
    setActiveCitations(citations);
    setSourcesOpen(true);
  };

  const onSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const messageToSend = currentMessage;

    if (!messageToSend.trim()) return;

    setMessages((prevMessages) => {
      const safeMessages = prevMessages ?? [];
      return [
        ...safeMessages,
        {
          is_user_message: true,
          message: messageToSend,
        },
        {
          is_user_message: false,
          message: "",
          loading: true,
        },
      ];
    });

    setCurrentMessage("");

    try {
      // Client MiniLM embedding so retrieval matches ingest vectors
      let queryEmbedding: number[] | undefined;
      try {
        const { embedTextClient } = await import("@/lib/ingest/client/embed");
        queryEmbedding = await embedTextClient(messageToSend);
      } catch (embedErr) {
        console.warn("Client query embed failed, server will fallback:", embedErr);
      }

      const response = await fetch("/api/send-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: messageToSend,
          buddyId: buddyId,
          queryEmbedding,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(
          data.message || "An error occurred while sending the message",
        );
        throw new Error(
          data.message || "An error occurred while sending the message",
        );
      } else {
        const data = await response.json();

        if (!data.success) {
          if (
            data.message === "User has no chats remaining for the day" ||
            data.code === "QUOTA_EXHAUSTED"
          ) {
            toast.error(
              "You have no chats remaining for the day. Please try again tomorrow!",
            );
            setMessages((prevMessages) => {
              const safeMessages = [...(prevMessages ?? [])];
              safeMessages[safeMessages.length - 1] = {
                is_user_message: false,
                message:
                  "You have no chats remaining for the day. Please try again tomorrow!",
              };
              return safeMessages;
            });
            return;
          }

          toast.error(
            data.message || "An error occurred while sending the message",
          );
          throw new Error(
            data.message || "An error occurred while sending the message",
          );
        } else {
          const assistantMessage = data.assistantMessage as string;
          const citations = Array.isArray(data.citations)
            ? (data.citations as ChatCitation[])
            : [];
          setMessages((prevMessages) => {
            const safeMessages = [...(prevMessages ?? [])];
            safeMessages[safeMessages.length - 1] = {
              is_user_message: false,
              message: assistantMessage,
              citations: citations.length > 0 ? citations : null,
            };
            return safeMessages;
          });
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send message",
      );
      setMessages((prevMessages) => {
        const safeMessages = [...(prevMessages ?? [])];
        safeMessages[safeMessages.length - 1] = {
          is_user_message: false,
          message: "Sorry, an error occurred while trying to get a response.",
        };
        return safeMessages;
      });
    }

    setCurrentMessage("");
  };

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  return (
    <div className="h-135 w-200 rounded-xl border border-border bg-surface-raised">
      {/**Top Segment */}
      <div className="flex w-full items-center border-b border-border pb-5 pl-5 pt-5 text-primary">
        <Bot className="h-10 w-10" />
        <span className="pl-5 text-heading">
          {" "}
          {!title && (
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-transparent"></div>
          )}
          {title}
        </span>
      </div>

      {/**Chat Segment*/}
      <div
        ref={chatWindowRef}
        className={`h-90 w-full overflow-y-auto border-b border-border pb-3 ${
          messages === undefined && "animate-pulse bg-surface"
        }`}
      >
        {messages !== undefined && (
          <div className="ml-2 mt-3 flex items-start">
            <Bubble role={false} />
            <ChatMessage
              message={`Hi! I'm ${title}, an AI assistant designed to help you study. Please ask me any questions you have about the uploaded study material.`}
            />
          </div>
        )}

        {messages &&
          messages.map((message, index) => {
            return (
              <div
                key={message.id ?? index}
                className={`mt-3 flex items-start ${
                  message.is_user_message
                    ? "mr-2 justify-end"
                    : "ml-2 justify-start"
                }`}
              >
                {message.is_user_message ? (
                  <>
                    <ChatMessage message={message.message} isUser />
                    <Bubble role={message.is_user_message} />
                  </>
                ) : (
                  <>
                    <Bubble role={message.is_user_message} />
                    {message.loading ? (
                      <ChatMessage message={message.message} loading={true} />
                    ) : (
                      <ChatMessage
                        message={message.message}
                        citations={message.citations}
                        onOpenSources={
                          message.citations && message.citations.length > 0
                            ? () => openSources(message.citations!)
                            : undefined
                        }
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
      </div>

      {/**Text input Segment */}
      <form className="flex px-2 py-2" onSubmit={onSendMessage}>
        {/**Text area */}
        <div className="basis-5/6">
          <textarea
            placeholder="Ask a question about your study material..."
            rows={3}
            className="focus-ring w-full rounded-xl border border-border-interactive bg-surface-raised px-2 py-1 text-primary placeholder:text-muted"
            onChange={(e) => setCurrentMessage(e.target.value)}
            value={currentMessage}
            onKeyDown={(e) => {
              // Enter submits; Shift+Enter inserts a newline
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!currentMessage.trim()) return;
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
        </div>

        {/**Send Button */}
        <div className="flex basis-1/6 items-center justify-center">
          <button
            type="submit"
            disabled={!currentMessage}
            className={`focus-ring rounded-xl px-6 py-3 ${
              !currentMessage
                ? "cursor-not-allowed bg-cta-disabled text-disabled"
                : "cursor-pointer bg-cta text-cta-text"
            }`}
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
        </div>
      </form>

      <SourcesPanel
        open={sourcesOpen}
        onClose={() => setSourcesOpen(false)}
        citations={activeCitations}
      />
    </div>
  );
}
