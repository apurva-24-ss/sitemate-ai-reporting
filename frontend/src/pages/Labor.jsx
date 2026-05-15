import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Labor() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [laborEntries, setLaborEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    reportId: "",
    laborType: "Mason",
    count: "",
    workingHours: "",
    workAssigned: "",
    overtime: 0,
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

  const fetchLabor = async () => {
    try {
      const response = await API.get("/labor/");
      setLaborEntries(response.data.labor || []);
    } catch (error) {
      console.log(error);
      setMessage("Failed to load labor entries");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchProjects();
    fetchReports();
    fetchLabor();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getProjectName = (projectId) => {
    const project = projects.find((item) => item.id === projectId);
    return project ? project.projectName : "Unknown Project";
  };

  const getReportLabel = (reportId) => {
    const report = reports.find((item) => item.id === reportId);

    if (!report) return "Unknown Report";

    return `${getProjectName(report.projectId)} - ${report.date}`;
  };

  const handleCreateLabor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await API.post("/labor/", {
        ...formData,
        count: Number(formData.count),
        workingHours: Number(formData.workingHours),
        overtime: Number(formData.overtime || 0),
      });

      setMessage("Labor entry created successfully");

      setFormData({
        reportId: "",
        laborType: "Mason",
        count: "",
        workingHours: "",
        workAssigned: "",
        overtime: 0,
      });

      fetchLabor();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.detail || "Failed to create labor entry");
    } finally {
      setLoading(false);
    }
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
          <Link className="active" to="/labor">Labor</Link>
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
            <h1>Labor Management</h1>
            <p>Add and track daily construction labor entries</p>
          </div>

          <div className="user-chip">
            <span>{user.role}</span>
          </div>
        </header>

        <section className="labor-layout">
          <div className="labor-form-card">
            <h2>Add Labor Entry</h2>

            {message && <div className="info-box">{message}</div>}

            <form onSubmit={handleCreateLabor} className="project-form">
              <label>Select Daily Report</label>
              <select
                name="reportId"
                value={formData.reportId}
                onChange={handleChange}
                required
              >
                <option value="">Choose report</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {getProjectName(report.projectId)} - {report.date}
                  </option>
                ))}
              </select>

              <label>Labor Type</label>
              <select
                name="laborType"
                value={formData.laborType}
                onChange={handleChange}
                required
              >
                <option value="Mason">Mason</option>
                <option value="Helper">Helper</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Painter">Painter</option>
                <option value="Welder">Welder</option>
                <option value="Machine Operator">Machine Operator</option>
                <option value="Supervisor">Supervisor</option>
              </select>

              <div className="two-column">
                <div>
                  <label>Number of Workers</label>
                  <input
                    type="number"
                    name="count"
                    placeholder="12"
                    value={formData.count}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>Working Hours</label>
                  <input
                    type="number"
                    name="workingHours"
                    placeholder="8"
                    value={formData.workingHours}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <label>Work Assigned</label>
              <textarea
                name="workAssigned"
                placeholder="Example: Brickwork on second floor"
                value={formData.workAssigned}
                onChange={handleChange}
                required
              />

              <label>Overtime Hours</label>
              <input
                type="number"
                name="overtime"
                placeholder="0"
                value={formData.overtime}
                onChange={handleChange}
              />

              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Add Labor Entry"}
              </button>
            </form>
          </div>

          <div className="labor-list-card">
            <h2>Labor Entries</h2>

            {laborEntries.length === 0 ? (
              <p className="empty-text">No labor entries added yet.</p>
            ) : (
              <div className="labor-list">
                {laborEntries.map((labor) => (
                  <div className="labor-card" key={labor.id}>
                    <div className="labor-card-header">
                      <div>
                        <h3>{labor.laborType}</h3>
                        <p>{getReportLabel(labor.reportId)}</p>
                      </div>

                      <span className="status-badge">
                        {labor.count} Workers
                      </span>
                    </div>

                    <div className="labor-details-grid">
                      <p>
                        <strong>Working Hours:</strong> {labor.workingHours}
                      </p>
                      <p>
                        <strong>Overtime:</strong> {labor.overtime || 0}
                      </p>
                    </div>

                    <div className="report-section">
                      <strong>Work Assigned:</strong>
                      <p>{labor.workAssigned}</p>
                    </div>
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

export default Labor;