import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState({
    projects: 0,
    reports: 0,
    labor: 0,
    materials: 0,
  });

  const [recentReports, setRecentReports] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchDashboardData = async () => {
    try {
      const projectsResponse = await API.get("/projects/");
      const reportsResponse = await API.get("/reports/");
      const laborResponse = await API.get("/labor/");
      const materialsResponse = await API.get("/materials/");

      setStats({
        projects: projectsResponse.data.count || 0,
        reports: reportsResponse.data.count || 0,
        labor: laborResponse.data.count || 0,
        materials: materialsResponse.data.count || 0,
      });

      setRecentReports((reportsResponse.data.reports || []).slice(-3).reverse());
    } catch (error) {
      console.log("Dashboard data error:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchDashboardData();
  }, []);

  if (!user) return null;

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <h2>SiteMate AI</h2>

        <nav>
          <Link className="active" to="/dashboard">Dashboard</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/daily-reports">Daily Reports</Link>
          <Link to="/labor">Labor</Link>
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
            <h1>Dashboard</h1>
            <p>Welcome back, {user.name}</p>
          </div>

          <div className="user-chip">
            <span>{user.role}</span>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <h3>Total Projects</h3>
            <p>{stats.projects}</p>
          </div>

          <div className="stat-card">
            <h3>Daily Reports</h3>
            <p>{stats.reports}</p>
          </div>

          <div className="stat-card">
            <h3>Labor Entries</h3>
            <p>{stats.labor}</p>
          </div>

          <div className="stat-card">
            <h3>Material Entries</h3>
            <p>{stats.materials}</p>
          </div>
        </section>

        <section className="dashboard-panel">
          <h2>Quick Actions</h2>

          <div className="workflow-grid">
            <Link className="workflow-card action-card" to="/projects">
              <h3>Create Project</h3>
              <p>Add construction project details like location, client, contractor, and dates.</p>
            </Link>

            <Link className="workflow-card action-card" to="/daily-reports">
              <h3>Create Daily Report</h3>
              <p>Record work completed, tomorrow&apos;s plan, delays, issues, and remarks.</p>
            </Link>

            <Link className="workflow-card action-card" to="/labor">
              <h3>Add Labor</h3>
              <p>Maintain daily manpower, work assignment, and working-hour details.</p>
            </Link>

            <Link className="workflow-card action-card" to="/materials">
              <h3>Add Materials</h3>
              <p>Track opening stock, received quantity, used quantity, and closing stock.</p>
            </Link>
          </div>
        </section>

        <section className="dashboard-panel recent-panel">
          <h2>Recent Daily Reports</h2>

          {recentReports.length === 0 ? (
            <p className="empty-text">No daily reports created yet.</p>
          ) : (
            <div className="recent-report-list">
              {recentReports.map((report) => (
                <div className="recent-report-card" key={report.id}>
                  <h3>{report.date}</h3>
                  <p><strong>Weather:</strong> {report.weather}</p>
                  <p><strong>Work:</strong> {report.workCompleted}</p>

                  <Link to="/pdf-reports" className="small-link-btn">
                    Go to PDF Reports
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;