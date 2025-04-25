// Food Tracker Core Functionality
// This file contains the core functionality for tracking food and calculating nutrition

/**
 * Calculate total nutrition based on food entries
 * @param {Array} foodEntries - Array of food entry objects
 * @returns {Object} - Object containing total nutrition values
 */
function calculateTotalNutrition(foodEntries) {
    const totals = {
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0
    };
    
    foodEntries.forEach(entry => {
        totals.calories += entry.calories;
        totals.carbs += entry.nutrients.carbs;
        totals.protein += entry.nutrients.protein;
        totals.fat += entry.nutrients.fat;
    });
    
    return totals;
}

/**
 * Get all food entries for a specific date
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Array} - Array of food entry objects
 */
function getFoodEntriesForDate(dateString) {
    const savedEntries = localStorage.getItem(`foodEntries_${dateString}`);
    return savedEntries ? JSON.parse(savedEntries) : [];
}

/**
 * Get food entries for today
 * @returns {Array} - Array of food entry objects
 */
function getTodaysFoodEntries() {
    const today = getTodayDateString();
    return getFoodEntriesForDate(today);
}

/**
 * Get food entries for a specific meal type
 * @param {string} mealType - Type of meal (breakfast, lunch, dinner, snacks)
 * @param {string} dateString - Date in YYYY-MM-DD format (defaults to today)
 * @returns {Array} - Array of food entry objects
 */
function getFoodEntriesByMeal(mealType, dateString = getTodayDateString()) {
    const entries = getFoodEntriesForDate(dateString);
    return entries.filter(entry => entry.mealType === mealType);
}

/**
 * Calculate remaining nutrition based on goals and consumed
 * @param {Object} goals - User's nutrition goals
 * @param {Object} consumed - Consumed nutrition totals
 * @returns {Object} - Remaining nutrition values
 */
function calculateRemainingNutrition(goals, consumed) {
    return {
        calories: goals.calories - consumed.calories,
        carbs: goals.carbs - consumed.carbs,
        protein: goals.protein - consumed.protein,
        fat: goals.fat - consumed.fat
    };
}

/**
 * Calculate macronutrient percentages
 * @param {Object} nutrition - Object containing nutrition values
 * @returns {Object} - Percentages of each macronutrient
 */
function calculateMacroPercentages(nutrition) {
    const totalCaloriesFromMacros = 
        (nutrition.carbs * 4) + 
        (nutrition.protein * 4) + 
        (nutrition.fat * 9);
    
    return {
        carbs: Math.round((nutrition.carbs * 4 / totalCaloriesFromMacros) * 100),
        protein: Math.round((nutrition.protein * 4 / totalCaloriesFromMacros) * 100),
        fat: Math.round((nutrition.fat * 9 / totalCaloriesFromMacros) * 100)
    };
}

/**
 * Check if a food entry already exists in today's entries
 * @param {string} foodId - ID of the food to check
 * @param {string} mealType - Type of meal to check
 * @returns {boolean} - True if the food exists in the meal
 */
function foodExistsInMeal(foodId, mealType) {
    const entries = getTodaysFoodEntries();
    return entries.some(entry => entry.foodId === foodId && entry.mealType === mealType);
}

/**
 * Get nutrition totals for a specific date and meal
 * @param {string} mealType - Type of meal
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Object} - Nutrition totals for the meal
 */
function getMealNutritionTotals(mealType, dateString = getTodayDateString()) {
    const mealEntries = getFoodEntriesByMeal(mealType, dateString);
    return calculateTotalNutrition(mealEntries);
}

/**
 * Get nutrition totals for each meal of the day
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Object} - Object containing nutrition totals for each meal
 */
function getAllMealTotals(dateString = getTodayDateString()) {
    return {
        breakfast: getMealNutritionTotals('breakfast', dateString),
        lunch: getMealNutritionTotals('lunch', dateString),
        dinner: getMealNutritionTotals('dinner', dateString),
        snacks: getMealNutritionTotals('snacks', dateString)
    };
}

/**
 * Calculate the percentage of daily goals met
 * @param {Object} consumed - Consumed nutrition totals
 * @param {Object} goals - User's nutrition goals
 * @returns {Object} - Percentage of each goal met
 */
function calculateGoalPercentages(consumed, goals) {
    return {
        calories: Math.min(100, Math.round((consumed.calories / goals.calories) * 100)),
        carbs: Math.min(100, Math.round((consumed.carbs / goals.carbs) * 100)),
        protein: Math.min(100, Math.round((consumed.protein / goals.protein) * 100)),
        fat: Math.min(100, Math.round((consumed.fat / goals.fat) * 100))
    };
}

/**
 * Save user's nutrition goals to localStorage
 * @param {Object} goals - User's nutrition goals
 */
function saveUserGoals(goals) {
    localStorage.setItem('userNutritionGoals', JSON.stringify(goals));
}

/**
 * Add a food to the frequency tracking
 * @param {string} foodId - ID of the food
 */
function trackFoodFrequency(foodId) {
    let foodFrequency = {};
    
    const savedFrequency = localStorage.getItem('foodFrequency');
    if (savedFrequency) {
        foodFrequency = JSON.parse(savedFrequency);
    }
    
    if (foodFrequency[foodId]) {
        foodFrequency[foodId]++;
    } else {
        foodFrequency[foodId] = 1;
    }
    
    localStorage.setItem('foodFrequency', JSON.stringify(foodFrequency));
}

/**
 * Get most frequently consumed foods
 * @param {number} limit - Maximum number of foods to return
 * @returns {Array} - Array of food IDs sorted by frequency
 */
function getMostFrequentFoods(limit = 10) {
    const savedFrequency = localStorage.getItem('foodFrequency');
    if (!savedFrequency) return [];
    
    const foodFrequency = JSON.parse(savedFrequency);
    
    // Convert to array and sort by frequency
    const sortedFoods = Object.entries(foodFrequency)
        .map(([foodId, count]) => ({ foodId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(item => item.foodId);
    
    return sortedFoods;
}

/**
 * Export food diary data for a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Object} - Data export object
 */
function exportFoodData(startDate, endDate) {
    const exportData = {
        dateRange: {
            start: startDate,
            end: endDate
        },
        entries: {}
    };
    
    // Convert dates to Date objects for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Loop through each day in the range
    const currentDate = new Date(start);
    while (currentDate <= end) {
        const dateString = formatDateAsString(currentDate);
        exportData.entries[dateString] = getFoodEntriesForDate(dateString);
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return exportData;
}

/**
 * Import food diary data
 * @param {Object} importData - Food diary data to import
 * @returns {boolean} - Success status
 */
function importFoodData(importData) {
    try {
        // Validate import data structure
        if (!importData.entries) {
            return false;
        }
        
        // Import each day's entries
        Object.entries(importData.entries).forEach(([dateString, entries]) => {
            localStorage.setItem(`foodEntries_${dateString}`, JSON.stringify(entries));
        });
        
        return true;
    } catch (error) {
        console.error('Error importing food data:', error);
        return false;
    }
}
