import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Image,Col } from "react-bootstrap";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();
  const API_BASE = "http://localhost:8000/carmeetsApp/api";

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return "";
    return photoPath.startsWith("http") ? photoPath : `http://localhost:8000${photoPath}`;
  };

  // Get current authenticated user (from user_view endpoint)
  useEffect(() => {
    axios
      .get(`${API_BASE}/user/`, { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("Failed to get user:", err);
        navigate("/login");
      });
  }, [navigate]);

  const handleImageSelection = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      setImage(selectedImage);
      setPreviewUrl(URL.createObjectURL(selectedImage));
    } else {
      setImage(null);
      setPreviewUrl("");
    }
  };

  const getCSRFToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  };

  const handleLogout = () => {
    axios
      .get(`${API_BASE}/logout/`, { withCredentials: true }) // Logout endpoint
      .then(() => {
        setUser(null); // Clear user state on successful logout
        navigate("/login"); // Redirect to login page after logout
      })
      .catch((err) => console.error("Logout failed:", err));
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!image || !user) {
      console.error("No image or user selected");
      return;
    }

    const formData = new FormData();
    formData.append("photo", image);

    axios
      .put(`${API_BASE}/user/`, formData, {
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
        withCredentials: true,
      })
      .then(() => {
        setUser({ ...user, photo: URL.createObjectURL(image) });
        setImage(null);
        setPreviewUrl("");
        window.location.reload(false);
        alert("Profile updated successfully");
      })
      .catch((err) => console.error("Failed to update profile:", err));
  };

  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Col xs={12} style={{ display: "flex", flexDirection: "column", alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #aa3bff)', padding: '1.25rem 0' }}>
            <Image src={getPhotoUrl(user.photo)} roundedCircle className="profile-avatar" />
        </Col>
        <div className="profile-card__body">
          <h2 className="profile-title">My Profile</h2>
          <div className="profile-info">
            <div className="profile-field">
              <span className="profile-field-label">Username</span>
              <span className="profile-field-value">{user.username}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Email</span>
              <span className="profile-field-value">{user.email}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Profile</span>
              <span className="profile-field-value">{user.profile}</span>
            </div>
          </div>
          <div className="profile-actions">
            <button
              className="profile-btn profile-btn-secondary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="profile-upload">
        <h3 className="profile-upload-title">Upload Profile Image</h3>
        <input
          type="file"
          onChange={handleImageSelection}
          accept="image/*"
          className="profile-input"
        />
        <button className="profile-btn" onClick={handleUpload}>
          Upload
        </button>
        {previewUrl && (
          <div className="profile-preview">
            <img src={previewUrl} alt="Preview" className="profile-preview-img" />
          </div>
        )}
      </div>
    </div>
  );
};
export default Profile;
