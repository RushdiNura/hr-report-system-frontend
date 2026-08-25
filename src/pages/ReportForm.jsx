import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import toast from "react-hot-toast";
import { createReport } from "../api/reportApi";
import Spinner from "../components/Spinner";
import mammoth from "mammoth";
import { ChevronDown } from "lucide-react";
import API from "../api/axios";
import "../styles/report.css";


const emptyRow = {
  sector: "",
  service: "",
  peopleServed: "",
  employee: "",
  date: "",
  remark: "",
};

const SECTOR_OPTIONS = [
  { value: "Qonnaa", label: "Qonnaa" },
  { value: "Barnoota", label: "Barnoota" },
  { value: "Fayyaa", label: "Fayyaa" },
  { value: "Bishaan", label: "Bishaan" },
  { value: "Daandii", label: "Daandii" },
  { value: "Elektirikii", label: "Elektirikii" },
  { value: "Daldala", label: "Daldala" },
  { value: "Faayinaansi", label: "Faayinaansi" },
  { value: "Dargaggoota", label: "Dargaggoota" },
  { value: "Dubartoota", label: "Dubartoota" },
  { value: "Nageenya", label: "Nageenya" },
  { value: "Bulchiinsa", label: "Bulchiinsa" },
];

export default function ReportForm() {
  const [services, setServices] = useState(
    Array.from({ length: 5 }, () => ({ ...emptyRow })),
  );
  const [extractedTotal, setExtractedTotal] = useState(null);
  const [extractedPeopleCounts, setExtractedPeopleCounts] = useState([]);
  const [coordinatorName, setCoordinatorName] = useState("");
  const [coordinatorDate, setCoordinatorDate] = useState("");
  const [signature, setSignature] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [foddaaNumber, setFoddaaNumber] = useState("");
  const [employees, setEmployees] = useState([]);
  const sigRef = useRef(null);
  
  useEffect(() => {
    const headName = localStorage.getItem("name");
    if (headName) {
      setCoordinatorName(headName);
    }
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await API.get("/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to load employees");
      }
    };

    fetchEmployees();
  }, []);

  // Get user's foddaa from localStorage and extract just the number
  useEffect(() => {
    const foddaa = localStorage.getItem("qindeessaa");
    if (foddaa) {
      const number = foddaa.replace("foddaa", "");
      setFoddaaNumber(number);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (coordinatorName || services[0].sector) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [coordinatorName, services]);

  const extractBaayyinaValues = async (file) => {
    setParsingFile(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      const baayyinaPattern = /Baayyina[:\s]*(\d+)/gi;
      const matches = [...text.matchAll(baayyinaPattern)];

      let extractedNumbers = [];

      if (matches.length > 0) {
        extractedNumbers = matches.map((m) => parseInt(m[1], 10));
      } else {
        const lines = text.split("\n");

        for (const line of lines) {
          const cells = line.split("\t");
          if (cells.length >= 5) {
            const possibleNumber = parseInt(cells[4]?.trim(), 10);
            if (
              !isNaN(possibleNumber) &&
              possibleNumber > 0 &&
              possibleNumber < 1000
            ) {
              extractedNumbers.push(possibleNumber);
            }
          }
        }

        if (extractedNumbers.length === 0) {
          const allNumbers = text.match(/\b(\d+)\b/g) || [];
          extractedNumbers = allNumbers
            .map((num) => parseInt(num, 10))
            .filter(
              (num) =>
                num > 0 && num < 1000 && num !== new Date().getFullYear(),
            );
        }
      }

      const total = extractedNumbers.reduce((sum, num) => sum + num, 0);

      setExtractedPeopleCounts(extractedNumbers);
      setExtractedTotal(total);

      if (extractedNumbers.length > 0) {
        toast.success(
          `Found ${extractedNumbers.length} entries, total: ${total} people`,
        );
      } else {
        toast("Could not find Baayyina values in the file", { icon: "⚠️" });
      }
    } catch (error) {
      console.error("Error parsing DOCX:", error);
      toast.error("Failed to parse the DOCX file");
      setExtractedTotal(null);
      setExtractedPeopleCounts([]);
    } finally {
      setParsingFile(false);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;
    const isLastRow = index === services.length - 1;
    const rowHasData = Object.values(updated[index]).some((v) => v !== "");
    if (isLastRow && rowHasData) {
      updated.push({ ...emptyRow });
    }
    setServices(updated);
  };

  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      await extractBaayyinaValues(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const role = localStorage.getItem("role")?.trim().toLowerCase();
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("coordinatorName", coordinatorName);
      formData.append("coordinatorDate", coordinatorDate);
      formData.append("signature", signature);

      if (uploadedFile) {
        formData.append("uploadedFile", uploadedFile);

        if (extractedTotal !== null) {
          formData.append("extractedTotal", extractedTotal);
          formData.append(
            "extractedPeopleCounts",
            JSON.stringify(extractedPeopleCounts),
          );
        }

        formData.append("services", JSON.stringify([]));
      } else {
        const filtered = services.filter((s) =>
          Object.values(s).some((v) => v !== ""),
        );
        if (filtered.length === 0) {
          toast.error("Maaloo odeeffannoo gabaasaa guutaa!");
          setLoading(false);
          return;
        }

        const servicesForDocx = filtered.map((service) => ({
          sector: service.sector,
          service: service.service,
          resource: foddaaNumber || "1",
          peopleServed: service.peopleServed,
          employee: service.employee,
          date: service.date,
          remark: service.remark,
        }));

        formData.append("services", JSON.stringify(servicesForDocx));
      }

      await createReport(formData);
      toast.success("Gabaasni milkaa'inaan ergameera!");

    
      setServices(Array.from({ length: 5 }, () => ({ ...emptyRow })));
      setCoordinatorName(localStorage.getItem("name") || "");
      setCoordinatorDate("");
      setSignature("");
      setUploadedFile(null);
      setExtractedTotal(null);
      setExtractedPeopleCounts([]);
      sigRef.current?.clear();
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Full error:", error);

      if (error.response?.status === 401) {
        toast.error("Authentication failed. Please login as Head user.");
      } else if (error.response?.status === 403) {
        toast.error("Access denied. Head role required.");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Dogoggora: Gabaasa erguu hin dandeenye.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="report-container">
      <h2 className="form-title">Formaatii Gabaasaa</h2>

      <div className="upload-box">
        <div className="upload-icon">📄</div>
        <div className="upload-content">
          <h3>Gabaasa Fayyadamu (DOCX)</h3>
          <p>Gabaasa Wordi kanaan dura qabdan fayyadamaa</p>
        </div>
        <input
          id="fileUpload"
          type="file"
          accept=".docx"
          onChange={handleFileChange}
          hidden
        />
        <label htmlFor="fileUpload" className="secondary-btn">
          {uploadedFile ? "Faayila Jijjiri" : "Faayila Filadhu"}
        </label>
        {uploadedFile && (
          <div className="file-info">
            <span>✅ {uploadedFile.name}</span>
            {parsingFile && <Spinner size={16} />}
            {extractedTotal !== null && !parsingFile && (
              <span className="extracted-badge">
                📊 Baay'ina waliigala: <strong>{extractedTotal}</strong>
                {extractedPeopleCounts.length > 0 && (
                  <span className="extracted-detail">
                    ({extractedPeopleCounts.join(" + ")})
                  </span>
                )}
              </span>
            )}
          </div>
        )}
      </div>

   
      {!uploadedFile && (
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>Lakk</th>
                <th>Seektara</th>
                <th>Tajaajila</th>
                <th>Foddaa</th>
                <th style={{ width: "80px" }}>Baayyina</th>
                <th>Hojjetaa</th>
                <th>Guyyaa</th>
                <th>Ibsa</th>
              </tr>
            </thead>
            <tbody>
              {services.map((row, i) => (
                <tr key={i}>
                  <td className="row-number">{i + 1}</td>

                
                  <td>
                    <div className="select-wrapper">
                      <select
                        value={row.sector}
                        onChange={(e) =>
                          handleChange(i, "sector", e.target.value)
                        }
                        className="sector-select"
                      >
                        <option value="">Seektara Filadhu</option>
                        {SECTOR_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="select-icon" size={16} />
                    </div>
                  </td>

              
                  <td>
                    <input
                      value={row.service}
                      onChange={(e) =>
                        handleChange(i, "service", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <div className="foddaa-display">{foddaaNumber || "1"}</div>
                  </td>

                  <td>
                    <input
                      type="number"
                      value={row.peopleServed}
                      onChange={(e) =>
                        handleChange(i, "peopleServed", e.target.value)
                      }
                      min="0"
                    />
                  </td>

                
                  <td>
                    <div className="select-wrapper">
                      <select
                        value={row.employee}
                        onChange={(e) =>
                          handleChange(i, "employee", e.target.value)
                        }
                        className="employee-select"
                      >
                        <option value="">Hojjataa Filadhu</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp.name}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="select-icon" size={16} />
                    </div>
                  </td>

                  <td>
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => handleChange(i, "date", e.target.value)}
                    />
                  </td>

          
                  <td>
                    <input
                      value={row.remark}
                      onChange={(e) =>
                        handleChange(i, "remark", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="footer-fields">
        <div className="input-group">
          <label htmlFor="coordinator-name">Maqaa Qindeessaa</label>
          <input
            id="coordinator-name"
            value={coordinatorName}
            onChange={(e) => setCoordinatorName(e.target.value)}
            required
            className="coordinator-field"
          />
          <small className="field-hint">Auto-filled with your name</small>
        </div>

        <div className="input-group">
          <label htmlFor="coordinator-date">Guyyaa</label>
          <input
            id="coordinator-date"
            type="date"
            value={coordinatorDate}
            onChange={(e) => setCoordinatorDate(e.target.value)}
            required
          />
        </div>

        <div className="input-group signature-group">
          <label id="signature-label">Mallattoo</label>
          <div className="signature-box" role="group" aria-labelledby="signature-label">
            <SignatureCanvas
              ref={sigRef}
              penColor="black"
              canvasProps={{ className: "sigCanvas" }}
              onEnd={() => setSignature(sigRef.current.toDataURL("image/png"))}
            />
            <button
              type="button"
              className="clear-btn"
              onClick={() => {
                sigRef.current.clear();
                setSignature("");
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="submit-btn"
        disabled={loading || parsingFile}
      >
        {loading ? <Spinner size={18} /> : "Gabaasa Ergi"}
      </button>
    </form>
  );
}
