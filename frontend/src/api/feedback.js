import api from "./axios";

// ✅ Create feedback (NGO submits rating after delivery)
export const createFeedback = async (feedbackData) => {
  try {
    const response = await api.post("/feedbacks", feedbackData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Get all feedbacks
export const getAllFeedbacks = async () => {
  try {
    const response = await api.get("/feedbacks");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Get feedbacks for a specific donor
export const getFeedbacksByDonor = async (donorId) => {
  try {
    const response = await api.get(`/feedbacks/donor/${donorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Get donor rating statistics
export const getDonorRatingStats = async (donorId) => {
  try {
    const response = await api.get(`/feedbacks/donor/${donorId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Get feedbacks submitted by current NGO user
export const getMySubmittedFeedbacks = async () => {
  try {
    const response = await api.get("/feedbacks/my/submitted");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Get pending feedbacks for current user
export const getMyPendingFeedbacks = async () => {
  try {
    const response = await api.get("/feedbacks/my/pending");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Get feedbacks received by current NGO user (as donor)
export const getMyReceivedFeedbacks = async () => {
  try {
    const response = await api.get("/feedbacks/my/received");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Update feedback
export const updateFeedback = async (feedbackId, updateData) => {
  try {
    const response = await api.put(`/feedbacks/${feedbackId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Delete feedback
export const deleteFeedback = async (feedbackId) => {
  try {
    const response = await api.delete(`/feedbacks/${feedbackId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
