import { useEffect, useState } from "react";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 21 || hour <= 4) {
    return "Late at night";
  } else if (hour >= 5 && hour <= 11) {
    return "Good morning";
  } else if (hour >= 12 && hour <= 16) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};

export const useGreeting = () => {
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return greeting;
};