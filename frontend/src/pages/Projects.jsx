import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Projects() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    projectName: "",
    location: "",
    clientName: "",
    contractorName: "",
    startDate: "",
    endDate: "",
    projectType: "Residential",
    status: "In Progress",
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

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await API.post("/projects/", formData);

      setMessage("Project created successfully");

      setFormData({
        projectName: "",
        location: "",
        clientName: "",
        contractorName: "",
        startDate: "",
        endDate: "",
        projectType: "Residential",
        status: "In Progress",
      });

      fetchProjects();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.detail || "Failed to create project");
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
          <Link className="active" to="/projects">Projects</Link>
          <Link to="/daily-reports">Daily Reports</Link>
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
            <h1>Projects</h1>
            <p>Create and manage construction projects</p>
          </div>

          <div className="user-chip">
            <span>{user.role}</span>
          </div>
        </header>

        <section className="project-layout">
          <div className="project-form-card">
            <h2>Create New Project</h2>

            {message && <div className="info-box">{message}</div>}

            <form onSubmit={handleCreateProject} className="project-form">
              <label>Project Name</label>
              <input
                type="text"
                name="projectName"
                placeholder="Green Heights Apartment"
                value={formData.projectName}
                onChange={handleChange}
                required
              />

              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="Dallas, Texas"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <label>Client Name</label>
              <input
                type="text"
                name="clientName"
                placeholder="ABC Developers"
                value={formData.clientName}
                onChange={handleChange}
                required
              />

              <label>Contractor Name</label>
              <input
                type="text"
                name="contractorName"
                placeholder="BuildRight Contractors"
                value={formData.contractorName}
                onChange={handleChange}
                required
              />

              <div className="two-column">
                <div>
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="two-column">
                <div>
                  <label>Project Type</label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Planning">Planning</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Project"}
              </button>
            </form>
          </div>

          <div className="project-list-card">
            <h2>All Projects</h2>

            {projects.length === 0 ? (
              <p className="empty-text">No projects created yet.</p>
            ) : (
              <div className="project-list">
                {projects.map((project) => (
                  <div className="project-card" key={project.id}>
                    <div>
                      <h3>{project.projectName}</h3>
                      <p>{project.location}</p>
                    </div>

                    <span className="status-badge">{project.status}</span>

                    <div className="project-details">
                      <p><strong>Client:</strong> {project.clientName}</p>
                      <p><strong>Contractor:</strong> {project.contractorName}</p>
                      <p><strong>Type:</strong> {project.projectType}</p>
                      <p><strong>Start:</strong> {project.startDate}</p>
                      <p><strong>End:</strong> {project.endDate}</p>
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

export default Projects;