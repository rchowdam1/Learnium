"use client";
import { useState } from "react";
import { X } from "lucide-react";

type CreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreateSet: (title: string, description: string, category: string) => void;
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

  // state to gather user input
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("Select a category");

  if (!open) {
    return;
  }

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

    return validFields;
  };

  const formSubmit = (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    // inputs are valid, create the set
    onCreateSet(title, description, category);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-40 flex justify-center items-center transition-all duration-200 ${
        open ? "visible opacity-100 bg-black/20" : "invisible opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-md z-50 shadow p-6 text-center transition-all ${
          open ? "scale-100 opacity-100" : "scale-125 opacity-0"
        } `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col justify-center items-center">
          <button
            className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-600"
            onClick={onClose}
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
                {requireTitle ? "Required: Please enter a title" : ""}
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
            <div className="mt-7">
              <button
                type="button"
                className="w-39 border border-gray-200 rounded-sm py-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-39 border border-gray-200 rounded-sm py-2 bg-gray-400 text-gray-50 ml-2 cursor-pointer hover:bg-gray-500 transition-colors duration-200"
              >
                Create Set
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
