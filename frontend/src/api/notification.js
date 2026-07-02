import API from "./axios";

export const getNotifications = async () => {
  const response = await API.get("/notifications");
  return response.data;
};

export const markNotificationsAsRead = async () => {
  const response = await API.put("/notifications/read");
  return response.data;
};
