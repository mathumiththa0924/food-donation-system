import API from "./axios";

export const createCheckoutSession = async (data) => {
  const response = await API.post("/payment/create-checkout-session", data);
  return response.data;
};
