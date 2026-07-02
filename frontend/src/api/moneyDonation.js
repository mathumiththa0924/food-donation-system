import API from "./axios";

export const createMoneyDonation = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
  const response = await API.post("/money-donations", data, config);
  return response.data;
};

export const confirmPendingDonation = async (id) => {
  const response = await API.put(`/money-donations/${id}/confirm-pending`);
  return response.data;
};

export const cancelPendingDonation = async (id) => {
  const response = await API.put(`/money-donations/${id}/cancel-pending`);
  return response.data;
};

export const confirmHandoverDonation = async (id) => {
  const response = await API.put(`/money-donations/${id}/confirm-handover`);
  return response.data;
};

export const cancelHandoverDonation = async (id) => {
  const response = await API.put(`/money-donations/${id}/cancel-handover`);
  return response.data;
};

export const addMoneyDonationFeedback = async (id, rating, comment) => {
  const response = await API.put(`/money-donations/${id}/feedback`, { rating, comment });
  return response.data;
};

export const deleteMoneyDonation = async (id) => {
  const response = await API.delete(`/money-donations/${id}`);
  return response.data;
};

export const getNgoMoneyDonations = async () => {
  const response = await API.get(`/money-donations/ngo`);
  return response.data;
};

export const getAllMoneyDonations = async () => {
  const response = await API.get("/money-donations");
  return response.data;
};

export const METHOD_LABELS = {
  online: "Online Card",
  bank_transfer: "Bank Transfer",
  cash_handover: "Cash Hand Over",
  handover: "Cash Hand Over",
  qr_payment: "QR Payment",
  recurring: "Monthly Donation"
};
