import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { analyzePatient } from "./gemini";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "./Dashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [showFullPrediction, setShowFullPrediction] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchPatients() {
      try {
        const snapshot = await getDocs(collection(db, "patients"));

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPatients(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchPatients();
  }, []);
  const logout = async () => {
  await signOut(auth);
  navigate("/login");
};
  const deletePatient = async (id) => {
    try {
      await deleteDoc(doc(db, "patients", id));

      setPatients((prev) =>
        prev.filter((patient) => patient.id !== id)
      );

      alert("Patient deleted successfully!");
    } catch (error) {
      console.error(error);
    }
  };
const predictRisk = async (patient) => {
  setLoadingAI(true);
  setPrediction("");

  try {
    const patientText = `
Name: ${patient.name}
Age: ${patient.age}
Blood Pressure: ${patient.bloodPressure}
Symptoms: ${patient.symptoms?.join(", ")}
Allergies: ${patient.allergies?.join(", ")}
Medications: ${patient.medications?.join(", ")}
`;

    const result = await analyzePatient(patientText);
    setPrediction(result);
  } catch (error) {
    console.error(error);
    setPrediction(error.message);
  }

  setLoadingAI(false);
};
const downloadPDF = () => {
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("MedGuard AI - Patient Report", 20, 20);

  pdf.setFontSize(12);
  pdf.text(`Name: ${selectedPatient.name}`, 20, 40);
  pdf.text(`Age: ${selectedPatient.age}`, 20, 50);
  pdf.text(`Blood Pressure: ${selectedPatient.bloodPressure}`, 20, 60);
  pdf.text(`Risk Level: ${selectedPatient.riskLevel}`, 20, 70);

  pdf.text(
    `Symptoms: ${selectedPatient.symptoms?.join(", ") || "None"}`,
    20,
    90
  );

  pdf.text(
    `Allergies: ${selectedPatient.allergies?.join(", ") || "None"}`,
    20,
    105
  );

  pdf.text(
    `Medications: ${selectedPatient.medications?.join(", ") || "None"}`,
    20,
    120
  );

  if (prediction) {
    pdf.text("AI Prediction:", 20, 140);

    const lines = pdf.splitTextToSize(prediction, 170);
    pdf.text(lines, 20, 150);
  }

  pdf.save(`${selectedPatient.name}_Report.pdf`);
};
  const filteredPatients = patients.filter((patient) =>
    (patient.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPatients = patients.length;

  const highRisk = patients.filter(
    (p) => p.riskLevel === "High"
  ).length;

  const mediumRisk = patients.filter(
    (p) => p.riskLevel === "Medium"
  ).length;

  const lowRisk = patients.filter(
    (p) => p.riskLevel === "Low"
  ).length;
  const riskData = [
  { name: "High Risk", value: highRisk },
  { name: "Medium Risk", value: mediumRisk },
  { name: "Low Risk", value: lowRisk },
];

const patientStats = [
  {
    name: "Total",
    count: totalPatients
  },
  {
    name: "High",
    count: highRisk
  },
  {
    name: "Medium",
    count: mediumRisk
  },
  {
    name: "Low",
    count: lowRisk
  }
];
  return (
    <div className="dashboard">
      <div className="navbar">
  <h2>🏥 MedGuard AI</h2>

  <div>
    <span style={{ marginRight: "15px" }}>
      Welcome, Admin 👩‍⚕️
    </span>

    <button
      onClick={logout}
      style={{
        background: "#f44336",
        color: "white",
        border: "none",
        padding: "8px 14px",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  </div>
</div>

<h1>Patient History</h1>

      <div className="stats">
        <div className="card blue">
          <h3>Total Patients</h3>
          <h2>{totalPatients}</h2>
        </div>

        <div className="card red">
          <h3>High Risk</h3>
          <h2>{highRisk}</h2>
        </div>

        <div className="card orange">
          <h3>Medium Risk</h3>
          <h2>{mediumRisk}</h2>
        </div>

        <div className="card green">
          <h3>Low Risk</h3>
          <h2>{lowRisk}</h2>
        </div>
      </div>
      <div className="charts">

  <div className="chart-card">
    <h2>📊 Risk Distribution</h2>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={riskData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label
        >
          {riskData.map((entry, index) => (
            <Cell
              key={index}
              fill={
                index === 0
                  ? "red"
                  : index === 1
                  ? "orange"
                  : "green"
              }
            />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>

  <div className="chart-card">
    <h2>📈 Patient Statistics</h2>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={patientStats}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#2196F3" />
      </BarChart>
    </ResponsiveContainer>
  </div>

</div>
      <input
        type="text"
        placeholder="Search patient..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Risk Level</th>
            <th>Blood Pressure</th>
            <th>View</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {filteredPatients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>{patient.age}</td>

              <td>
                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: "20px",
                    color: "white",
                    fontWeight: "bold",
                    backgroundColor:
                      patient.riskLevel === "High"
                        ? "red"
                        : patient.riskLevel === "Medium"
                        ? "orange"
                        : patient.riskLevel === "Low"
                        ? "green"
                        : "gray",
                  }}
                >
                  {patient.riskLevel || "Not Available"}
                </span>
              </td>

              <td>{patient.bloodPressure}</td>

              <td>
                <button
                  onClick={() => {
  setSelectedPatient(patient);
  setPrediction("");
  setShowFullPrediction(false);
}}
                >
                  View
                </button>
              </td>

              <td>
                <button
                  onClick={() => deletePatient(patient.id)}
                  style={{
                    background: "red",
                    color: "white",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedPatient && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
  style={{
    background: "white",
    padding: "25px",
    borderRadius: "10px",
    width: "650px",
    maxHeight: "80vh",
    overflowY: "auto",
  }}
>
            <h2>Patient Details</h2>

           <p style={{ margin: "8px 0" }}>
  <b>Name:</b> {selectedPatient.name}
</p>
            <p><b>Age:</b> {selectedPatient.age}</p>
            <p><b>Blood Pressure:</b> {selectedPatient.bloodPressure}</p>
            <p><b>Risk Level:</b> {selectedPatient.riskLevel}</p>
            <p><b>Symptoms:</b> {selectedPatient.symptoms?.join(", ")}</p>
            <p><b>Allergies:</b> {selectedPatient.allergies?.join(", ")}</p>
            <p><b>Medications:</b> {selectedPatient.medications?.join(", ")}</p>

            <div style={{ marginTop: "20px" }}>
  <button
    onClick={() => predictRisk(selectedPatient)}
    style={{
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      padding: "10px 15px",
      borderRadius: "5px",
      cursor: "pointer",
      marginRight: "10px",
    }}
  >
    🤖 AI Predict
  </button>
  <button
  onClick={downloadPDF}
  style={{
    background: "#2196F3",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
    marginLeft: "10px",
  }}
>
  📄 Download PDF
</button>
  <button
    onClick={() => setSelectedPatient(null)}
    style={{
      backgroundColor: "#f44336",
      color: "white",
      border: "none",
      padding: "10px 15px",
      borderRadius: "5px",
      cursor: "pointer",
    }}
  >
    Close
  </button>
</div>

{loadingAI && (
  <p style={{ color: "blue", marginTop: "15px" }}>
    🤖 AI is analyzing the patient...
  </p>
)}

{prediction && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      background: "#f5f5f5",
      borderRadius: "8px",
      whiteSpace: "pre-wrap",
      maxHeight: "220px",
      overflowY: "auto",
      border: "1px solid #ddd",
    }}
  >
    <h3>🤖 AI Prediction</h3>

   <div
  style={{
    background: "#ffffff",
    borderRadius: "10px",
    padding: "15px",
    lineHeight: "1.8",
    color: "#333",
    border: "1px solid #ddd",
  }}
>
  {showFullPrediction
    ? prediction
    : prediction.length > 250
    ? prediction.substring(0, 250) + "..."
    : prediction}
</div>

    {prediction.length > 250 && (
      <button
        onClick={() =>
          setShowFullPrediction(!showFullPrediction)
        }
        style={{
          background: "#2196F3",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        {showFullPrediction ? "Show Less ▲" : "Show More ▼"}
      </button>
    )}
  </div>
)}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;