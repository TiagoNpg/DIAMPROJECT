import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter } from "react-router-dom";
import SiteRoutes from "./SiteRoutes";
import UserProvider from "./UserProvider";
import Header from "./Header";
function Home() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Header />
        <SiteRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}
export default Home;
