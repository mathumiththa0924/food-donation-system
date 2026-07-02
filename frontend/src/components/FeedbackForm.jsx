import React, { useState } from "react";
import { createFeedback } from "../api/feedback";
import RatingStars from "./RatingStars";
import toast from "react-hot-toast";
import { COLORS } from "../theme";

// ✅ FEEDBACK FORM COMPONENT
const FeedbackForm = ({ donorId, requestId, donationId, donorName, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createFeedback({
        rating,
        comment: comment.trim(),
        donorId,
        donationId,
        requestId,
      });

      if (response.success) {
        toast.success("✅ Feedback submitted successfully!");
        setRating(0);
        setComment("");
        if (onSubmitSuccess) {
          onSubmitSuccess(response.data);
        }
      } else {
        toast.error(response.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error(error.message || "Error submitting feedback");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 450, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h3 style={{ color: "white", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
          ⭐ Rate Your Experience
        </h3>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: 0 }}>
          Help other NGOs by rating {donorName}'s donation
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Rating Section */}
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <label style={{ display: "block", color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Select Rating *
          </label>
          <div style={{ display: "inline-block" }}>
            <RatingStars rating={rating} onRatingChange={setRating} size={36} />
          </div>
        </div>

        {/* Comment Section */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            📝 Add Comments (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe your experience with this donor... (quality, packaging, coordination, etc.)"
            maxLength={500}
            style={{
              width: "100%",
              minHeight: 80,
              padding: 12,
              background: "rgba(0,0,0,0.2)",
              border: `1px solid ${COLORS.purple}60`,
              borderRadius: 12,
              color: "white",
              fontSize: 14,
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, textAlign: "right" }}>
            {comment.length} / 500
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || rating === 0}
          style={{
            width: "100%",
            background: rating === 0 ? "rgba(255,255,255,0.1)" : COLORS.amber,
            color: rating === 0 ? "rgba(255,255,255,0.4)" : COLORS.forest,
            border: "none",
            borderRadius: 12,
            padding: "12px",
            fontSize: 15,
            fontWeight: 700,
            cursor: rating === 0 ? "not-allowed" : isLoading ? "wait" : "pointer",
            transition: "all 0.3s ease",
            opacity: isLoading ? 0.8 : 1,
          }}
        >
          {isLoading ? "⏳ Submitting..." : "✅ Submit Feedback"}
        </button>

        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 12, marginBottom: 0, textAlign: "center" }}>
          * Rating is required. Your feedback helps maintain quality standards.
        </p>
      </form>
    </div>
  );
};

export default FeedbackForm;
