import React, { useState } from 'react';
import axios from 'axios';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage'; // Import Firebase storage

const firebaseConfig = {
  apiKey: "AIzaSyAGnyw5LTSTo0c3BrbtcXLApllsC66FUwg",
  authDomain: "geminiai-435315.firebaseapp.com",
  projectId: "geminiai-435315",
  storageBucket: "geminiai-435315.appspot.com",
  messagingSenderId: "794442424139",
  appId: "1:794442424139:web:06f510a0539379e92252ce",
  measurementId: "G-LHHDZVZBVL"

}
firebase.initializeApp(firebaseConfig)
const storage = firebase.storage();

const GenerateQuestions = () => {
  const [questionType, setQuestionType] = useState('mcq');
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null); // For file upload
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the uploaded file
  };

  const uploadFileToFirebase = async () => {
    if (!file) return null; // If no file is selected, return null

    const storageRef = storage.ref();
    const fileRef = storageRef.child(`uploads/${file.name}`);

    // Upload the file to Firebase storage
    await fileRef.put(file);

    // Get the download URL of the uploaded file
    const fileUrl = await fileRef.getDownloadURL();
    return fileUrl;
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      let fileUrl = null;

      // If a file is selected, upload it to Firebase and get the URL
      if (file) {
        fileUrl = await uploadFileToFirebase();
      }

      // Prepare the data for the backend API
      const requestData = {
        questionType,
        numberOfQuestions,
        topic,
        fileUrl, // Send the Firebase file URL (or null if no file is uploaded)
      };

      // Make API request to generate questions
      const response = await axios.post('https://gemini-backend-6193.onrender.com/generate-questions', requestData, {
        responseType: 'blob', // Expect a blob for file download
      });

      // Create a download link and click it programmatically
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'questions.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      //loigc to delete the uploaded file so no need to store it right 
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Generate Question Paper</h1>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Test Type Dropdown */}
          <div>
            <label htmlFor="questionType" className="block text-gray-700 font-medium mb-2">Type of Test:</label>
            <select
              id="questionType"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="mcq">MCQ</option>
              <option value="descriptive">Descriptive</option>
            </select>
          </div>
          
          {/* Number of Questions Input */}
          <div>
            <label htmlFor="numberOfQuestions" className="block text-gray-700 font-medium mb-2">Number of Questions:</label>
            <input
              type="number"
              id="numberOfQuestions"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          {/* Topic Input */}
          <div>
            <label htmlFor="topic" className="block text-gray-700 font-medium mb-2">Topic:</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="file" className="block text-gray-700 font-medium mb-2">Upload File (Optional):</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="block w-full text-gray-700"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-2 text-white font-semibold rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {loading ? 'Generating...' : 'Get Question Paper'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GenerateQuestions;
