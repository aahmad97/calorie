/**
 * Utility functions for date manipulation
 */

const dateUtils = {
    /**
     * Format the current date in a readable format
     * @returns {string} Formatted date string
     */
    getCurrentDateFormatted: function() {
        const date = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },
    
    /**
     * Get date in YYYY-MM-DD format for storage
     * @returns {string} Date in YYYY-MM-DD format
     */
    getDateForStorage: function() {
        const date = new Date();
        return date.toISOString().split('T')[0];
    },

    /**
     * Convert a date string to a formatted date
     * @param {string} dateString - Date in YYYY-MM-DD format
     * @returns {string} Formatted date string
     */
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
};
