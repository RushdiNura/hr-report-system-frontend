import { useState, useEffect } from "react";
import { getReports, getStats } from "../api/reportApi";

export function useReports() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [reportsRes, statsRes] = await Promise.all([
        getReports(),
        getStats(),
      ]);
      setReports(reportsRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    stats,
    loading,
    error,
    refetch: fetchReports,
  };
}
