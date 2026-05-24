import { useUserContext } from "./UserProvider";
import { Route, Routes } from "react-router-dom";
import MainPage from "./MainPage.jsx";
import Profile from "./Profile";
import Signup from "./Signup";
import Login from "./Login";
import EventPage from "./EventPage";
import CreateMeeting from "./CreateMeeting";

function SiteRoutes() {
  const { user } = useUserContext();
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/events/:eventId" element={<EventPage />} />
      <Route path="/create-meeting" element={user ? <CreateMeeting /> : <Login />} />
      <Route path="/profile" element={user ? <Profile /> : <Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
export default SiteRoutes;
