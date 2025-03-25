import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import 'tailwindcss/tailwind.css';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../firebase"; // Adjust to your Firebase config path

function RenderGeneratedSummary({ summary }) {
  if (!summary) {
    return <p>No summary available.</p>;
  }

  const overallRating = summary["Overall Event Rating"];
  const keyHighlights = summary["Key Highlights"];
  const areasForImprovement = summary["Areas for Improvement"];
  const actionableSuggestions = summary["Actionable Suggestions"];
  const finalVerdict = summary["Final Verdict"];

  return (
    <div className="space-y-4 text-sm text-gray-700">
      {overallRating && (
        <div className="p-3 border rounded bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">
            ⭐ Overall Event Rating
          </h4>
          <p><strong>Average Rating:</strong> {overallRating["Average Rating"]}</p>
          <p><strong>Category:</strong> {overallRating["Category"]}</p>
        </div>
      )}

      {Array.isArray(keyHighlights) && keyHighlights.length > 0 && (
        <div className="p-3 border rounded bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">🌟 Key Highlights</h4>
          <ul className="list-disc pl-5 space-y-1">
            {keyHighlights.map((highlight, idx) => (
              <li key={idx}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(areasForImprovement) && areasForImprovement.length > 0 && (
        <div className="p-3 border rounded bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">⚠️ Areas for Improvement</h4>
          <ul className="list-disc pl-5 space-y-1">
            {areasForImprovement.map((area, idx) => (
              <li key={idx}>{area}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(actionableSuggestions) && actionableSuggestions.length > 0 && (
        <div className="p-3 border rounded bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Actionable Suggestions</h4>
          <ul className="list-disc pl-5 space-y-1">
            {actionableSuggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {finalVerdict && (
        <div className="p-3 border rounded bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">🏁 Final Verdict</h4>
          <p>
            <strong>Conclusion:</strong>{" "}
            {finalVerdict["Conclusion"] || finalVerdict["conclusion"] || "N/A"}
          </p>
          <p>
            <strong>Reasoning:</strong>{" "}
            {finalVerdict["Reasoning"] || finalVerdict["reasoning"] || "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  // States for fetched events & loading/error
  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [treesPlanted, setTreesPlanted] = useState(0);
  const [showDonationsModal, setShowDonationsModal] = useState(false);

  // Chart data
  const [eventNames, setEventNames] = useState([]);
  const [volunteersPerEvent, setVolunteersPerEvent] = useState([]);
  const [donationCategories, setDonationCategories] = useState([]);
  const [donationAmounts, setDonationAmounts] = useState([]);
  const [eventDonations, setEventDonations] = useState([]);

  // Summary Form Modal
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [eventForSummary, setEventForSummary] = useState(null);
  const [summaryData, setSummaryData] = useState({
    eventName: "",
    location: "",
    startDate: "",
    endDate: "",
    positionsAllocated: 0,
    totalPositions: 0,
    volunteersRegistered: 0,
    organizerFeel: "",
    organizerEnjoyment: "",
    fileUrl: "",
    eventImages: [],
    eventId: "",
  });

  // File uploads
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagesUploadLoading, setImagesUploadLoading] = useState(false);

  // AI Summary Modal
  const [showGeneratedSummaryModal, setShowGeneratedSummaryModal] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState(null);

  // Instead of a global summaryLoading, track which event is currently loading
  const [loadingEventId, setLoadingEventId] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [donors, setDonors] = useState([]);

  // Placeholder for "Submit Feedback"
  const handleOpenFeedbackForm = (eventId) => {
    alert(`Open feedback form for eventId: ${eventId}`);
  };

  // 1. Open the "Submit Event Summary" form modal
  const handleOpenSummaryForm = (evt) => {
    setEventForSummary(evt);
    setSummaryData({
      eventName: evt.title,
      location: evt.eventLocation,
      startDate: evt.eventStartDate?.split("T")[0] || "",
      endDate: evt.eventEndDate?.split("T")[0] || "",
      positionsAllocated:
        evt.volunteeringPositions?.reduce(
          (acc, pos) => acc + (pos.registeredUsers?.length || 0),
          0
        ) || 0,
      totalPositions:
        evt.volunteeringPositions?.reduce(
          (acc, pos) => acc + (pos.slots || 0),
          0
        ) || 0,
      volunteersRegistered:
        evt.volunteeringPositions?.flatMap((pos) => pos.registeredUsers).length || 0,
      organizerFeel: "",
      organizerEnjoyment: "",
      fileUrl: "",
      eventImages: [],
      eventId: evt._id,
    });
    setShowSummaryForm(true);
  };

  // 2. Submit Event Summary
  const handleSubmitSummary = async (e) => {
    e.preventDefault();
    const organiserId = user._id;

    const payload = {
      eventName: summaryData.eventName,
      location: summaryData.location,
      startDate: summaryData.startDate,
      endDate: summaryData.endDate,
      positionsAllocated: summaryData.positionsAllocated,
      totalPositions: summaryData.totalPositions,
      volunteersRegistered: summaryData.volunteersRegistered,
      organizerFeel: summaryData.organizerFeel,
      organizerEnjoyment: summaryData.organizerEnjoyment,
      fileUrl: summaryData.fileUrl,
      eventImages: summaryData.eventImages,
      eventId: summaryData.eventId,
      organiserId,
    };

    try {
      const res = await fetch("http://localhost:3000/api/v1/events/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      toast.success("Event summary submitted successfully!");
      setShowSummaryForm(false);
    } catch (err) {
      toast.error(`Error submitting summary: ${err.message}`);
    }
  };

  // 3. File handling
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }
    setFileUploadLoading(true);
    try {
      const storage = getStorage(app, "gs://mern-blog-b327f.appspot.com");
      const sanitizedFileName =
        new Date().getTime() + "-" + selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storageRef = ref(storage, sanitizedFileName);
      let metadata = { contentType: selectedFile.type };

      if (!metadata.contentType && /\.pdf$/i.test(selectedFile.name)) {
        metadata.contentType = "application/pdf";
      }

      const snapshot = await uploadBytes(storageRef, selectedFile, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setSummaryData((prev) => ({ ...prev, fileUrl: downloadURL }));
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(`Error uploading file: ${error.message}`);
    } finally {
      setFileUploadLoading(false);
    }
  };

  const handleImagesChange = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };

  const handleUploadImages = async () => {
    if (selectedImages.length === 0) {
      toast.error("Please select one or more images");
      return;
    }
    setImagesUploadLoading(true);
    try {
      const storage = getStorage(app, "gs://mern-blog-b327f.appspot.com");
      const uploadedImageURLs = [];

      for (const image of selectedImages) {
        const sanitizedFileName =
          new Date().getTime() + "-" + image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const storageRef = ref(storage, sanitizedFileName);
        let metadata = { contentType: image.type };
        const snapshot = await uploadBytes(storageRef, image, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedImageURLs.push(downloadURL);
      }

      setSummaryData((prev) => ({ ...prev, eventImages: uploadedImageURLs }));
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error(`Error uploading images: ${error.message}`);
    } finally {
      setImagesUploadLoading(false);
    }
  };

  // 4. Generate Feedback Summary (AI) - track the loading event ID
  const handleGenerateFeedbackSummary = async (eventId) => {
    setLoadingEventId(eventId);
    setSummaryError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/analyze/${eventId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setGeneratedSummary(data);
      setShowGeneratedSummaryModal(true);
    } catch (err) {
      setSummaryError(err.message);
      toast.error(`Error generating summary: ${err.message}`);
    } finally {
      // Clear loadingEventId
      setLoadingEventId(null);
    }
  };

  // 5. Controlled input for summary form
  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummaryData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!user?._id) return;
  
    const fetchMyEvents = async () => {
      try {
        // Fetch events created by current user
        const url = `http://localhost:3000/api/v1/events/getEvents?createdBy=${user._id}`;
        const res = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setEvents(data);
        setTotalEvents(data.length);
  
        // Compute total volunteers & bar chart data
        let overallVolunteers = 0;
        const names = [];
        const volunteersCountArray = [];
  
        data.forEach((evt) => {
          let eventVolunteers = 0;
          if (evt.volunteeringPositions) {
            evt.volunteeringPositions.forEach((pos) => {
              if (pos.registeredUsers) {
                eventVolunteers += pos.registeredUsers.length;
              }
            });
          }
          overallVolunteers += eventVolunteers;
          names.push(evt.title);
          volunteersCountArray.push(eventVolunteers);
        });
  
        setTotalVolunteers(overallVolunteers);
        setEventNames(names);
        setVolunteersPerEvent(volunteersCountArray);
  
        // Fetch all donations
        const donationRes = await fetch('http://localhost:3000/api/v1/donate/fetch', {
          method: 'GET',
          credentials: 'include',
        });
        if (!donationRes.ok) {
          throw new Error(`Error ${donationRes.status}: ${donationRes.statusText}`);
        }
        const donationData = await donationRes.json();
        setDonations(donationData);
  
        // Compute overall donation amount and trees planted.
        let donationSum = donationData.data.donations.reduce((acc, donation) => acc + donation.amount, 0);
        setTotalDonations(donationSum);
        setTreesPlanted(donationSum * 0.25);
  
        // Group donations by amount
        const donationGroups = {
          'Below ₹1000': 0,
          '₹1000-₹5000': 0,
          '₹5000-₹10000': 0,
          'Above ₹10000': 0,
        };
  
        // Track event-wise donations
        // const eventWiseDonations = {};
  
        donationData.data.donations.forEach((donation) => {
          const amt = donation.amount;
          if (amt < 1000) {
            donationGroups['Below ₹1000'] += amt;
          } else if (amt < 5000) {
            donationGroups['₹1000-₹5000'] += amt;
          } else if (amt < 10000) {
            donationGroups['₹5000-₹10000'] += amt;
          } else {
            donationGroups['Above ₹10000'] += amt;
          }
  
          // // Event-wise donation accumulation
          // if (donation.eventId) {
          //   if (!eventWiseDonations[donation.eventId]) {
          //     eventWiseDonations[donation.eventId] = 0;
          //   }
          //   eventWiseDonations[donation.eventId] += amt;
          // }
        });
  
        setDonationCategories(Object.keys(donationGroups));
        setDonationAmounts(Object.values(donationGroups));
        // setEventDonations(eventWiseDonations); // Store event-wise donations
  
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMyEvents();
  }, [user]);
  

  if (loading) {
    return <p className="p-6 text-center text-gray-600">Loading dashboard data...</p>;
  }

  if (error) {
    return <p className="p-6 text-center text-red-500">Error: {error}</p>;
  }

  // Filter for past events: eventEndDate < today
  const today = new Date();
  const pastEvents = events.filter((evt) => new Date(evt.eventEndDate) < today);

  // Bar chart config
  const barData = {
    labels: eventNames,
    datasets: [
      {
        label: 'Volunteers',
        data: volunteersPerEvent,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Pie chart config
  const pieData = {
    labels: donationCategories,
    datasets: [
      {
        label: 'Donation Distribution',
        data: donationAmounts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(201, 203, 207, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const fetchDonors = async () => {
    console.log("hit 1")
    try {
      const response = await fetch('http://localhost:3000/api/v1/donate/donors', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      // data.data.donations should be an array of donation objects
      setDonors(data.data.donations);
      console.log(donors)
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Organiser Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {/* Events Organized */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Events Organized</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-800">
            {totalEvents}
          </p>
        </div>

        {/* Volunteers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Volunteers</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-800">
            {totalVolunteers}
          </p>
        </div>

        {/* Donations Received */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Donations Received</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-800">₹{totalDonations}</p>
        </div>

        {/* Trees Planted */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Trees Planted</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-800">
            {Math.floor(treesPlanted)}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart (Volunteers per Event) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Volunteers per Event
          </h3>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Pie Chart (Donation Distribution by Denomination) */}
        {/* Open Modal Button */}

      {/* Pie Chart (Donation Distribution by Denomination) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Donation Distribution by Denomination
        </h3>
        <div className="h-64">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>

      {/* Donations List */}
        <button
          onClick={() => {
            fetchDonors();
            setShowDonationsModal(true);
          }}
          className="mt-3 text-blue-500 underline hover:text-blue-700"
        >
          View Donors list
        </button>
      </div>
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      {donors.length > 0 ? (
      <div>
      {showDonationsModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-96 overflow-y-auto relative">
            <button
              onClick={() => setShowDonationsModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>
            <ul className="space-y-4">
              {donors.map((donation) => (
                <li key={donation._id} className="bg-gray-100 shadow-md rounded-lg p-4">
                  <p className="font-medium">
                    {donation.donorName} donated ₹{donation.amount}
                  </p>
                  <p className="text-gray-600">Message: {donation.message}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  ) : (
    <p className="text-gray-500">No donations received yet.</p>
  )
  }
</div>


      {/* Past Events Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Past Events (Ended)
        </h3>
        {events.length > 0 && (
          <p className="text-sm text-gray-500 mb-2">
            Showing only events whose end date is before today
          </p>
        )}
        {pastEvents.length > 0 ? (
          <ul className="space-y-4">
            {pastEvents.map((evt) => (
              <li key={evt._id} className="bg-white shadow-md rounded-lg p-4">
                <p className="font-medium text-lg text-gray-800">{evt.title}</p>
                <p className="text-gray-600">Location: {evt.eventLocation}</p>
                <p className="text-gray-600">
                  Ended on {new Date(evt.eventEndDate).toLocaleDateString()}
                </p>

                {/* If event.isSummaryPublished is true, disable the summary button */}
                <div className="mt-2 flex flex-wrap gap-4">
                  {/* Submit Feedback Button */}
                  <button
                    onClick={() => handleOpenFeedbackForm(evt._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    Submit Feedback
                  </button>

                  {/* Submit Event Summary Button with isSummaryPublished check */}
                  <button
                    onClick={() => handleOpenSummaryForm(evt)}
                    disabled={evt.isSummaryPublished}
                    className={`py-2 px-4 rounded text-white transition-colors ${
                      evt.isSummaryPublished
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {evt.isSummaryPublished
                      ? "Summary Already Published"
                      : "Submit Event Summary"}
                  </button>

                  {/* Generate Feedback Summary Button */}
                  <button
                    onClick={() => handleGenerateFeedbackSummary(evt._id)}
                    // Only disable & change text for the event that is loading
                    disabled={loadingEventId === evt._id}
                    className={`bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded ${
                      loadingEventId === evt._id ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loadingEventId === evt._id ? "Generating..." : "Generate Feedback Summary"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No past events found.</p>
        )}
      </div>

      {/* Modal: Submit Event Summary Form */}
      {showSummaryForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-lg">
            <h2 className="text-xl font-bold mb-4">Submit Event Summary</h2>

            {eventForSummary?.volunteeringPositions?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Volunteering Positions
                </h3>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {eventForSummary.volunteeringPositions.map((pos) => (
                    <li key={pos._id}>
                      {pos.title}: {pos.registeredUsers?.length || 0} allocated
                      out of {pos.slots} slots
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmitSummary} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Name
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={summaryData.eventName}
                  onChange={handleSummaryChange}
                  className="mt-1 block w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={summaryData.location}
                  onChange={handleSummaryChange}
                  className="mt-1 block w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={summaryData.startDate}
                    onChange={handleSummaryChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={summaryData.endDate}
                    onChange={handleSummaryChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Volunteers Registered
                </label>
                <input
                  type="number"
                  name="volunteersRegistered"
                  value={summaryData.volunteersRegistered}
                  onChange={handleSummaryChange}
                  className="mt-1 block w-full p-2 border rounded"
                  required
                  readOnly
                />
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload File (Optional)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="block w-full"
                  />
                  <button
                    type="button"
                    onClick={handleUploadFile}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    disabled={fileUploadLoading}
                  >
                    {fileUploadLoading ? "Uploading..." : "Add File"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Event Images (Optional)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setSelectedImages(Array.from(e.target.files))}
                    className="block w-full"
                  />
                  <button
                    type="button"
                    onClick={handleUploadImages}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    disabled={imagesUploadLoading}
                  >
                    {imagesUploadLoading ? "Uploading..." : "Add Images"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  How was the feel of the event?
                </label>
                <textarea
                  name="organizerFeel"
                  value={summaryData.organizerFeel}
                  onChange={handleSummaryChange}
                  className="mt-1 block w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Did you enjoy organising the event?
                </label>
                <textarea
                  name="organizerEnjoyment"
                  value={summaryData.organizerEnjoyment}
                  onChange={handleSummaryChange}
                  className="mt-1 block w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowSummaryForm(false)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI-Generated Feedback Summary */}
      {showGeneratedSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl max-h-[70vh] overflow-y-auto relative">
            <button
              onClick={() => setShowGeneratedSummaryModal(false)}
              className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-400 rounded-full p-2"
            >
              ✖
            </button>
            <h3 className="text-xl font-bold mb-4">Feedback Summary Report</h3>

            {loadingEventId && (
              <p className="text-gray-500">Generating summary...</p>
            )}
            {summaryError && (
              <p className="text-red-500">Error: {summaryError}</p>
            )}
            {/* If not loading and no error, show the summary */}
            {!loadingEventId && !summaryError && (
              <RenderGeneratedSummary summary={generatedSummary} />
            )}
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default Dashboard;
