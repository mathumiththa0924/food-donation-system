import React, { useState, useEffect } from "react";
import { getFeedbacksByDonor, deleteFeedback } from "../api/feedback";
import RatingStars from "./RatingStars";
import toast from "react-hot-toast";
import { COLORS } from "../theme";

// ✅ FEEDBACK LIST COMPONENT - Display all feedbacks for a donor
const FeedbackList = ({ donorId, donorName, canDelete = false }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, [donorId]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const response = await getFeedbacksByDonor(donorId);
      if (response.success) {
        setFeedbacks(response.feedbacks || []);
        setStats(response.donor);

        // Calculate average rating
        if (response.feedbacks.length > 0) {
          const avg =
            response.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
            response.feedbacks.length;
          setAverageRating(parseFloat(avg.toFixed(1)));
        }
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Failed to load feedback");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        const response = await deleteFeedback(feedbackId);
        if (response.success) {
          toast.success("Feedback deleted successfully");
          fetchFeedbacks();
        } else {
          toast.error(response.message || "Failed to delete feedback");
        }
      } catch (error) {
        console.error("Error deleting feedback:", error);
        toast.error("Error deleting feedback");
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.7)" }}>
        ⏳ Loading feedback...
      </div>
    );
  }

  return (
    <div>
      {/* RATING HEADER */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.amber}20, ${COLORS.orange}20)`,
          border: `1px solid ${COLORS.amber}40`,
          borderRadius: 16,
          padding: 24,
          marginBottom: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div>
            <h2 style={{ color: "white", fontSize: 32, fontWeight: 800, margin: 0 }}>
              {averageRating.toFixed(1)}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>out of 5</p>
          </div>

          <div style={{ flex: 1 }}>
            <RatingStars rating={Math.round(averageRating)} readOnly size={28} />
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                marginTop: 12,
                margin: 0,
              }}
            >
              Based on {feedbacks.length} review{feedbacks.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        {feedbacks.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 12 }}>
              Rating distribution:
            </p>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = feedbacks.filter((f) => f.rating === star).length;
              const percentage = (count / feedbacks.length) * 100;
              return (
                <div
                  key={star}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, minWidth: 20 }}>
                    {star}⭐
                  </span>
                  <div
                    style={{
                      width: 150,
                      height: 8,
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: COLORS.amber,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, minWidth: 30 }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FEEDBACKS LIST */}
      {feedbacks.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 12,
            border: "1px dashed rgba(255,255,255,0.2)",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>
            📝 No feedback yet. Be the first to review!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {feedbacks.map((feedback) => (
            <div
              key={feedback._id}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: `1px solid rgba(255,255,255,0.15)`,
                borderRadius: 12,
                padding: 20,
                transition: "all 0.3s ease",
                cursor: "hover",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = `${COLORS.amber}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              }}
            >
              {/* Header: Rating + Info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <RatingStars rating={feedback.rating} readOnly size={20} />
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: 0 }}>
                    by {feedback.ngoId?.name || "Unknown NGO"}
                  </p>
                </div>

                {canDelete && (
                  <button
                    onClick={() => handleDelete(feedback._id)}
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid rgba(239, 68, 68, 0.5)",
                      color: "#fca5a5",
                      borderRadius: 8,
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>

              {/* Comment */}
              {feedback.comment && (
                <p
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    marginBottom: 12,
                    margin: 0,
                    padding: 12,
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: 8,
                    borderLeft: `3px solid ${COLORS.amber}`,
                  }}
                >
                  "{feedback.comment}"
                </p>
              )}

              {/* Timestamp */}
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0 }}>
                📅 {new Date(feedback.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
