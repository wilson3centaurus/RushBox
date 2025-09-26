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
