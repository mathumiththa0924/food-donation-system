import React from "react";

// ✅ RATING STARS COMPONENT - Interactive star selector for feedback
const RatingStars = ({ rating, onRatingChange, readOnly = false, size = 32 }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleMouseEnter = (index) => {
    if (!readOnly) setHoverRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (!readOnly) setHoverRating(0);
  };

  const handleClick = (index) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        gap: 8,
        cursor: readOnly ? "default" : "pointer",
        alignItems: "center",
      }}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const isFilled = (hoverRating || rating) > index;
        return (
          <div
            key={index}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            style={{
              fontSize: size,
              cursor: readOnly ? "default" : "pointer",
              opacity: isFilled ? 1 : 0.3,
              transition: "all 0.2s ease",
              transform: isFilled ? "scale(1.1)" : "scale(1)",
            }}
          >
            {isFilled ? "⭐" : "☆"}
          </div>
        );
      })}
      {rating > 0 && (
        <span
          style={{
            marginLeft: 12,
            fontSize: 16,
            fontWeight: 600,
            color: rating >= 4 ? "#10b981" : rating >= 3 ? "#f59e0b" : "#ef4444",
          }}
        >
          {rating}.0 / 5.0
        </span>
      )}
    </div>
  );
};

export default RatingStars;
