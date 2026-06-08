import { useState, useEffect, useCallback } from 'react';

export function useToast(timeout = 4000) {
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (error || msg) {
      const timer = setTimeout(() => {
        setError("");
        setMsg("");
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [error, msg, timeout]);

  const clearToast = useCallback(() => {
    setError("");
    setMsg("");
  }, []);

  return { error, setError, msg, setMsg, clearToast };
}
