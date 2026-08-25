import API from "./axios";

export const createReport = (data) => {

  return API.post("/reports", data);
};

export const getReports = (params = {}) => API.get("/reports", { params });
export const getStats = () => API.get("/reports/stats");

