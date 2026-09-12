/**
 * Formats monetary amounts into clean Indian Rupee (INR) representation.
 * Supports compact notation for large values (Cr, L, M, K).
 *
 * @param {number} amount - The numeric monetary value
 * @returns {string} Formatted currency string (e.g. ₹24.50M, ₹2.45Cr, ₹4.89L, ₹4,88,750)
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== "number" || isNaN(amount) || amount === 0) {
    return "₹0";
  }

  const abs = Math.abs(amount);

  // Compact Crores (>= 1,00,00,000)
  if (abs >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }

  // Compact Millions (>= 1,000,000)
  if (abs >= 1000000) {
    return `₹${(amount / 1000000).toFixed(2)}M`;
  }

  // Compact Lakhs (>= 1,00,000)
  if (abs >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }

  // Standard INR locale formatting for values under 1 Lakh
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Formats percentage values cleanly without floating point artifacts.
 * @param {number} val - The numeric percentage (0-100)
 * @returns {string} Formatted percentage string (e.g. 94.2%)
 */
export const formatPercent = (val) => {
  if (typeof val !== "number" || isNaN(val)) return "0%";
  return `${Number(val.toFixed(1))}%`;
};

/**
 * Formats performance rating score (1-5 scale).
 * @param {number} val - Performance score
 * @returns {string} Formatted rating (e.g. 4.1 / 5.0)
 */
export const formatRating = (val) => {
  if (typeof val !== "number" || isNaN(val)) return "0.0 / 5.0";
  return `${Number(val.toFixed(1))} / 5.0`;
};

export default {
  formatCurrency,
  formatPercent,
  formatRating
};
