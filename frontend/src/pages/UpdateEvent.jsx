import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Alert,
  Button,
  FileInput,
  TextInput,
  Card,
  Label,
  Spinner,
} from "flowbite-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  HiPlus,
  HiTrash,
  HiMicrophone,
  HiStop,
  HiUpload,
} from "react-icons/hi";
import LocationPicker from "../components/LocationPicker";

/** Quill modules config for toolbar, etc. */
const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

/** Example categories */
const eventCategories = [
  "Education & Skill Development",
  "Sports & Cultural Events",
  "Health & Well-being",
  "Women Empowerment",
  "Environmental Sustainability",
  "Social Inclusion & Awareness",
];

function UpdateEvent() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // States for loading/fetch errors
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // States for the existing event data
  const [existingEvent, setExistingEvent] = useState(null);

  // Form data states
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "", // the existing or newly uploaded image URL
    category: "",
  });

  // Additional fields
  const [eventLocation, setEventLocation] = useState("");
  const [eventStartDate, setEventStartDate] = useState(null);
  const [eventEndDate, setEventEndDate] = useState(null);

  // Volunteering positions
  const [volPositions, setVolPositions] = useState([
    { title: "", slots: "", whatsappGroupLink: "" },
  ]);

  // States for file upload
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);

  // Submission errors
  const [publishError, setPublishError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Speech recognition states
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const quillRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const [language, setLanguage] = useState("en-US");
  const [showDropdown, setShowDropdown] = useState(false);

  const indianLanguages = [
    { code: "en-IN", label: "English" },
    { code: "hi-IN", label: "Hindi" },
    { code: "bn-IN", label: "Bengali" },
    { code: "ta-IN", label: "Tamil" },
    { code: "te-IN", label: "Telugu" },
    { code: "kn-IN", label: "Kannada" },
    { code: "ml-IN", label: "Malayalam" },
    { code: "gu-IN", label: "Gujarati" },
    { code: "mr-IN", label: "Marathi" },
  ];

  /** 1. Fetch existing event by slug */
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/events/${slug}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        const data = await res.json();
        setExistingEvent(data);

        // Pre-fill states from fetched data
        setFormData({
          title: data.title || "",
          content: data.content || "",
          image: data.image || "",
          category: data.category || "",
        });
        setEventLocation(data.eventLocation || "");
        setEventStartDate(data.eventStartDate ? new Date(data.eventStartDate) : null);
        setEventEndDate(data.eventEndDate ? new Date(data.eventEndDate) : null);

        if (data.volunteeringPositions && data.volunteeringPositions.length > 0) {
          setVolPositions(
            data.volunteeringPositions.map((pos) => ({
              title: pos.title,
              slots: pos.slots.toString(), // convert number to string
              whatsappGroupLink: pos.whatsappGroupLink || "",
            }))
          );
        }
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  /** 2. Speech Recognition Setup */
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const currentResult = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += currentResult + " ";
            setTranscript(finalTranscriptRef.current);
          } else {
            interimTranscript += currentResult;
          }
        }
        setTranscript(finalTranscriptRef.current + interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Error occurred in speech recognition:", event.error);
      };
    } else {
      alert("Web Speech API is not supported in this browser.");
    }
  }, [language]);

  const startRecording = (lang) => {
    if (recognitionRef.current) {
      finalTranscriptRef.current = quillRef.current?.getEditor().getText() || "";
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };
  const stopRecording = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };
  const handleToggleRecording = (e) => {
    if (isRecording) {
      stopRecording(e);
    } else {
      setShowDropdown(!showDropdown);
    }
  };
  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    startRecording(lang);
    setShowDropdown(false);
  };
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.setText(transcript);
    }
  }, [transcript]);

  /** 3. Image Upload Handler */
  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError("Image upload failed");
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
      console.log(error);
    }
  };

  /** 4. Volunteering positions add/remove */
  const handlePositionChange = (index, field, value) => {
    const updatedPositions = [...volPositions];
    updatedPositions[index][field] = value;
    setVolPositions(updatedPositions);
  };
  const addVolPosition = () => {
    setVolPositions([
      ...volPositions,
      { title: "", slots: "", whatsappGroupLink: "" },
    ]);
  };
  const removeVolPosition = (index) => {
    if (volPositions.length === 1) return;
    const updatedPositions = volPositions.filter((_, i) => i !== index);
    setVolPositions(updatedPositions);
  };

  /** 5. Submit to update event */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic checks
    if (!eventLocation || !eventStartDate || !eventEndDate) {
      setPublishError("Please provide event location, start date, and end date.");
      return;
    }
    if (isRecording) stopRecording();

    setIsSubmitting(true);
    try {
      // Example: POST or PUT to your "update" endpoint
      const res = await fetch(
        `http://localhost:3000/api/v1/events/update/${existingEvent._id}`,
        {
          method: "PUT", // or "PUT" if you prefer
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            image: formData.image,
            category: formData.category,
            eventLocation,
            eventStartDate,
            eventEndDate,
            volunteeringPositions: volPositions,
          }),
        }
      );

      if (!res.ok) {
        console.log("Error:", res.status, res.statusText);
        setPublishError("Failed to update event");
      } else {
        // If successful, navigate away
        navigate("/");
      }
    } catch (error) {
      setPublishError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Render states
  if (loading) {
    return <p className="text-center text-gray-500">Loading event data...</p>;
  }
  if (fetchError) {
    return <p className="text-center text-red-500">Error: {fetchError}</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <div className="container mx-auto p-6">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <div className="flex justify-center mb-4">
            <h1 className="text-3xl font-bold text-center text-blue-700">
              Update Event
            </h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Title Field */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="title" value="Title" className="text-lg font-medium" />
              </div>
              <TextInput
                id="title"
                type="text"
                placeholder="Enter a descriptive title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="text-gray-800"
                sizing="lg"
              />
            </div>

            {/* Event Category Field */}
            <div>
              <div className="mb-2 block">
                <Label
                  htmlFor="category"
                  value="Event Category"
                  className="text-lg font-medium"
                />
              </div>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                }}
                className="w-full p-3 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {eventCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Location Field */}
            <div>
              <LocationPicker
                eventLocation={eventLocation}
                setEventLocation={setEventLocation}
              />
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-lg">
                  Start Date
                </label>
                <DatePicker
                  selected={eventStartDate}
                  onChange={(date) => setEventStartDate(date)}
                  minDate={new Date()}
                  placeholderText="Select start date"
                  className="w-full p-3 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-lg">End Date</label>
                <DatePicker
                  selected={eventEndDate}
                  onChange={(date) => setEventEndDate(date)}
                  minDate={eventStartDate || new Date()}
                  placeholderText="Select end date"
                  className="w-full p-3 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Image Upload */}
            <Card className="overflow-hidden">
              <div className="p-0">
                <div className="mb-2 block">
                  <Label
                    htmlFor="file"
                    value="Upload Image"
                    className="text-lg font-medium"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full">
                    <FileInput
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files[0])}
                      helperText="Upload a high-quality image for your event"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      type="button"
                      color="green"
                      size="md"
                      onClick={handleUploadImage}
                      disabled={imageUploadProgress}
                      className="font-normal bg-blue-400"
                    >
                      {imageUploadProgress ? (
                        <div className="w-16 h-16">
                          <CircularProgressbar
                            value={imageUploadProgress}
                            text={`${imageUploadProgress || 0}%`}
                          />
                        </div>
                      ) : (
                        <>
                          <HiUpload className="mr-2 h-5 w-5" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {imageUploadError && (
                  <Alert color="failure" className="mt-2">
                    {imageUploadError}
                  </Alert>
                )}
              </div>
              {/* Show existing or newly uploaded image */}
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Event"
                  className="w-full h-72 object-cover"
                />
              )}
            </Card>

            {/* Content Editor & Speech Recording */}
            <div className="relative overflow-y-auto">
              <div className="mb-1 block">
                <Label
                  htmlFor="content"
                  value="Content"
                  className="text-lg font-medium"
                />
              </div>
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <ReactQuill
                  id="content"
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  theme="snow"
                  placeholder="Express yourself..."
                  className="h-[320px] overflow-hidden mb-0 bg-white"
                  ref={quillRef}
                  modules={modules}
                />
              </div>
              {/* Speech recording button */}
              <div className="absolute bottom-2 right-2 z-10 rounded-xl">
                <div className="relative">
                  {showDropdown && !isRecording && (
                    <div
                      className="sticky right-0 bottom-full mb-2 w-auto p-0 z-50 bg-white border border-gray-200 rounded shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ul className="divide-y divide-gray-200 max-h-32 w-40 overflow-y-auto">
                        {indianLanguages.map((lang) => (
                          <li key={lang.code}>
                            <button
                              onClick={() => handleLanguageSelect(lang.code)}
                              className="block w-full px-4 py-2 text-left hover:bg-blue-100 text-blue-700 text-sm"
                            >
                              {lang.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={handleToggleRecording}
                    color={isRecording ? "failure" : "info"}
                    className="relative bg-red-600 px-0 py-0 rounded-3xl text-white font-medium w-15 h-15 "
                  >
                    {isRecording ? (
                      <HiStop className="mr-0 h-4 w-4" />
                    ) : (
                      <HiMicrophone className="mr-0 h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Volunteering Positions */}
            <Card>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-blue-700">
                  Volunteering Positions
                </h2>
                <Button
                  type="button"
                  onClick={addVolPosition}
                  color="success"
                  pill
                  size="md"
                  className="font-medium bg-blue-600"
                >
                  <HiPlus className="mr-2 h-5 w-5" />
                  Add Position
                </Button>
              </div>

              <div className="space-y-4">
                {volPositions.map((position, index) => (
                  <Card key={index} className="bg-gray-50 p-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <div className="mb-1">
                          <Label
                            htmlFor={`position-title-${index}`}
                            value="Position Title"
                          />
                        </div>
                        <TextInput
                          id={`position-title-${index}`}
                          type="text"
                          placeholder="Enter position title"
                          value={position.title}
                          onChange={(e) =>
                            handlePositionChange(index, "title", e.target.value)
                          }
                          required
                          className="py-1"
                        />
                      </div>
                      <div>
                        <div className="mb-1">
                          <Label
                            htmlFor={`position-slots-${index}`}
                            value="Number of Slots"
                          />
                        </div>
                        <TextInput
                          id={`position-slots-${index}`}
                          type="number"
                          placeholder="Enter slots needed"
                          value={position.slots}
                          onChange={(e) =>
                            handlePositionChange(index, "slots", e.target.value)
                          }
                          required
                          className="py-1"
                        />
                      </div>
                    </div>

                    {/* WhatsApp Group Link Field */}
                    <div className="mt-2">
                      <div className="mb-1">
                        <Label
                          htmlFor={`position-whatsapp-${index}`}
                          value="WhatsApp Group Link"
                        />
                      </div>
                      <TextInput
                        id={`position-whatsapp-${index}`}
                        type="url"
                        placeholder="Enter WhatsApp group link"
                        value={position.whatsappGroupLink}
                        onChange={(e) =>
                          handlePositionChange(
                            index,
                            "whatsappGroupLink",
                            e.target.value
                          )
                        }
                        className="py-1"
                      />
                    </div>

                    <div className="flex justify-end mt-2">
                      <Button
                        type="button"
                        onClick={() => removeVolPosition(index)}
                        color="failure"
                        size="sm"
                        disabled={volPositions.length === 1}
                        className="font-small bg-red-500 py-2 px-2"
                      >
                        <HiTrash className="mr-1 h-5 w-5" />
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Submit (Update) Button */}
            <Button
              type="submit"
              color="success"
              className="w-full py-3 text-xl font-medium bg-green-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-3" />
                  Updating Event...
                </>
              ) : (
                "Update Event"
              )}
            </Button>

            {/* Publish Error Alert */}
            {publishError && (
              <Alert color="failure" className="mt-4">
                {publishError}
              </Alert>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}

export default UpdateEvent;
