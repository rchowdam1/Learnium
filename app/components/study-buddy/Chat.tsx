"use client";
import { useState, useEffect, useRef } from "react";
import { Bot, User, SendHorizontal } from "lucide-react";
import { Message, APIResponse } from "@/app/buddy/[buddyId]/page";
import toast from "react-hot-toast";

function Bubble({ role }: { role: boolean }) {
  return (
    <div
      className={`inline-flex items-center justify-center px-2 py-2 rounded-full ${
        role ? "bg-gray-300 text-black" : "bg-black text-white"
      }`}
    >
      {role ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
    </div>
  );
}

function ChatMessage({ message }: { message: string }) {
  return (
    <div
      className="px-3 py-3 mx-3 rounded-md bg-gray-200 max-w-[85%]
        break-words
        whitespace-pre-wrap"
    >
      {message}
    </div>
  );
}

export default function Chat({ buddyId }: { buddyId: string }) {
  // resume here 1/13 figure out why chats aren't loading
  const chatWindowRef = useRef(null);

  const [messages, setMessages] = useState<Message[] | undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [currentMessage, setCurrentMessage] = useState<string>("");

  useEffect(() => {
    //setMessages(chats);

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
          setMessages(data.chats);

          if (data.chats) {
            toast.success("Received the chats");
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    getBuddyData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSendMessage = async (e) => {
    e.preventDefault();
    console.log("Executed");

    const messageToSend = currentMessage;

    if (!messageToSend.trim()) return; // Safety Check for empty messages

    setMessages((prevMessages) => {
      return [
        ...prevMessages,
        {
          is_user_message: true,
          message: messageToSend,
        },
      ];
    });

    // Send the query to RAG
    setCurrentMessage("");

    let assistantMessage: string = "";

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: messageToSend,
          buddy_id: buddyId,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.response) {
          console.log(data.response);
          assistantMessage = data.response;
          setMessages((prevMessages) => {
            return [
              ...prevMessages,
              { is_user_message: false, message: data.response },
            ];
          });
        }
      } else {
        toast.error("Something went wrong when trying to chat with AI");
        return; // if there is no response from the AI, we don't want to save the user message in database
      }
    } catch (error) {
      toast.error(error as string);
      return; // if there is an error with the AI, we don't want to save the user message in database
    }

    // once you get the message, store the user and assistant message in the database
    try {
      const response = await fetch("/api/save-chat-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buddyId: buddyId,
          userMessage: messageToSend,
          assistantMessage: assistantMessage,
        }),
      });

      if (!response.ok) {
        toast.error(
          "Something went wrong when trying to store messages in database",
        );
      } else {
        const data = await response.json();

        if (data.message) {
          // success
          toast.success(data.message); // for now
        }
      }
    } catch (error) {
      toast.error(error as string);
    }

    e.target.value = "";
    setCurrentMessage("");
  };

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  return (
    <div className="w-200 h-135 bg-white rounded-lg shadow-sm">
      {/**Top Segment */}
      <div className="flex items-center pl-5 pt-5 w-full border-b border-b-gray-300 pb-5">
        <Bot className="w-10 h-10" />
        <span className="pl-5 text-lg font-bold">
          {" "}
          {!title && (
            <div className="w-10 h-10 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          {title}
        </span>
      </div>

      {/**Chat Segment*/}
      <div
        ref={chatWindowRef}
        className={`h-90 w-full border-b border-b-gray-300 pb-3 overflow-y-auto ${
          messages === undefined && "bg-gray-400 animate-pulse"
        }`}
      >
        {messages !== undefined && (
          <div className="flex items-start ml-2 mt-3">
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
                key={index}
                className={`flex items-start mt-3 ${
                  message.is_user_message
                    ? "justify-end mr-2"
                    : "justify-start ml-2"
                }`}
              >
                {message.is_user_message ? (
                  <>
                    <ChatMessage message={message.message} />
                    <Bubble role={message.is_user_message} />
                  </>
                ) : (
                  <>
                    <Bubble role={message.is_user_message} />
                    <ChatMessage message={message.message} />
                  </>
                )}
              </div>
            );
          })}
      </div>

      {/**Text input Segment */}
      <div className="px-2 py-2 flex">
        {/**Text area */}
        <div className="basis-5/6">
          <textarea
            placeholder="Ask a question about your study material..."
            rows={3}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg"
            onChange={(e) => setCurrentMessage(e.target.value)}
            value={currentMessage}
          />
        </div>

        {/**Send Button */}
        <div className="basis-1/6 flex items-center justify-center">
          <button
            disabled={!currentMessage}
            className={`px-6 py-3 ${
              !currentMessage
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black cursor-pointer"
            } text-white rounded-md`}
            onClick={onSendMessage}
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
