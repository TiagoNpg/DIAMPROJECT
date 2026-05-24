import { useUserContext } from "./UserProvider";
import { Route, Routes } from "react-router-dom";
import MainPage from "./MainPage.jsx";
import Profile from "./Profile";
import Signup from "./Signup";
import Login from "./Login";
import EventPage from "./EventPage";
import AdminDashboard from "./AdminDashboard";

function SiteRoutes() {
  const { user } = useUserContext();
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/events/:eventId" element={<EventPage />} />
      <Route path="/profile" element={user ? <Profile /> : <Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/admin" 
        element={user && user.profile === 'admin' ? <AdminDashboard /> : <Login />} 
      />
    </Routes>
  );
}
export default SiteRoutes;
