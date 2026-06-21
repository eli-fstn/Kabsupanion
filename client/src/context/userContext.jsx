import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/auth";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await getMe();
      setStudent(data);
    } catch (error) {
      console.log(error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <UserContext.Provider value={{ student, setStudent, loading, refetchUser: fetchMe }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}