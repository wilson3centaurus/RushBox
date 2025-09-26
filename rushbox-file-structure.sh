#!/bin/bash

# RushBox Delivery App - Project Structure Setup Script
echo "🚀 Setting up RushBox Delivery App structure..."

# Create main project directory
mkdir -p rushbox-delivery-app
cd rushbox-delivery-app

# Create main folders
mkdir -p {src,assets,config,scripts,docs}

# Create src subfolders
mkdir -p src/{pages,components,styles,js,utils,services}

# Create assets subfolders
mkdir -p assets/{images,icons,logos}

# Create component folders
mkdir -p src/components/{auth,navigation,product,cart,order,common}

# Create page folders
mkdir -p src/pages/{auth,home,product,cart,checkout,order,profile,support}

# Create service folders
mkdir -p src/services/{firebase,api,storage,notifications}

# Create utility folders
mkdir -p src/utils/{helpers,constants,validators}

# Create style folders
mkdir -p src/styles/{components,pages,base}

# Create JavaScript module folders
mkdir -p src/js/{modules,controllers,models}

# Create main HTML files
touch index.html
touch src/pages/auth/login.html
touch src/pages/auth/register.html
touch src/pages/auth/forgot-password.html
touch src/pages/home/dashboard.html
touch src/pages/product/catalog.html
touch src/pages/product/details.html
touch src/pages/product/search.html
touch src/pages/cart/cart.html
touch src/pages/checkout/checkout.html
touch src/pages/order/orders.html
touch src/pages/order/tracking.html
touch src/pages/profile/profile.html
touch src/pages/profile/addresses.html
touch src/pages/support/support.html

# Create main CSS files
touch src/styles/main.css
touch src/styles/variables.css
touch src/styles/base/reset.css
touch src/styles/base/typography.css
touch src/styles/base/layout.css
touch src/styles/components/buttons.css
touch src/styles/components/forms.css
touch src/styles/components/cards.css
touch src/styles/components/navigation.css
touch src/styles/components/modals.css
touch src/styles/pages/auth.css
touch src/styles/pages/home.css
touch src/styles/pages/product.css
touch src/styles/pages/cart.css
touch src/styles/pages/checkout.css

# Create JavaScript files
touch src/js/main.js
touch src/js/app.js
touch src/js/router.js
touch src/js/modules/auth.js
touch src/js/modules/product.js
touch src/js/modules/cart.js
touch src/js/modules/order.js
touch src/js/modules/user.js
touch src/js/controllers/authController.js
touch src/js/controllers/productController.js
touch src/js/controllers/cartController.js
touch src/js/controllers/orderController.js
touch src/js/models/User.js
touch src/js/models/Product.js
touch src/js/models/Order.js
touch src/js/models/Cart.js

# Create Firebase service files
touch src/services/firebase/config.js
touch src/services/firebase/auth.js
touch src/services/firebase/firestore.js
touch src/services/firebase/storage.js
touch src/services/firebase/functions.js
touch src/services/api/products.js
touch src/services/api/orders.js
touch src/services/api/payments.js
touch src/services/storage/localStorage.js
touch src/services/notifications/push.js

# Create utility files
touch src/utils/helpers/format.js
touch src/utils/helpers/validation.js
touch src/utils/helpers/dom.js
touch src/utils/constants/config.js
touch src/utils/constants/routes.js
touch src/utils/validators/forms.js

# Create component files
touch src/components/common/header.js
touch src/components/common/footer.js
touch src/components/common/loading.js
touch src/components/common/modal.js
touch src/components/auth/loginForm.js
touch src/components/auth/registerForm.js
touch src/components/navigation/bottomNav.js
touch src/components/navigation/sidebar.js
touch src/components/product/productCard.js
touch src/components/product/productGrid.js
touch src/components/product/searchBar.js
touch src/components/cart/cartItem.js
touch src/components/cart/cartSummary.js
touch src/components/order/orderCard.js
touch src/components/order/orderStatus.js

# Create configuration files
touch config/firebase.json
touch config/tailwind.config.js
touch package.json
touch .gitignore
touch README.md

# Create PWA files
touch manifest.json
touch sw.js

# Create basic package.json
cat > package.json << 'EOF'
{
  "name": "rushbox-delivery-app",
  "version": "1.0.0",
  "description": "RushBox - Fast Delivery Service Customer App",
  "main": "index.html",
  "scripts": {
    "dev": "npx live-server --port=3000 --host=localhost",
    "build": "npm run build-css",
    "build-css": "npx tailwindcss -i ./src/styles/main.css -o ./dist/styles.css --watch",
    "deploy": "firebase deploy"
  },
  "keywords": ["delivery", "pwa", "firebase", "tailwind"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "live-server": "^1.2.2",
    "tailwindcss": "^3.3.0"
  },
  "dependencies": {
    "firebase": "^10.0.0"
  }
}
EOF

# Create basic .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.production

# Firebase
.firebase/
firebase-debug.log

# Build files
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Temporary files
tmp/
temp/
EOF

# Create basic README.md
cat > README.md << 'EOF'
# RushBox Delivery App

A modern, mobile-first delivery service application built with HTML, CSS (Tailwind), JavaScript, and Firebase.

## Tech Stack
- **Frontend**: HTML5, CSS3, Tailwind CSS, JavaScript ES6+
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **PWA**: Service Workers, Web App Manifest

## Project Structure
```
rushbox-delivery-app/
├── index.html              # Main entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── package.json            # Dependencies
├── src/
│   ├── pages/              # HTML pages
│   ├── components/         # Reusable components
│   ├── styles/            # CSS files
│   ├── js/                # JavaScript modules
│   ├── services/          # API and Firebase services
│   └── utils/             # Helper utilities
├── assets/                # Images, icons, logos
└── config/                # Configuration files
```

## Getting Started
1. Install dependencies: `npm install`
2. Setup Firebase configuration
3. Run development server: `npm run dev`
4. Build for production: `npm run build`

## Features
- Mobile-first responsive design
- Firebase authentication
- Real-time product catalog
- Shopping cart functionality
- Order tracking
- PWA capabilities
EOF

# Create basic Tailwind config
cat > config/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ec',
          100: '#fdecd3',
          200: '#fad5a5',
          300: '#f7b96d',
          400: '#f39c12', // Main orange
          500: '#e67e22',
          600: '#d35400',
          700: '#b7472a',
          800: '#92542a',
          900: '#744725',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#2c3e50', // Main dark
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [],
}
EOF

echo ""
echo "✅ RushBox project structure created successfully!"
echo ""
echo "📁 Project structure:"
echo "├── 📄 HTML pages (login, dashboard, catalog, etc.)"
echo "├── 🎨 CSS files with Tailwind setup"
echo "├── 📱 JavaScript modules (auth, cart, products)"
echo "├── 🔥 Firebase service files"
echo "├── 🛠️ Utility functions and helpers"
echo "├── 📦 Package.json with dependencies"
echo "└── 🚀 PWA configuration files"
echo ""
echo "🔄 Next steps:"
echo "1. cd rushbox-delivery-app"
echo "2. npm install"
echo "3. Setup your Firebase configuration"
echo "4. npm run dev (to start development server)"
echo ""
echo "🎉 Ready to start building your RushBox delivery app!"