import React from "react";

export default function RenderGeneratedSummary({ summary }) {
  if (!summary) {
    return <p>No summary available.</p>;
  }

  // Safely extract keys with optional chaining
  const overallRating = summary["Overall Event Rating"];
  const keyHighlights = summary["Key Highlights"];
  const areasForImprovement = summary["Areas for Improvement"];
  const actionableSuggestions = summary["Actionable Suggestions"];
  const finalVerdict = summary["Final Verdict"];

  return (
    <div className="space-y-4 text-sm text-gray-700">
      {/* Overall Event Rating */}
      {overallRating && (
        <div className="p-3 border rounded bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">
            ⭐ Overall Event Rating
          </h4>
          <p>
            <strong>Average Rating:</strong> {overallRating["Average Rating"]}
          </p>
          <p>
            <strong>Category:</strong> {overallRating["Category"]}
          </p>
        </div>
      )}

      {/* Key Highlights */}
      {Array.isArray(keyHighlights) && keyHighlights.length > 0 && (
        <div className="p-3 border rounded bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">🌟 Key Highlights</h4>
          <ul className="list-disc pl-5 space-y-1">
            {keyHighlights.map((highlight, idx) => (
              <li key={idx}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {Array.isArray(areasForImprovement) && areasForImprovement.length > 0 && (
        <div className="p-3 border rounded bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">
            ⚠️ Areas for Improvement
          </h4>
          <ul className="list-disc pl-5 space-y-1">
            {areasForImprovement.map((area, idx) => (
              <li key={idx}>{area}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actionable Suggestions */}
      {Array.isArray(actionableSuggestions) &&
        actionableSuggestions.length > 0 && (
          <div className="p-3 border rounded bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-2">
              💡 Actionable Suggestions
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {actionableSuggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

      {/* Final Verdict */}
      {finalVerdict && (
        <div className="p-3 border rounded bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">🏁 Final Verdict</h4>
          <p>
            <strong>Conclusion:</strong>{" "}
            {finalVerdict["Conclusion"] ||
              finalVerdict["conclusion"] ||
              "N/A"}
          </p>
          <p>
            <strong>Reasoning:</strong>{" "}
            {finalVerdict["Reasoning"] ||
              finalVerdict["reasoning"] ||
              "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}
