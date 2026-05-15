import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function PDFReports() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchProjects = async () => {
    try {
      const response = await API.get("/projects/");
      setProjects(response.data.projects || []);
    } catch (error) {
      console.log(error);
      setMessage("Failed to load projects");
    }
  };

  const fetchReports = async () => {
    try {
      const response = await API.get("/reports/");
      setReports(response.data.reports || []);
    } catch (error) {
      console.log(error);
      setMessage("Failed to load reports");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchProjects();
    fetchReports();
  }, []);

  const getProjectName = (projectId) => {
    const project = projects.find((item) => item.id === projectId);
    return project ? project.projectName : "Unknown Project";
  };

  const downloadPDF = (reportId) => {
    const pdfUrl = `${API_BASE_URL}/pdf/report/${reportId}`;
    window.open(pdfUrl, "_blank");
  };

  if (!user) return null;

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <h2>SiteMate AI</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/daily-reports">Daily Reports</Link>
          <Link to="/labor">Labor</Link>
          <Link to="/materials">Materials</Link>
          <Link className="active" to="/pdf-reports">PDF Reports</Link>
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>PDF Reports</h1>
            <p>Download professional daily construction report PDFs</p>
          </div>

          <div className="user-chip">
            <span>{user.role}</span>
          </div>
        </header>

        <section className="pdf-panel">
          <div className="pdf-panel-header">
            <div>
              <h2>Available Daily Reports</h2>
              <p>Select any report and download it as a PDF.</p>
            </div>
          </div>

          {message && <div className="info-box">{message}</div>}

          {reports.length === 0 ? (
            <p className="empty-text">No daily reports available yet.</p>
          ) : (
            <div className="pdf-report-list">
              {reports.map((report) => (
                <div className="pdf-report-card" key={report.id}>
                  <div>
                    <h3>{getProjectName(report.projectId)}</h3>
                    <p>
                      <strong>Date:</strong> {report.date}
                    </p>
                    <p>
                      <strong>Weather:</strong> {report.weather}
                    </p>
                    <p>
                      <strong>Created By:</strong> {report.createdBy || "-"}
                    </p>
                  </div>

                  <div className="pdf-report-summary">
                    <p>
                      <strong>Work Completed:</strong>
                    </p>
                    <p>{report.workCompleted}</p>
                  </div>

                  <button
                    className="download-pdf-btn"
                    onClick={() => downloadPDF(report.id)}
                  >
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default PDFReports;