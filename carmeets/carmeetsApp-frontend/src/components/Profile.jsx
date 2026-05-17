import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();
  const API_BASE = "http://localhost:8000/carmeetsApp/api";

  // Get current authenticated user (from user_view endpoint)
  useEffect(() => {
    axios
      .get(`${API_BASE}/user/current/`, { withCredentials: true })
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

  const handleUpload = (e) => {
    e.preventDefault();
    if (!image || !user) {
      console.error("No image or user selected");
      return;
    }

    const formData = new FormData();
    formData.append("photo", image);

    axios
      .put(`${API_BASE}/users/${user.id}/`, formData, {
        headers: {
          "X-CSRFToken": getCSRFToken(),
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })
      .then(() => {
        setUser({ ...user, photo: URL.createObjectURL(image) });
        setImage(null);
        setPreviewUrl("");
        alert("Profile updated successfully");
      })
      .catch((err) => console.error("Failed to update profile:", err));
  };

  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
    <>
      <div>
        <h2>O meu perfil</h2>
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p>
        <p>Profile: {user.profile}</p>
        {user.photo && (
          <img
            src={
              user.photo.startsWith("http")
                ? user.photo
                : `http://localhost:8000${user.photo}`
            }
            alt="Profile"
            height="150"
          />
        )}
        <br />
        <button onClick={() => navigate("/")}>Voltar</button>
      </div>
      <div>
        <h3>Carregar imagem de perfil</h3>
        <input type="file" onChange={handleImageSelection} accept="image/*" />
        <button onClick={handleUpload}>Upload</button>
        <br />
        {previewUrl && <img src={previewUrl} alt="Preview" height="100" />}
      </div>
    </>
  );
};
export default Profile;
