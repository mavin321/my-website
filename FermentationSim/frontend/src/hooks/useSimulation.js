import { useState, useCallback } from "react";
import { runSimulation } from "../api/client.js";

export function useSimulation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const simulate = useCallback(async (payload, mode = "batch") => {
    try {
      setLoading(true);
      setError(null);
      const data = await runSimulation(payload, mode);
      setResult(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, result, simulate };
}
