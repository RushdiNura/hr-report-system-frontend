import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReports, getStats } from "../api/reportApi";
import StatsCards from "../components/StatsCards";
import ReportsTable from "../components/ReportsTable";
import Spinner from "../components/Spinner";
import { Search, Filter, Inbox } from "lucide-react";
import { connectSocket, disconnectSocket } from "../services/socket";
import toast from "react-hot-toast";
import "../styles/dashboard.css";

export default function HRDashboard() {
  const [stats, setStats] = useState({});
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        getStats(),
        getReports({ page: 1, limit: 50 }),
      ]);
      setStats(statsRes.data);
      setReports(reportsRes.data.data);
      setPagination(reportsRes.data.pagination);
      setLoading(false);
    } catch (e) {
      console.error("Error loading data:", e);
      setLoading(false);
      if (e.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    }
  };

  const loadMore = async () => {
    if (loadingMore || pagination.page >= pagination.totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const reportsRes = await getReports({ page: nextPage, limit: 50 });
      setReports((prev) => [...prev, ...reportsRes.data.data]);
      setPagination(reportsRes.data.pagination);
    } catch (e) {
      console.error("Error loading more reports:", e);
      toast.error("Couldn't load more reports. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadData();

    // Connect to socket
    const socket = connectSocket();

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("✅ Connected to real-time server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("❌ Disconnected from real-time server");
    });

    // Handle new report
    socket.on("newReport", (newReport) => {
      console.log("📢 New report received:", newReport);
      setReports((prevReports) => [newReport, ...prevReports]);

      // Show notification
      toast.success(`📄 New report from ${newReport.coordinatorName}`, {
        duration: 4000,
        position: "top-right",
      });
    });

    // Handle stats update
    socket.on("statsUpdated", (newStats) => {
      console.log("📊 Stats updated:", newStats);
      setStats(newStats);
    });

    // Cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("newReport");
      socket.off("statsUpdated");
      disconnectSocket();
    };
  }, [navigate]);

  useEffect(() => {
    const handleSearch = (event) => {
      const value =
        typeof event.detail === "string"
          ? event.detail
          : event.detail?.searchTerm;
      setSearchTerm(value?.toLowerCase() || "");
    };

    window.addEventListener("search-reports", handleSearch);
    return () => window.removeEventListener("search-reports", handleSearch);
  }, []);

  const filteredReports = reports.filter((report) => {
    if (!searchTerm) return true;
    return (
      report.coordinatorName?.toLowerCase().includes(searchTerm) ||
      report.qindeessaa?.toLowerCase().includes(searchTerm) ||
      report.services?.some((s) => s.sector?.toLowerCase().includes(searchTerm))
    );
  });

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="dashboard-fade-in">
      {isConnected && (
        <div className="connection-status">
          <span className="status-dot"></span>
          <span>Live Updates</span>
        </div>
      )}

      <StatsCards stats={stats} />

      <div className="content-card">
        <div className="card-header">
          <div className="header-info">
            <h3>All Submissions</h3>
            <p>Monitor real-time operational updates</p>
          </div>
          <span className="count-badge">
            {searchTerm
              ? `${filteredReports.length} match${filteredReports.length !== 1 ? "es" : ""}`
              : `${reports.length} of ${pagination.total} report${pagination.total !== 1 ? "s" : ""}`}
          </span>
        </div>

        {filteredReports.length > 0 ? (
          <>
            <ReportsTable reports={filteredReports} />
            {!searchTerm && pagination.page < pagination.totalPages && (
              <div className="load-more-wrapper">
                <button
                  type="button"
                  className="load-more-btn"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore
                    ? "Loading..."
                    : `Load more (${reports.length} of ${pagination.total})`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              {searchTerm ? <Search size={48} /> : <Inbox size={48} />}
            </div>
            <h3 className="empty-state-title">
              {searchTerm ? "No matches found" : "No reports yet"}
            </h3>
            <p className="empty-state-description">
              {searchTerm
                ? `We couldn't find any reports matching "${searchTerm}"`
                : "Reports will appear here once they are submitted"}
            </p>
            {searchTerm && (
              <div className="empty-state-hint">
                <Filter size={14} />
                <span>Try adjusting your search terms</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}