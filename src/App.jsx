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
     setResult(response);

await addDoc(collection(db, "patients"), {
  result: response,
  patient: patientData,
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
    <h2>AI Analysis</h2>

    <div style={{ whiteSpace: "pre-wrap" }}>
      {result}
    </div>
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