import { useEffect, useState } from "react";

const useDelay = (time: number) => {
  if (time <= 0) return true;

  const [ready, setReady] = useState<boolean>(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, time);
    return () => clearTimeout(timer);
  }, []);

  return ready;
};

export default useDelay;