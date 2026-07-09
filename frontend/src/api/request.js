import API from "./axios";

export const createRequest = async (data) => {
  const response = await API.post("/requests", data);
  return response.data;
};

export const updateRequest = async (id, data) => {
  const response = await API.put(`/requests/${id}`, data);
  return response.data;
};

export const getRequests = async () => {
  const response = await API.get("/requests");
  return response.data;
};

export const assignVolunteer = async (id) => {
  const response = await API.put(`/requests/${id}/assign`);
  return response.data;
};
