import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function DailyReports() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    projectId: "",
    date: "",
    weather: "",
    workCompleted: "",
    workPlannedTomorrow: "",
    delayReason: "",
    siteIssues: "",
    remarks: "",
    createdBy: user?.name || "",
  });

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
      setMessage("Failed to load daily reports");
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await API.post("/reports/", {
        ...formData,
        createdBy: user.name,
      });

      setMessage("Daily report created successfully");

      setFormData({
        projectId: "",
        date: "",
        weather: "",
        workCompleted: "",
        workPlannedTomorrow: "",
        delayReason: "",
        siteIssues: "",
        remarks: "",
        createdBy: user.name,
      });

      fetchReports();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.detail || "Failed to create daily report");
    } finally {
      setLoading(false);
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find((item) => item.id === projectId);
    return project ? project.projectName : "Unknown Project";
  };

  if (!user) return null;

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <h2>SiteMate AI</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/projects">Projects</Link>
          <Link className="active" to="/daily-reports">Daily Reports</Link>
          <a>Labor</a>
          <Link to="/materials">Materials</Link>
          <Link to="/pdf-reports">PDF Reports</Link>
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Daily Reports</h1>
            <p>Create and review daily construction progress reports</p>
          </div>

          <div className="user-chip">
            <span>{user.role}</span>
          </div>
        </header>

        <section className="report-layout">
          <div className="report-form-card">
            <h2>Create Daily Report</h2>

            {message && <div className="info-box">{message}</div>}

            <form onSubmit={handleCreateReport} className="project-form">
              <label>Select Project</label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                required
              >
                <option value="">Choose project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.projectName}
                  </option>
                ))}
              </select>

              <div className="two-column">
                <div>
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>Weather</label>
                  <input
                    type="text"
                    name="weather"
                    placeholder="Sunny / Rainy / Cloudy"
                    value={formData.weather}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <label>Work Completed Today</label>
              <textarea
                name="workCompleted"
                placeholder="Example: Brickwork completed on second floor"
                value={formData.workCompleted}
                onChange={handleChange}
                required
              />

              <label>Work Planned Tomorrow</label>
              <textarea
                name="workPlannedTomorrow"
                placeholder="Example: Continue plastering work on second floor"
                value={formData.workPlannedTomorrow}
                onChange={handleChange}
                required
              />

              <label>Delay Reason</label>
              <textarea
                name="delayReason"
                placeholder="Example: Plumbing work delayed because pipes did not arrive"
                value={formData.delayReason}
                onChange={handleChange}
              />

              <label>Site Issues</label>
              <textarea
                name="siteIssues"
                placeholder="Example: Cement stock is low"
                value={formData.siteIssues}
                onChange={handleChange}
              />

              <label>Remarks</label>
              <textarea
                name="remarks"
                placeholder="Additional notes"
                value={formData.remarks}
                onChange={handleChange}
              />

              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Daily Report"}
              </button>
            </form>
          </div>

          <div className="report-list-card">
            <h2>Saved Daily Reports</h2>

            {reports.length === 0 ? (
              <p className="empty-text">No daily reports created yet.</p>
            ) : (
              <div className="report-list">
                {reports.map((report) => (
                  <div className="report-card" key={report.id}>
                    <div className="report-card-header">
                      <div>
                        <h3>{getProjectName(report.projectId)}</h3>
                        <p>{report.date} • {report.weather}</p>
                      </div>
                      <span className="status-badge">Submitted</span>
                    </div>

                    <div className="report-section">
                      <strong>Work Completed:</strong>
                      <p>{report.workCompleted}</p>
                    </div>

                    <div className="report-section">
                      <strong>Tomorrow Plan:</strong>
                      <p>{report.workPlannedTomorrow}</p>
                    </div>

                    {report.delayReason && (
                      <div className="report-section">
                        <strong>Delay:</strong>
                        <p>{report.delayReason}</p>
                      </div>
                    )}

                    {report.siteIssues && (
                      <div className="report-section">
                        <strong>Site Issues:</strong>
                        <p>{report.siteIssues}</p>
                      </div>
                    )}

                    {report.remarks && (
                      <div className="report-section">
                        <strong>Remarks:</strong>
                        <p>{report.remarks}</p>
                      </div>
                    )}

                    <p className="created-by">Created by: {report.createdBy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default DailyReports;