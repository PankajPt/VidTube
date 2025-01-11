# Video Tube

### A modern and feature-rich video streaming platform built using the MERN stack (MongoDB, Express.js, React.js, Node.js). Video Tube allows users to seamlessly upload, watch, like, comment, and share videos.

## Features

### User Authentication: Secure login and registration with JWT-based authentication.
### Video Upload: Users can upload videos with titles, descriptions, and tags.
### Video Streaming: Watch videos with smooth playback using progressive streaming.
### Comments and Likes: Engage with video content through comments and likes.
### Search and Filter: Find videos using keywords, tags, and categories.
### Responsive Design: Optimized for mobile, tablet, and desktop devices.

## Tech Stack

### Frontend: React.js, Tailwind CSS/Material-UI (optional)
### Backend: Node.js, Express.js
### Database: MongoDB
### Cloud Storage: AWS S3/Cloudinary for video and thumbnail storage
### Authentication: JSON Web Tokens (JWT)

## Installation

## 1. Clone the repository:
```
git clone https://github.com/PankajPt/VidTube
cd VidTube
```

## 2. Install dependencies:
```
cd VidTube
npm install
```

## 3. Set up environment variables:
```
PORT=1234
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@sample.mongodb.net/?retryWrites=true&w=majority&appName=sample
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=private_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=private_key
REFRESH_TOKEN_EXPIRY=1d
CLODINARY_CLOUD_NAME=cloud_name
CLODINARY_API_KEY=api_key
CLODINARY_API_SECRET=cloudinary_secret
```

## 4. Start the development servers:

```
cd VidTube
npm run dev
```

## 5. Open your browser and visit:

```
http://localhost:PORT
```
# Folder Structure

```
VidTube/
├── public/                 # Static assets
├── src/                    # Express backend
│   ├── db/                 # Database-related files
│   │   └── index.js        # Database connection setup
│   ├── controllers/        # Controllers handle request logic
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── subscribe.controller.js
│   │   ├── like.controller.js
│   │   ├── comment.controller.js
│   ├── models/             # Mongoose models for MongoDB
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── subscription.model.js
│   ├── routes/             # Express route handlers
│   │   ├── user.route.js
│   │   ├── video.route.js
│   │   ├── subscribe.route.js
│   ├── middleware/         # Middleware for processing requests
│   │   ├── auth.middleware.js
│   │   ├── multer.middleware.js
│   │   ├── ownerPermissionHandler.middleware.js
│   ├── utils/              # Utility functions and helpers
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── cloudinary.js
│   ├── app.js              # Express app initialization
│   ├── constants.js        # Application constants
│   └── index.js            # Main entry point for the app
├── .env                    # Environment variables
├── .gitignore              # Git ignored files
├── package.json            # Node.js project dependencies
└── README.md               # Project documentation
```

## Future Enhancements
### Add playlists, watch-history and subscriptions.
### Enable live streaming functionality.
### Integrate video analytics for creators.
### Implement advanced search and recommendation algorithms.

