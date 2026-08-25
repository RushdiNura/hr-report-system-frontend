import { Download } from "lucide-react";
import toast from "react-hot-toast";
import "../styles/table.css";

export default function ReportsTable({ reports }) {
  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Calculate total people served for a report
  const calculateTotalPeopleServed = (services, extractedTotal) => {
    // If it's a file upload with extracted total, use that
    if (extractedTotal !== undefined && extractedTotal !== null) {
      return extractedTotal;
    }

    // Otherwise calculate from services array
    if (!services || !Array.isArray(services)) return 0;

    return services.reduce((total, service) => {
      const peopleServed = parseInt(service.peopleServed) || 0;
      return total + peopleServed;
    }, 0);
  };

const handleDownload = async (fileUrl, filename) => {
  try {
    const token = localStorage.getItem("token");

    // Ensure filename has .docx extension
    if (!filename.toLowerCase().endsWith(".docx")) {
      filename = filename + ".docx";
    }

    const response = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();

    // Verify it's a docx file
    if (
      blob.type &&
      !blob.type.includes("openxmlformats") &&
      !blob.type.includes("octet-stream")
    ) {
      console.warn("Unexpected file type:", blob.type);
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);

    toast.success(`Downloading started`);
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to download file");
  }
  // };
  //   return (
  //     <div className="table-container">
};

// The "Foddaa" column header already says what it is — showing the raw
// value ("foddaa5") is redundant, so just show the number.
const formatFoddaa = (value) => {
  if (!value) return "N/A";
  const number = value.replace(/^foddaa/i, "");
  return number || value;
};

return (
  <div className="table-container">
    <table className="reports-table">
      <thead>
        <tr>
          <th>Qindeessaa</th>
          <th>Foddaa</th>
          <th>Guyyaa</th>
          <th>Baay'ina Namoota</th>
          <th>Faayila</th>
        </tr>
      </thead>

      <tbody>
        {reports.length === 0 ? (
          <tr>
            <td colSpan="5" className="empty-state">
              No reports available
            </td>
          </tr>
        ) : (
          reports.map((r) => {
            // Pass both services and extractedTotal to the calculation function
            const totalPeople = calculateTotalPeopleServed(
              r.services,
              r.extractedTotal,
            );

            return (
              <tr key={r._id}>
                <td className="coordinator-cell">
                  <div className="coordinator-name">{r.coordinatorName}</div>
                </td>

                <td>
                  <span className="badge-fooddaa">
                    {formatFoddaa(r.qindeessaa)}
                  </span>
                  {/* <span className="badge-fooddaa">{r.qindeessaa || "N/A"}</span> */}
                </td>

                <td className="date-cell">{formatDate(r.coordinatorDate)}</td>

                <td className="text-center">
                  <span className="people-count-badge">
                    {totalPeople > 0 ? (
                      totalPeople
                    ) : (
                      <span className="no-file">—</span>
                    )}
                    {r.extractedTotal && (
                      <span
                        className="extracted-indicator"
                        title="Extracted from uploaded file"
                      >
                        📄
                      </span>
                    )}
                  </span>
                </td>

                <td>
                  {r.generatedFileUrl ? (
                    <button
                      onClick={() => {
                        // Use the original filename from the database
                        const filename =
                          r.generatedFileName || `gabaasa-${r._id}.docx`;
                        handleDownload(r.generatedFileUrl, filename);
                      }}
                      className="icon-btn"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                  ) : (
                    <span className="no-file">—</span>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);
}

