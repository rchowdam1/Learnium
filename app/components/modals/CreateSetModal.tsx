"use client";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";

import { zOutputSchema } from "@/app/schema/OutputSchema";
import { z } from "zod";

import toast from "react-hot-toast";

type OutputSchema = z.infer<typeof zOutputSchema>;

type CreateSetResponse = {
  setId?: number;
  parsedResponse?: OutputSchema;
  error?: string;
};

type CreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreateSet: (
    title: string,
    description: string,
    category: string,
    numLessons?: number
  ) => void;
};

export default function CreateSetModal({
  open,
  onClose,
  onCreateSet,
}: CreateModalProps) {
  // state to manage the input error messages
  const [requireTitle, setRequireTitle] = useState<boolean>(false);
  const [requireDescription, setRequiredDescription] = useState<boolean>(false);
  const [requireCategory, setRequiredCategory] = useState<boolean>(false);

  // input length validation state
  const [validTitleLength, setValidTitleLength] = useState<boolean>(true);
  const [validDescriptionLength, setValidDescriptionLength] =
    useState<boolean>(true);

  // input content validation state
  const [validTitleContent, setValidTitleContent] = useState<boolean>(true);
  const [validDescriptionContent, setValidDescriptionContent] =
    useState<boolean>(true);

  // state to gather user input
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("Select a category");

  // to disable the button if a request to api is sent
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!open) {
    return;
  }

  const handleClose = () => {
    setRequireTitle(false);
    setRequiredDescription(false);
    setRequiredCategory(false);

    setValidTitleLength(true);
    setValidDescriptionLength(true);

    setValidTitleContent(true);
    setValidDescriptionContent(true);

    setTitle("");
    setDescription("");
    setCategory("Select a category");

    onClose();
  };

  // functions to validate input length
  // we create a function to validate the length of each input field
  // so that we can display the correct error message
  const validateTitleLength = (): boolean => {
    if (title.length < 5 || title.length > 50) {
      setValidTitleLength(false);
      return false;
    }

    setValidTitleLength(true);
    return true;
  };

  const validateDescriptionLength = (): boolean => {
    if (description.length < 10 || description.length > 200) {
      setValidDescriptionLength(false);
      return false;
    }

    setValidDescriptionLength(true);
    return true;
  };

  // function to validdate input content
  const validateTitleContent = (): boolean => {
    if (!/^[a-zA-Z0-9\s.,'-']+$/.test(title)) {
      setValidTitleContent(false);
      return false;
    }

    setValidTitleContent(true);
    return true;
  };

  // function to validate description content
  const validateDescriptionContent = (): boolean => {
    if (!/[a-zA-Z]{3}/.test(description)) {
      setValidDescriptionContent(false);
      return false;
    }

    if (/(asdf|qwer|lorem ipsum|aaaaa|xyz123)/i.test(description)) {
      setValidDescriptionContent(false);
      return false;
    }

    setValidDescriptionContent(true);
    return true;
  };

  const validateInputs = (): boolean => {
    let validFields: boolean = true;

    if (!title) {
      validFields = false;
      setRequireTitle(true);
    } else {
      setRequireTitle(false);
    }

    if (!description) {
      validFields = false;
      setRequiredDescription(true);
    } else {
      setRequiredDescription(false);
    }

    if (category === "Select a category") {
      validFields = false;
      setRequiredCategory(true);
    } else {
      setRequiredCategory(false);
    }

    // if any of the fields are invalid inputs return false

    const isValidTitleLength = validateTitleLength();
    const isValidDescriptionLength = validateDescriptionLength();
    const isValidTitleContent = validateTitleContent();
    const isValidDescriptionContent = validateDescriptionContent();

    if (
      !isValidTitleLength ||
      !isValidDescriptionLength ||
      !isValidTitleContent ||
      !isValidDescriptionContent
    ) {
      return false;
    }

    return validFields;
  };

  const formSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    let numLessons: number | undefined = 0;
    let setId: number | undefined = undefined;

    if (!validateInputs()) {
      setIsLoading(false);
      return;
    }

    // check if inputs are valid by sending api request
    try {
      const response = await fetch("/api/input-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
        }),
      });

      if (!response.ok) {
        alert("Error - 156");
        setIsLoading(false);
        return;
      }

      const data: CreateSetResponse = await response.json();

      if (data.error) {
        if (data.error === "Could not process your request")
          toast.error("Sorry! We can't make this set for you");
        else if (data.error === "User does not have any set requests remaining")
          toast.error(
            "You have ran out of requests. Please wait until the next day for more requests"
          );
        else toast.error(data.error);
        setIsLoading(false);
        return;
      }

      console.log(data, "data from input-check api");
      numLessons = data.parsedResponse?.lessons.length;
      setId = data.setId;
    } catch (error) {
      alert(error);
      setIsLoading(false);
      return;
    }

    // inputs are valid, create the set
    onCreateSet(title, description, category, numLessons, setId);
    setIsLoading(false);
    handleClose();
  };

  return (
    <div
      onMouseDown={handleClose}
      className={`fixed inset-0 z-40 flex justify-center items-center transition-all duration-200 ${
        open ? "visible opacity-100 bg-black/20" : "invisible opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-md z-50 shadow p-6 text-center transition-all ${
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
            className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-600"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X />
          </button>
          <span className="font-semibold">Create New Learning Set</span>
          <span className="text-sm text-gray-500">
            AI will generate bite-sized lessons based on your
            <br />
            topic and description.
          </span>

          <form
            className="flex flex-col items-start mt-4 space-y-2"
            onSubmit={formSubmit}
          >
            <label className="text-sm">
              Title
              <span className="text-xs ml-3 text-red-500">
                {requireTitle
                  ? "Required: Please enter a title"
                  : !validTitleLength
                  ? "Must be between 5-50 characters"
                  : !validTitleContent
                  ? "Must be plausible"
                  : ""}
              </span>
            </label>
            <input
              type="text"
              placeholder="Title"
              className="border border-gray-200 w-80 rounded-sm px-2 py-1"
              required
              onChange={(e) => setTitle(e.target.value)}
            />

            <label>
              Description
              <span className="text-xs ml-3 text-red-500">
                {requireDescription
                  ? "Required: Please enter a description"
                  : !validDescriptionLength
                  ? "Must be between 10-200 characters"
                  : !validDescriptionContent
                  ? "Must be plausible in order to generate a set"
                  : ""}
              </span>
            </label>
            <textarea
              placeholder="Describe what you want to learn..."
              rows={3}
              className="border border-gray-200 w-80 rounded-sm px-2 py-1 resize-none"
              required
              onChange={(e) => setDescription(e.target.value)}
            />

            <label>
              Category
              <span className="text-xs ml-3 text-red-500">
                {requireCategory ? "Required: Please select a category" : ""}
              </span>
            </label>
            <select
              name="category"
              id="category"
              className="border border-gray-200 w-80 rounded-sm px-3 py-3"
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Select a category">Select a category</option>
              <option value="Business">Business</option>
              <option value="Communication">Communication</option>
              <option value="Creativity">Creativity</option>
              <option value="Health">Health</option>
              <option value="Humanities">Humanities</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Productivity">Productivity</option>
              <option value="Science">Science</option>
              <option value="Technology">Technology</option>
              <option value="Test Prep">Test Prep</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>

            {/*Form submit and cancel buttons*/}
            <div className="mt-7 flex">
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
                {!isLoading && "Create Set"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
