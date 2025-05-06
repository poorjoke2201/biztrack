// src/utils/helpers.js

/**
 * Formats a date string into a more readable format.
 * @param {string | Date | null | undefined} dateString - The date string or Date object to format.
 * @param {object} options - Intl.DateTimeFormat options (optional).
 * @returns {string} - Formatted date string or 'N/A'.
 */
export const formatDate = (dateString, options = { year: 'numeric', month: 'numeric', day: 'numeric' }) => {
  if (!dateString) return 'N/A';
  try {
      // Create date object once
      const date = new Date(dateString);
      // Check if the date object is valid
      if (isNaN(date.getTime())) {
          return 'Invalid Date';
      }
      return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (e) {
      console.error("Date formatting error:", e);
      return 'Invalid Date';
  }
};

/**
* Capitalizes the first letter of a string.
* @param {string | null | undefined} str - The string to capitalize.
* @returns {string} - Capitalized string or empty string.
*/
export const capitalize = (str) => {
  if (!str) return ''; // Return empty string if input is falsy
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
* Formats a number as Indian Rupee currency.
* @param {number|string|null|undefined} amount - The numeric value to format.
* @param {string} currency - Currency code (default: 'INR').
* @param {string} locale - Locale for formatting (default: 'en-IN').
* @returns {string} - Formatted currency string or 'N/A'.
*/
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => { // *** ENSURE THIS IS EXPORTED ***
   const numberAmount = Number(amount);
   if (amount === null || amount === undefined || isNaN(numberAmount)) {
       return 'N/A';
   }
   try {
      return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
      }).format(numberAmount);
   } catch (e) {
       console.error("Currency formatting error:", e);
       // Provide a basic fallback if Intl fails
       return `₹${numberAmount.toFixed(2)}`;
   }
};

// Add more helper functions as needed