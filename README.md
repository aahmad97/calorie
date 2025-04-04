# calorie
Calorie Tracker akin to myfitnesspal

fittrack/
│
├── assets/
│   ├── css/
│   │   ├── main.css                 # Main stylesheet
│   │   ├── components/              # Component-specific styles
│   │   │   ├── cards.css            # Styles for cards
│   │   │   ├── navigation.css       # Styles for navigation
│   │   │   ├── modal.css            # Styles for modals
│   │   │   ├── forms.css            # Styles for forms
│   │   │   └── progress.css         # Styles for progress bars
│   │   └── utilities/
│   │       ├── variables.css        # CSS variables for colors, etc.
│   │       └── layout.css           # Layout utilities
│   │
│   ├── js/
│   │   ├── main.js                  # Main JavaScript file
│   │   ├── modules/                 # JavaScript modules
│   │   │   ├── dashboard.js         # Dashboard functionality
│   │   │   ├── foodTracker.js       # Food tracking functionality
│   │   │   ├── waterTracker.js      # Water tracking functionality
│   │   │   └── modalHandler.js      # Modal handling
│   │   ├── utils/                   # Utility functions
│   │   │   ├── dateUtils.js         # Date handling utilities
│   │   │   └── calculators.js       # Calorie/macro calculators
│   │   └── data/
│   │       └── foodDatabase.js      # Food database
│   │
│   └── images/                      # Image assets
│       ├── icons/                   # Icon assets
│       ├── logo.svg                 # FitTrack logo
│       └── favicon.ico              # Favicon
│
├── pages/
│   ├── index.html                   # Dashboard/main page
│   ├── food.html                    # Food tracking detailed page
│   ├── progress.html                # Progress visualization page
│   └── goals.html                   # Goal setting page
│
├── components/                      # Reusable HTML components
│   ├── header.html                  # Header component
│   ├── footer.html                  # Footer component
│   ├── meal-card.html              # Meal card component
│   └── modals/                      # Modal components
│       ├── add-food.html            # Add food modal
│       └── add-goal.html            # Add goal modal
│
├── .gitignore                       # Git ignore file
├── README.md                        # Project documentation
└── package.json                     # Project dependencies
