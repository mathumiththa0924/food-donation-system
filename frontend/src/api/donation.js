import API from "./axios";

export const createDonation = async (data) => {
  const response = await API.post("/donations", data);
  return response.data;
};

export const getDonations = async (params) => {
  const response = await API.get("/donations", { params });
  return response.data;
};

export const getAllDonations = async () => {
  const response = await API.get("/donations/all");
  return response.data;
};

export const updateDonationStatus = async (id, approvalStatus) => {
  const response = await API.patch(`/donations/${id}/status`, { approvalStatus });
  return response.data;
};

export const deleteDonation = async (id) => {
  const response = await API.delete(`/donations/${id}`);
  return response.data;
};