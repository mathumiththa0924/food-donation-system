import API from "./axios";

export const createDonation = async (data) => {
  const response = await API.post("/donations", data);
  return response.data;
};

export const getDonations = async (params) => {
  const response = await API.get("/donations", { params });
  return response.data;
};