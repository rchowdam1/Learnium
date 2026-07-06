"use client";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";

import toast from "react-hot-toast";

type CreateStudyBuddyModalProps = {
  open: boolean;
  onClose: () => void;
  onCreateStudyBuddy: (
    title: string,
    description: string,
    category: string,
    buddyId?: number,
  ) => void;
};

export default function CreateStudyBuddyModal({
  open,
  onClose,
  onCreateStudyBuddy,
}: CreateStudyBuddyModalProps) {
  // state for form inputs
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  // state to represent the uploaded files, max 4 allowed
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // to disable the button if a request to api is sent
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!open) {
    return;
  }

  // when the modal is closed, clear all of the inputs
  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCategory("");

    setIsLoading(false);
    setUploadedFiles([]);

    onClose();
  };

  // to handle the event of the user uploading files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      const fileArray = Array.from(files);
      //setUploadedFiles(fileArray.slice(0, 4));

      //console.log(fileArray.length);

      if (uploadedFiles.length < 4) {
        setUploadedFiles((prevUploadedFiles) => {
          return [...prevUploadedFiles, fileArray[0]];
        });
      } else {
        toast.error(
          "You have already uploaded 4 files. To upload another, please remove one."
        );
      }
    }
  };

  // form submission
  const formSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    if (
      title.trim() === "" ||
      description.trim() === "" ||
      category.trim() === ""
    ) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one file");
      setIsLoading(false);
      return;
    }

    // since the title, description, and category won't be used as input to OpenAI, we don't need to sanitize them

    // create the form data
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);

    // append files
    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      let response = await fetch("/api/create-buddy", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        toast.error(
          "There was an error creating your Study Buddy. Please try again. - buddy creation"
        );
        setIsLoading(false);
        return;
      }

      let data = await response.json(); // The response from creating the buddy in Supabase

      let createdBuddyId;

      if (data.success) {
        createdBuddyId = data.buddyId;
      }

      if (data.error) {
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      formData.append("buddyId", createdBuddyId); // add the retrieved buddyId to formData

      // send the files to backend for RAG implementation
      // POST request to fastAPI
      response = await fetch("http://localhost:8000/api/create-study-buddy", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        toast.error(
          "There was an error creating your Study Buddy. Please try again. - AI creation"
        );
        setIsLoading(false);
        return;
      }

      data = await response.json(); // The response from creating the RAG model

      console.log(data);

      if (data.status === "success") {
        onCreateStudyBuddy(title, description, category, createdBuddyId);
        toast.success("Study buddy has been successfully created");
        setIsLoading(false);
        handleClose();
        return;
      }

      toast.error(
        "There was an error creating your Study Buddy. Please try again.",
      );
      setIsLoading(false);
      return;
    } catch (error) {
      console.log("Error creating study buddy:", error);
      toast.error(
        "There was an error creating your Study Buddy. Please try again."
      );
      setIsLoading(false);
      return;
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close create study buddy modal"
        className={`fixed inset-0 z-40 transition-all duration-200 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ backgroundColor: "var(--overlay)" }}
        onClick={handleClose}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`pointer-events-auto max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-surface-raised p-6 text-center shadow-sm transition-all ${
          open ? "scale-100 opacity-100" : "scale-125 opacity-0"
        } `}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-study-buddy-title"
      >
        <div
          className="flex flex-col justify-center items-center"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Close create study buddy modal"
            className="focus-ring absolute right-2 top-2 cursor-pointer rounded-xl bg-surface p-1 text-muted hover:bg-surface-raised hover:text-primary"
            onClick={handleClose}
          >
            <X />
          </button>
          <span id="create-study-buddy-title" className="text-heading">Create New Study Buddy</span>
          <span className="text-body text-sm text-muted">
            Upload study materials and chat with an AI
            <br />
            about your content
          </span>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
            onSubmit={formSubmit}
          >
            <div className="flex flex-col gap-1">
              <label className="text-label text-sm">Title</label>
              <input
                type="text"
                placeholder="Title"
                className="focus-ring w-80 rounded-xl border border-border-interactive bg-surface-raised px-2 py-2 text-body text-primary placeholder:text-muted"
                required
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-label">Category</label>

              <input
                type="text"
                placeholder="e.g., Biology, History, Math"
                className="focus-ring w-80 rounded-xl border border-border-interactive bg-surface-raised px-2 py-2 text-body text-primary placeholder:text-muted"
                required
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-label">Description</label>
              <textarea
                placeholder="What will your Study Buddy help you with?"
                rows={3}
                className="focus-ring resize-none rounded-xl border border-border-interactive bg-surface-raised px-2 py-2 text-body text-primary placeholder:text-muted"
                required
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2 items-center text-center">
              <label className="text-label">Upload files (.pdf or .pptx, max 4)</label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="text-body text-sm text-muted file:mr-5 file:cursor-pointer file:rounded-full file:border file:border-border file:bg-surface file:px-4 file:py-2 file:text-label file:text-primary hover:file:bg-surface-raised"
              />
              <div className="mt-2"></div>
              {uploadedFiles.map((file, index) => {
                return (
                  <div
                    key={index}
                    className={`w-80 truncate rounded-xl border border-border bg-surface px-2 py-2 text-body text-primary ${
                      index !== uploadedFiles.length - 1 ? "mb-1" : ""
                    }`}
                  >
                    {file.name}
                  </div>
                );
              })}
            </div>

            {/*Form submit and cancel buttons*/}
            <div className="mt-7 flex md:col-span-2 justify-center">
              <button
                type="button"
                className="focus-ring w-39 cursor-pointer rounded-xl border border-border bg-surface py-2 text-label text-primary hover:bg-surface-raised"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="focus-ring ml-2 flex w-39 cursor-pointer items-center justify-center gap-2 rounded-xl bg-cta py-2 text-label text-cta-text hover:bg-cta-hover disabled:bg-cta-disabled disabled:text-muted"
                disabled={isLoading}
              >
                {isLoading && (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span>Generating...</span>
                  </>
                )}
                {!isLoading && "Create Study Buddy"}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </>
  );
}
