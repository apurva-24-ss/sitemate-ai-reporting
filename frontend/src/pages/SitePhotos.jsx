import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function SitePhotos() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    reportId: "",
    caption: "",
    file: null,
  });

  const [preview, setPreview] = useState("");

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

  const fetchPhotos = async () => {
    try {
      const response = await API.get("/photos/");
      setPhotos(response.data.photos || []);
    } catch (error) {
      console.log(error);
      setMessage("Failed to load site photos");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchProjects();
    fetchReports();
    fetchPhotos();
  }, []);

  const getProjectName = (projectId) => {
    const project = projects.find((item) => item.id === projectId);
    return project ? project.projectName : "Unknown Project";
  };

  const getReportLabel = (reportId) => {
    const report = reports.find((item) => item.id === reportId);

    if (!report) return "Unknown Report";

    return `${getProjectName(report.projectId)} - ${report.date}`;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setFormData({
      ...formData,
      file: selectedFile,
    });

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview("");
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!formData.file) {
      setMessage("Please select an image file");
      setLoading(false);
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append("reportId", formData.reportId);
      uploadData.append("caption", formData.caption);
      uploadData.append("file", formData.file);

      await API.post("/photos/", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Site photo uploaded successfully");

      setFormData({
        reportId: "",
        caption: "",
        file: null,
      });

      setPreview("");

      const fileInput = document.getElementById("photoFile");
      if (fileInput) {
        fileInput.value = "";
      }

      fetchPhotos();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.detail || "Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await API.delete(`/photos/${photoId}`);
      setMessage("Photo deleted successfully");
      fetchPhotos();
    } catch (error) {
      console.log(error);
      setMessage("Failed to delete photo");
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
          <Link to="/labor">Labor</Link>
          <Link to="/materials">Materials</Link>
          <Link className="active" to="/site-photos">Site Photos</Link>
          <Link to="/pdf-reports">PDF Reports</Link>
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Site Photos</h1>
            <p>Upload and manage construction site photos for daily reports</p>
          </div>

          <div className="user-chip">
            <span>{user.role}</span>
          </div>
        </header>

        <section className="photo-layout">
          <div className="photo-form-card">
            <h2>Upload Site Photo</h2>

            {message && <div className="info-box">{message}</div>}

            <form onSubmit={handleUploadPhoto} className="project-form">
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

              <label>Photo Caption</label>
              <input
                type="text"
                name="caption"
                placeholder="Example: Second floor brickwork progress"
                value={formData.caption}
                onChange={handleChange}
              />

              <label>Choose Image</label>
              <input
                id="photoFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />

              {preview && (
                <div className="photo-preview">
                  <img src={preview} alt="Preview" />
                </div>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload Photo"}
              </button>
            </form>
          </div>

          <div className="photo-list-card">
            <h2>Uploaded Site Photos</h2>

            {photos.length === 0 ? (
              <p className="empty-text">No site photos uploaded yet.</p>
            ) : (
              <div className="photo-grid">
                {photos.map((photo) => (
                  <div className="photo-card" key={photo.id}>
                    <img
                      src={`${API_BASE_URL}${photo.photoUrl}`}
                      alt={photo.caption || "Site photo"}
                    />

                    <div className="photo-card-content">
                      <h3>{getReportLabel(photo.reportId)}</h3>
                      <p>{photo.caption || "No caption"}</p>

                      <button
                        className="delete-photo-btn"
                        onClick={() => handleDeletePhoto(photo.id)}
                      >
                        Delete Photo
                      </button>
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

export default SitePhotos;