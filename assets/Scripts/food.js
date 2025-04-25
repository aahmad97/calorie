document.addEventListener('DOMContentLoaded', function() {
    // Initialize date display
    updateCurrentDate();
    
    // Initialize the food tracker with data
    initializeFoodTracker();
    
    // Add event listeners for food-related actions
    setupEventListeners();
    
    // Update the nutrition summary and progress bars
    updateNutritionSummary();
});

// Function to update the current date display
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const today = new Date();
    dateElement.textContent = formatDate(today);
}

// Initialize the food tracker with saved data or defaults
function initializeFoodTracker() {
    // Load user's nutrition goals from local storage or use defaults
    const userGoals = getUserGoals();
    
    // Update the goals display
    document.getElementById('calorie-goal').textContent = userGoals.calories;
    document.getElementById('carbs-goal').textContent = userGoals.carbs;
    document.getElementById('protein-goal').textContent = userGoals.protein;
    document.getElementById('fat-goal').textContent = userGoals.fat;
    
    // Load today's food entries from localStorage
    loadTodaysFoodEntries();
}

// Get user's nutrition goals from localStorage or use defaults
function getUserGoals() {
    const savedGoals = localStorage.getItem('userNutritionGoals');
    if (savedGoals) {
        return JSON.parse(savedGoals);
    }
    
    // Default goals
    return {
        calories: 2000,
        carbs: 250,
        protein: 125,
        fat: 65
    };
}

// Load today's food entries from localStorage
function loadTodaysFoodEntries() {
    const today = getTodayDateString();
    const savedEntries = localStorage.getItem(`foodEntries_${today}`);
    
    if (savedEntries) {
        const entries = JSON.parse(savedEntries);
        
        // Clear existing entries
        document.getElementById('breakfast-items').innerHTML = '';
        document.getElementById('lunch-items').innerHTML = '';
        document.getElementById('dinner-items').innerHTML = '';
        document.getElementById('snacks-items').innerHTML = '';
        
        // Add each entry to the corresponding meal section
        entries.forEach(entry => {
            addFoodEntryToUI(entry);
        });
    }
}

// Set up event listeners for food-related actions
function setupEventListeners() {
    // Add Food button
    document.getElementById('add-food-btn').addEventListener('click', openAddFoodModal);
    
    // Food search input
    document.getElementById('food-search').addEventListener('input', handleFoodSearch);
    
    // Add food submit button
    document.getElementById('add-food-submit').addEventListener('click', handleAddFood);
    
    // Edit food buttons
    document.querySelectorAll('.edit-food').forEach(button => {
        button.addEventListener('click', function() {
            const mealType = this.getAttribute('data-meal');
            const foodId = this.getAttribute('data-id');
            openEditFoodModal(mealType, foodId);
        });
    });
    
    // Delete food buttons
    document.querySelectorAll('.delete-food').forEach(button => {
        button.addEventListener('click', function() {
            const mealType = this.getAttribute('data-meal');
            const foodId = this.getAttribute('data-id');
            confirmDeleteFood(mealType, foodId);
        });
    });
    
    // Recent foods add buttons
    document.querySelectorAll('.add-recent-food').forEach(button => {
        button.addEventListener('click', function() {
            const foodItem = this.closest('.recent-food-item');
            const foodId = foodItem.getAttribute('data-food-id');
            quickAddRecentFood(foodId);
        });
    });
    
    // Update food button in edit modal
    document.getElementById('update-food-btn').addEventListener('click', handleUpdateFood);
    
    // Delete food button in edit modal
    document.getElementById('delete-food-btn').addEventListener('click', handleDeleteFood);
}

// Open the add food modal
function openAddFoodModal() {
    document.getElementById('food-modal').classList.add('show');
    document.getElementById('food-search').focus();
    document.getElementById('selected-food-details').classList.add('hidden');
    document.getElementById('food-results').innerHTML = '';
}

// Handle food search input
function handleFoodSearch() {
    const searchTerm = document.getElementById('food-search').value.toLowerCase();
    const resultsContainer = document.getElementById('food-results');
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    if (searchTerm.length < 2) return;
    
    // Search the food database
    const matchingFoods = searchFoods(searchTerm);
    
    // Display results
    matchingFoods.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-result-item';
        foodItem.innerHTML = `
            <div class="food-result-name">${food.name}</div>
            <div class="food-result-calories">${food.calories} cal</div>
        `;
        foodItem.addEventListener('click', function() {
            selectFood(food);
        });
        resultsContainer.appendChild(foodItem);
    });
}

// Search foods in the database
function searchFoods(searchTerm) {
    // Filter the food database for matching items
    return foodDatabase.filter(food => 
        food.name.toLowerCase().includes(searchTerm)
    ).slice(0, 10); // Limit to 10 results
}

// Select a food from search results
function selectFood(food) {
    const detailsContainer = document.getElementById('selected-food-details');
    detailsContainer.classList.remove('hidden');
    
    document.getElementById('selected-food-name').textContent = food.name;
    document.getElementById('food-quantity').value = 1;
    
    // Store the selected food data for later use
    detailsContainer.dataset.foodId = food.id;
    detailsContainer.dataset.foodName = food.name;
    detailsContainer.dataset.calories = food.calories;
    detailsContainer.dataset.carbs = food.nutrients.carbs;
    detailsContainer.dataset.protein = food.nutrients.protein;
    detailsContainer.dataset.fat = food.nutrients.fat;
    
    // Clear search results
    document.getElementById('food-results').innerHTML = '';
}

// Handle adding a food
function handleAddFood() {
    const detailsContainer = document.getElementById('selected-food-details');
    const quantity = parseFloat(document.getElementById('food-quantity').value);
    const mealType = document.getElementById('meal-type').value;
    
    if (isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }
    
    const foodEntry = {
        id: Date.now().toString(), // Use timestamp as unique ID
        foodId: detailsContainer.dataset.foodId,
        name: detailsContainer.dataset.foodName,
        quantity: quantity,
        calories: Math.round(detailsContainer.dataset.calories * quantity),
        nutrients: {
            carbs: Math.round(detailsContainer.dataset.carbs * quantity * 10) / 10,
            protein: Math.round(detailsContainer.dataset.protein * quantity * 10) / 10,
            fat: Math.round(detailsContainer.dataset.fat * quantity * 10) / 10
        },
        mealType: mealType
    };
    
    // Add the food entry to the UI and storage
    addFoodEntry(foodEntry);
    
    // Close the modal
    document.getElementById('food-modal').classList.remove('show');
    
    // Add to recent foods if not already present
    addToRecentFoods({
        id: detailsContainer.dataset.foodId,
        name: detailsContainer.dataset.foodName,
        calories: detailsContainer.dataset.calories
    });
}

// Add a food entry to the UI and storage
function addFoodEntry(entry) {
    // Add to UI
    addFoodEntryToUI(entry);
    
    // Add to storage
    saveFoodEntry(entry);
    
    // Update nutrition summary
    updateNutritionSummary();
}

// Add a food entry to the UI
function addFoodEntryToUI(entry) {
    const mealContainer = document.getElementById(`${entry.mealType}-items`);
    
    const entryElement = document.createElement('div');
    entryElement.className = 'meal-entry';
    entryElement.dataset.entryId = entry.id;
    
    entryElement.innerHTML = `
        <div class="meal-header">
            <div class="meal-name">${entry.name}</div>
            <div class="meal-calories">${entry.calories} cal</div>
        </div>
        <div class="meal-nutrients">
            <span>Carbs: ${entry.nutrients.carbs}g</span>
            <span>Protein: ${entry.nutrients.protein}g</span>
            <span>Fat: ${entry.nutrients.fat}g</span>
        </div>
        <div class="meal-actions">
            <button class="btn btn-icon edit-food" data-meal="${entry.mealType}" data-id="${entry.id}"><i class="edit-icon"></i></button>
            <button class="btn btn-icon delete-food" data-meal="${entry.mealType}" data-id="${entry.id}"><i class="delete-icon"></i></button>
        </div>
    `;
    
    // Add event listeners to the new buttons
    entryElement.querySelector('.edit-food').addEventListener('click', function() {
        openEditFoodModal(entry.mealType, entry.id);
    });
    
    entryElement.querySelector('.delete-food').addEventListener('click', function() {
        confirmDeleteFood(entry.mealType, entry.id);
    });
    
    mealContainer.appendChild(entryElement);
}

// Save a food entry to localStorage
function saveFoodEntry(entry) {
    const today = getTodayDateString();
    let entries = [];
    
    const savedEntries = localStorage.getItem(`foodEntries_${today}`);
    if (savedEntries) {
        entries = JSON.parse(savedEntries);
    }
    
    // Check if entry already exists and remove it
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    if (existingIndex !== -1) {
        entries.splice(existingIndex, 1);
    }
    
    // Add the new entry
    entries.push(entry);
    
    // Save back to localStorage
    localStorage.setItem(`foodEntries_${today}`, JSON.stringify(entries));
}

// Open the edit food modal
function openEditFoodModal(mealType, entryId) {
    const today = getTodayDateString();
    const savedEntries = localStorage.getItem(`foodEntries_${today}`);
    
    if (savedEntries) {
        const entries = JSON.parse(savedEntries);
        const entry = entries.find(e => e.id === entryId);
        
        if (entry) {
            document.getElementById('edit-food-name').textContent = entry.name;
            document.getElementById('edit-food-quantity').value = entry.quantity;
            document.getElementById('edit-meal-type').value = entry.mealType;
            
            // Store the entry data for later use
            const editForm = document.getElementById('edit-food-form');
            editForm.dataset.entryId = entry.id;
            editForm.dataset.foodId = entry.foodId;
            editForm.dataset.foodName = entry.name;
            editForm.dataset.calories = entry.calories / entry.quantity;
            editForm.dataset.carbs = entry.nutrients.carbs / entry.quantity;
            editForm.dataset.protein = entry.nutrients.protein / entry.quantity;
            editForm.dataset.fat = entry.nutrients.fat / entry.quantity;
            
            // Show the modal
            document.getElementById('edit-food-modal').classList.add('show');
        }
    }
}

// Handle updating a food entry
function handleUpdateFood() {
    const editForm = document.getElementById('edit-food-form');
    const entryId = editForm.dataset.entryId;
    const quantity = parseFloat(document.getElementById('edit-food-quantity').value);
    const mealType = document.getElementById('edit-meal-type').value;
    
    if (isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }
    
    const updatedEntry = {
        id: entryId,
        foodId: editForm.dataset.foodId,
        name: editForm.dataset.foodName,
        quantity: quantity,
        calories: Math.round(editForm.dataset.calories * quantity),
        nutrients: {
            carbs: Math.round(editForm.dataset.carbs * quantity * 10) / 10,
            protein: Math.round(editForm.dataset.protein * quantity * 10) / 10,
            fat: Math.round(editForm.dataset.fat * quantity * 10) / 10
        },
        mealType: mealType
    };
    
    // Update the entry in storage and UI
    updateFoodEntry(updatedEntry);
    
    // Close the modal
    document.getElementById('edit-food-modal').classList.remove('show');
}

// Update a food entry in storage and UI
function updateFoodEntry(updatedEntry) {
    // Remove the existing entry from UI
    const existingEntryElement = document.querySelector(`[data-entry-id="${updatedEntry.id}"]`);
    if (existingEntryElement) {
        existingEntryElement.remove();
    }
    
    // Add the updated entry to UI
    addFoodEntryToUI(updatedEntry);
    
    // Update in storage
    saveFoodEntry(updatedEntry);
    
    // Update nutrition summary
    updateNutritionSummary();
}

// Handle deleting a food entry
function handleDeleteFood() {
    const editForm = document.getElementById('edit-food-form');
    const entryId = editForm.dataset.entryId;
    
    // Delete the entry
    deleteFoodEntry(entryId);
    
    // Close the modal
    document.getElementById('edit-food-modal').classList.remove('show');
}

// Confirm deletion of a food entry
function confirmDeleteFood(mealType, entryId) {
    if (confirm('Are you sure you want to delete this food?')) {
        deleteFoodEntry(entryId);
    }
}

// Delete a food entry from storage and UI
function deleteFoodEntry(entryId) {
    // Remove from UI
    const entryElement = document.querySelector(`[data-entry-id="${entryId}"]`);
    if (entryElement) {
        entryElement.remove();
    }
    
    // Remove from storage
    const today = getTodayDateString();
    const savedEntries = localStorage.getItem(`foodEntries_${today}`);
    
    if (savedEntries) {
        let entries = JSON.parse(savedEntries);
        entries = entries.filter(e => e.id !== entryId);
        localStorage.setItem(`foodEntries_${today}`, JSON.stringify(entries));
    }
    
    // Update nutrition summary
    updateNutritionSummary();
}

// Quick add a recent food
function quickAddRecentFood(foodId) {
    // Get the food data from the database
    const food = getFoodById(foodId);
    
    if (food) {
        // Pre-fill the add food modal
        document.getElementById('food-modal').classList.add('show');
        const detailsContainer = document.getElementById('selected-food-details');
        detailsContainer.classList.remove('hidden');
        
        document.getElementById('selected-food-name').textContent = food.name;
        document.getElementById('food-quantity').value = 1;
        
        // Store the selected food data
        detailsContainer.dataset.foodId = food.id;
        detailsContainer.dataset.foodName = food.name;
        detailsContainer.dataset.calories = food.calories;
        detailsContainer.dataset.carbs = food.nutrients.carbs;
        detailsContainer.dataset.protein = food.nutrients.protein;
        detailsContainer.dataset.fat = food.nutrients.fat;
        
        // Clear search results
        document.getElementById('food-results').innerHTML = '';
    }
}

// Get a food by ID
function getFoodById(foodId) {
    const food = foodDatabase.find(f => f.id === foodId);
    return food || null;
}

// Add a food to recent foods list
function addToRecentFoods(food) {
    let recentFoods = [];
    
    const savedRecentFoods = localStorage.getItem('recentFoods');
    if (savedRecentFoods) {
        recentFoods = JSON.parse(savedRecentFoods);
    }
    
    // Check if food already exists in recent foods
    const existingIndex = recentFoods.findIndex(f => f.id === food.id);
    if (existingIndex !== -1) {
        // Move to the front of the list
        recentFoods.splice(existingIndex, 1);
    }
    
    // Add to front of the list
    recentFoods.unshift(food);
    
    // Limit to 10 recent foods
    recentFoods = recentFoods.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('recentFoods', JSON.stringify(recentFoods));
    
    // Update the recent foods UI
    updateRecentFoodsUI();
}

// Update the recent foods UI
function updateRecentFoodsUI() {
    const recentFoodsList = document.getElementById('recent-foods-list');
    recentFoodsList.innerHTML = '';
    
    const savedRecentFoods = localStorage.getItem('recentFoods');
    if (savedRecentFoods) {
        const recentFoods = JSON.parse(savedRecentFoods);
        
        recentFoods.forEach(food => {
            const foodItem = document.createElement('div');
            foodItem.className = 'recent-food-item';
            foodItem.dataset.foodId = food.id;
            
            foodItem.innerHTML = `
                <div class="recent-food-name">${food.name}</div>
                <div class="recent-food-calories">${food.calories} cal</div>
                <button class="btn btn-sm btn-outline add-recent-food">Add</button>
            `;
            
            foodItem.querySelector('.add-recent-food').addEventListener('click', function() {
                quickAddRecentFood(food.id);
            });
            
            recentFoodsList.appendChild(foodItem);
        });
    }
}

// Update the nutrition summary and progress bars
function updateNutritionSummary() {
    const today = getTodayDateString();
    const savedEntries = localStorage.getItem(`foodEntries_${today}`);
    
    let totalCalories = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;
    
    let breakfastCalories = 0;
    let lunchCalories = 0;
    let dinnerCalories = 0;
    let snacksCalories = 0;
    
    if (savedEntries) {
        const entries = JSON.parse(savedEntries);
        
        entries.forEach(entry => {
            totalCalories += entry.calories;
            totalCarbs += entry.nutrients.carbs;
            totalProtein += entry.nutrients.protein;
            totalFat += entry.nutrients.fat;
            
            // Add to meal total
            switch (entry.mealType) {
                case 'breakfast':
                    breakfastCalories += entry.calories;
                    break;
                case 'lunch':
                    lunchCalories += entry.calories;
                    break;
                case 'dinner':
                    dinnerCalories += entry.calories;
                    break;
                case 'snacks':
                    snacksCalories += entry.calories;
                    break;
            }
        });
    }
    
    // Update daily totals
    document.getElementById('daily-calories').textContent = totalCalories;
    document.getElementById('daily-carbs').textContent = Math.round(totalCarbs);
    document.getElementById('daily-protein').textContent = Math.round(totalProtein);
    document.getElementById('daily-fat').textContent = Math.round(totalFat);
    
    // Update meal totals
    document.getElementById('breakfast-calories').textContent = breakfastCalories;
    document.getElementById('lunch-calories').textContent = lunchCalories;
    document.getElementById('dinner-calories').textContent = dinnerCalories;
    document.getElementById('snacks-calories').textContent = snacksCalories;
    
    // Update progress bars
    const userGoals = getUserGoals();
    
    const caloriePercent = Math.min(100, Math.round((totalCalories / userGoals.calories) * 100));
    const carbsPercent = Math.min(100, Math.round((totalCarbs / userGoals.carbs) * 100));
    const proteinPercent = Math.min(100, Math.round((totalProtein / userGoals.protein) * 100));
    const fatPercent = Math.min(100, Math.round((totalFat / userGoals.fat) * 100));
    
    document.getElementById('calorie-progress').style.width = `${caloriePercent}%`;
    document.getElementById('carbs-progress').style.width = `${carbsPercent}%`;
    document.getElementById('protein-progress').style.width = `${proteinPercent}%`;
    document.getElementById('fat-progress').style.width = `${fatPercent}%`;
}
