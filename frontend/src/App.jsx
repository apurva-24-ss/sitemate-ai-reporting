import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import DailyReports from "./pages/DailyReports";
import Labor from "./pages/Labor";
import Materials from "./pages/Materials";
import PDFReports from "./pages/PDFReports";
import SitePhotos from "./pages/SitePhotos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/daily-reports" element={<DailyReports />} />
        <Route path="/labor" element={<Labor />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/site-photos" element={<SitePhotos />} />
        <Route path="/pdf-reports" element={<PDFReports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;