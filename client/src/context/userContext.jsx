import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/auth";
import LoadingScreen from "../components/ui/LoadingScreen";
import { clearApiCache } from "../utils/clearApiCache.js";
import posthog from "posthog-js";

const isPostHogConfigured = Boolean(
  import.meta.env.VITE_POSTHOG_KEY && import.meta.env.VITE_POSTHOG_HOST
);

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
      const user = data?.user;

      if (isPostHogConfigured && user?.id) {
        posthog.identify(String(user.id), {
          email: user.email,
          name: user.name,
          role: user.role,
        });
      }

      setStudent(data);
    } catch (error) {
      if (!error.response) {
        setTimeout(fetchMe, 1000);
        return;
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        if (isPostHogConfigured) posthog.reset();
        await clearApiCache();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <UserContext.Provider value={{ student, setStudent, loading, refetchUser: fetchMe }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}