import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

const PROFILE_ENDPOINT = "http://localhost:8000/carmeetsApp/api/user/";

// eslint-disable-next-line react-refresh/only-export-components
export const useUserContext = () => useContext(UserContext);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await fetch(PROFILE_ENDPOINT, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setUser(null);
        }
      }
    }

    loadUser();
    return () => controller.abort();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
export default UserProvider;
