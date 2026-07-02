import axios from "axios";

const API_URL = "http://localhost:5000/api/money-requests";

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const createMoneyRequest = async (formData) => {
  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  };
  const response = await axios.post(API_URL, formData, config);
  return response.data;
};

export const getMoneyRequests = async () => {
  const response = await axios.get(API_URL, getConfig());
  return response.data;
};

export const updateMoneyRequestStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/${id}/status`, { status }, getConfig());
  return response.data;
};

export const deleteMoneyRequest = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getConfig());
  return response.data;
};
