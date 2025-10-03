  import axiosInstance from "../axiosInstance/axiosInstance";


  // ---------- ESI Rules ----------
  export const getESIRules = () => axiosInstance.get("/ESIRule");
  export const getESIRuleById = (id) => axiosInstance.get(`/ESIRule/${id}`);
  export const createESIRule = (data) => axiosInstance.post("/ESIRule", data);

  // ---------- Employee ESI Details ----------
  export const getEmployeeESIDetails = () => axiosInstance.get("/EmployeeESIDetails");
  export const getEmployeeESIDetailById = (id) => axiosInstance.get(`/EmployeeESIDetails/${id}`);
  export const saveEmployeeESIDetail = (data) => axiosInstance.post("/EmployeeESIDetails", data);

  // ---------- ESI Contribution ----------
  export const getAllESITransactions = () => {
    return axiosInstance.get("/ESIContributionTransaction/all");
  };    
  export const getESITransactionById = (id) => axiosInstance.get(`/ESIContributionTransaction/${id}`);
  export const createESITransaction = (data) => {
    return axiosInstance.post("/ESIContributionTransaction", data);
  };
  export const exportESITransactions = (month, year) =>
    axiosInstance.get(`/ESIContributionTransaction/export`, {
      params: { month, year },
      responseType: "blob",
    });

  // ---------- Fetch Employee   And ESIRUles -------------
  export const getAllEmployees = ()=> axiosInstance.get("/Employee");
  export const getAllESIRules = ()=> axiosInstance.get("/ESIRule");

