import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Materials() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    reportId: "",
    materialName: "Cement",
    unit: "Bags",
    openingStock: "",
    receivedToday: "",
    quantityUsed: "",
    closingStock: "",
    remarks: "",
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

  const fetchMaterials = async () => {
    try {
      const response = await API.get("/materials/");
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.log(error);
      setMessage("Failed to load material entries");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchProjects();
    fetchReports();
    fetchMaterials();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedForm = {
      ...formData,
      [name]: value,
    };

    const openingStock = Number(
      name === "openingStock" ? value : updatedForm.openingStock
    );
    const receivedToday = Number(
      name === "receivedToday" ? value : updatedForm.receivedToday
    );
    const quantityUsed = Number(
      name === "quantityUsed" ? value : updatedForm.quantityUsed
    );

    if (
      name === "openingStock" ||
      name === "receivedToday" ||
      name === "quantityUsed"
    ) {
      updatedForm.closingStock = openingStock + receivedToday - quantityUsed;
    }

    setFormData(updatedForm);
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

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await API.post("/materials/", {
        ...formData,
        openingStock: Number(formData.openingStock),
        receivedToday: Number(formData.receivedToday),
        quantityUsed: Number(formData.quantityUsed),
        closingStock: Number(formData.closingStock),
      });

      setMessage("Material entry created successfully");

      setFormData({
        reportId: "",
        materialName: "Cement",
        unit: "Bags",
        openingStock: "",
        receivedToday: "",
        quantityUsed: "",
        closingStock: "",
        remarks: "",
      });

      fetchMaterials();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.detail || "Failed to create material entry");
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
          <Link to="/labor">Labor</Link>
          <Link className="active" to="/materials">Materials</Link>
          <Link to="/pdf-reports">PDF Reports</Link>
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Materials Management</h1>
            <p>Add and track daily construction material usage</p>
          </div>

          <div className="user-chip">
            <span>{user.role}</span>
          </div>
        </header>

        <section className="material-layout">
          <div className="material-form-card">
            <h2>Add Material Entry</h2>

            {message && <div className="info-box">{message}</div>}

            <form onSubmit={handleCreateMaterial} className="project-form">
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

              <div className="two-column">
                <div>
                  <label>Material Name</label>
                  <select
                    name="materialName"
                    value={formData.materialName}
                    onChange={handleChange}
                    required
                  >
                    <option value="Cement">Cement</option>
                    <option value="Steel">Steel</option>
                    <option value="Sand">Sand</option>
                    <option value="Aggregate">Aggregate</option>
                    <option value="Bricks">Bricks</option>
                    <option value="Concrete">Concrete</option>
                    <option value="Wood">Wood</option>
                    <option value="Paint">Paint</option>
                    <option value="Tiles">Tiles</option>
                    <option value="Pipes">Pipes</option>
                  </select>
                </div>

                <div>
                  <label>Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                  >
                    <option value="Bags">Bags</option>
                    <option value="Kg">Kg</option>
                    <option value="Tons">Tons</option>
                    <option value="Brass">Brass</option>
                    <option value="Nos">Nos</option>
                    <option value="Cubic Meter">Cubic Meter</option>
                    <option value="Liters">Liters</option>
                    <option value="Sqft">Sqft</option>
                  </select>
                </div>
              </div>

              <div className="two-column">
                <div>
                  <label>Opening Stock</label>
                  <input
                    type="number"
                    name="openingStock"
                    placeholder="100"
                    value={formData.openingStock}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>Received Today</label>
                  <input
                    type="number"
                    name="receivedToday"
                    placeholder="50"
                    value={formData.receivedToday}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="two-column">
                <div>
                  <label>Quantity Used</label>
                  <input
                    type="number"
                    name="quantityUsed"
                    placeholder="20"
                    value={formData.quantityUsed}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>Closing Stock</label>
                  <input
                    type="number"
                    name="closingStock"
                    placeholder="Auto calculated"
                    value={formData.closingStock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <label>Remarks</label>
              <textarea
                name="remarks"
                placeholder="Example: Cement stock is sufficient"
                value={formData.remarks}
                onChange={handleChange}
              />

              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Add Material Entry"}
              </button>
            </form>
          </div>

          <div className="material-list-card">
            <h2>Material Entries</h2>

            {materials.length === 0 ? (
              <p className="empty-text">No material entries added yet.</p>
            ) : (
              <div className="material-list">
                {materials.map((material) => (
                  <div className="material-card" key={material.id}>
                    <div className="material-card-header">
                      <div>
                        <h3>{material.materialName}</h3>
                        <p>{getReportLabel(material.reportId)}</p>
                      </div>

                      <span className="status-badge">
                        {material.closingStock} {material.unit}
                      </span>
                    </div>

                    <div className="material-details-grid">
                      <p><strong>Opening:</strong> {material.openingStock} {material.unit}</p>
                      <p><strong>Received:</strong> {material.receivedToday} {material.unit}</p>
                      <p><strong>Used:</strong> {material.quantityUsed} {material.unit}</p>
                      <p><strong>Closing:</strong> {material.closingStock} {material.unit}</p>
                    </div>

                    {material.remarks && (
                      <div className="report-section">
                        <strong>Remarks:</strong>
                        <p>{material.remarks}</p>
                      </div>
                    )}
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

export default Materials;