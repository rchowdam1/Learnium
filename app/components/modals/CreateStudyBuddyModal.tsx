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
    category: string
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
  const formSubmit = async (e) => {
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

      if (data.status == "success") {
        setIsLoading(false);
        toast.success("Study buddy has been successfully created");
      }

      // resume 1/3 creating the buddy works successfully in supabase and RAG
      // make the UI card of the buddy to display on the dashboard and make the UI of a study buddy
      // use the created buddy for testing
      // test text retrieval and chat response to a query sent by the user about the text

      setIsLoading(false);
      handleClose();
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
    <div
      className={`fixed inset-0 z-40 flex justify-center items-center transition-all duration-200 ${
        open ? "visible opacity-100 bg-black/20" : "invisible opacity-0"
      }`}
      onMouseDown={handleClose}
    >
      <div
        className={`bg-white rounded-md z-50 shadow p-6 text-center max-h-[80vh] overflow-y-auto transition-all ${
          open ? "scale-100 opacity-100" : "scale-125 opacity-0"
        } `}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex flex-col justify-center items-center"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-2 right-2 p-1 cursor-pointer rounded-lg text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-600"
            onClick={handleClose}
          >
            <X />
          </button>
          <span className="font-semibold">Create New Study Buddy</span>
          <span className="text-sm text-gray-500">
            Upload study materials and chat with an AI
            <br />
            about your content
          </span>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
            onSubmit={formSubmit}
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm">Title</label>
              <input
                type="text"
                placeholder="Title"
                className="border border-gray-200 w-80 rounded-sm px-2 py-1"
                required
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label>Category</label>

              <input
                type="text"
                placeholder="e.g., Biology, History, Math"
                className="border border-gray-200 w-80 rounded-sm px-2 py-1"
                required
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 col-span-2">
              <label>Description</label>
              <textarea
                placeholder="What will your Study Buddy help you with?"
                rows={3}
                className="border border-gray-200 rounded-sm px-2 py-1 resize-none"
                required
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2 items-center text-center">
              <label>Upload files (.pdf or .pptx, max 4)</label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="file:cursor-pointer text-sm text-stone-500 file:mr-5 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-blue-700 file:hover:file:bg-blue-100"
              />
              <div className="mt-2"></div>
              {uploadedFiles.map((file, index) => {
                return (
                  <div
                    key={index}
                    className={`w-80 py-2 text-white bg-red-300 rounded-md truncate px-2 ${
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
                className="w-39 border border-gray-200 rounded-sm py-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-39 border border-gray-200 rounded-sm py-2 bg-gray-400 disabled:bg-gray-300 text-gray-50 ml-2 cursor-pointer hover:bg-gray-500 transition-colors duration-200 flex items-center justify-center gap-2"
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
  );
}
