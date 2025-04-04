/**
 * Functions for nutrition calculations
 */

const calculators = {
    /**
     * Calculate total calories from a list of food items
     * @param {Array} foods - Array of food objects with calories
     * @returns {number} Total calories
     */
    calculateTotalCalories: function(foods) {
        return foods.reduce((total, food) => total + food.calories, 0);
    },
    
    /**
     * Calculate total macronutrients from a list of food items
     * @param {Array} foods - Array of food objects with macros
     * @returns {Object} Object containing total carbs, protein and fat
     */
    calculateTotalMacros: function(foods) {
        return foods.reduce((totals, food) => {
            return {
                carbs: totals.carbs + (food.carbs || 0),
                protein: totals.protein + (food.protein || 0),
                fat: totals.fat + (food.fat || 0)
            };
        }, { carbs: 0, protein: 0, fat: 0 });
    },
    
    /**
     * Calculate percentage of goal reached
     * @param {number} current - Current value
     * @param {number} goal - Goal value
     * @returns {number} Percentage of goal reached (0-100)
     */
    calculatePercentage: function(current, goal) {
        if (goal <= 0) return 0;
        const percentage = (current / goal) * 100;
        return Math.min(Math.max(percentage, 0), 100); // Clamp between 0 and 100
    },
    
    /**
     * Calculate calories remaining from goal
     * @param {number} goal - Calorie goal
     * @param {number} consumed - Calories consumed
     * @returns {number} Calories remaining
     */
    calculateCaloriesRemaining: function(goal, consumed) {
        return Math.max(goal - consumed, 0);
    }
};
