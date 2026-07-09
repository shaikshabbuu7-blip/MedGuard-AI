import { useState, useEffect } from "react";
import "./App.css";
import { analyzePatient } from "./gemini";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
function App() {
  const [patientData, setPatientData] = useState("");
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);
  const screenPatient = async () => {
    try {
      const response = await analyzePatient(patientData);

      // Convert Gemini response to JSON
      const data = JSON.parse(
        response.replace(/```json|```/g, "").trim()
      );

      setResult(data);

      // Save patient to Firestore
      await addDoc(collection(db, "patients"), {
        ...data,
        createdAt: new Date().toISOString(),
      });

      alert("Patient analyzed and saved successfully!");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };
if (loading) {
  return <h2>Loading...</h2>;
}
 return (
  <Routes>
    <Route
  path="/login"
  element={<Login />}
/>
<Route 
 path="/" 
 element={
  <div className="container">
          <h1>🏥 MedGuard AI</h1>
          <p>AI Powered Patient Screening System</p>

          <Link to="/dashboard">
            <button>View Patient History</button>
          </Link>

          <br /><br />

          <textarea
            placeholder="Paste the patient intake form here..."
            value={patientData}
            onChange={(e) => setPatientData(e.target.value)}
          />

          <br /><br />

          <button onClick={screenPatient}>
            Screen Patient
          </button>

          {result && (
            <div className="result">
              <h2>Extracted Details</h2>

              <p><strong>Name:</strong> {result.name}</p>
              <p><strong>Age:</strong> {result.age}</p>
              <p><strong>Symptoms:</strong> {result.symptoms?.join(", ")}</p>
              <p><strong>Allergies:</strong> {result.allergies?.join(", ")}</p>
              <p><strong>Blood Pressure:</strong> {result.bloodPressure}</p>
              <p><strong>Medications:</strong> {result.medications?.join(", ")}</p>
              <p><strong>Risk Level:</strong> {result.riskLevel}</p>
            </div>
          )}
        </div>
      }
    />

   <Route
  path="/dashboard"
  element={
    user ? (
      <Dashboard />
    ) : (
      <Login />
    )
  }
/>
  </Routes>
);
}

export default App;