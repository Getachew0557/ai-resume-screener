import axios from "axios";

const BASE_URL = "http://127.0.0.1:3005/api/departments";

/* ===================== CREATE ===================== */
export const createDepartment = (data) => {
  return axios.post(`${BASE_URL}/`, data);
};


export const getDepartments = () => {
  return axios.get(`${BASE_URL}/`);
};

/* ===================== GET CHILD DEPARTMENTS ===================== */
export const getChildDepartments = (departmentId) => {
  return axios.get(`${BASE_URL}/${departmentId}/children`);
};

/* ===================== GET PARENT DEPARTMENTS ===================== */
export const getParentDepartments = (departmentId) => {
  return axios.get(`${BASE_URL}/${departmentId}/parents`);
};

/* ===================== UPDATE ===================== */
export const updateDepartment = (departmentId, data) => {
  return axios.put(`${BASE_URL}/${departmentId}`, data);
};

/* ===================== DELETE ===================== */
export const deleteDepartment = (departmentId) => {
  return axios.delete(`${BASE_URL}/${departmentId}`);
};
