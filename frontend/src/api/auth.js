import API from "./axios";

export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await API.post("/auth/login", data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await API.post("/auth/reset-password", data);
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await API.put("/auth/profile", data);
  return response.data;
};

export const updateDonationSettings = async (data) => {
  const response = await API.put("/auth/donation-settings", data, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const verifyAuth = async () => {
  const response = await API.get("/auth/verify");
  return response.data;
};