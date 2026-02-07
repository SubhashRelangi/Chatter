# Chatter

Chatter is a full-stack one-to-one chat web app built with React, Express, MongoDB, and Socket.IO.

## Core Functionality

- User signup, login, auth check, and logout using JWT in HTTP-only cookies
- Private one-to-one chat between registered users
- Text and image message support (images uploaded via Cloudinary)
- Sidebar user discovery with latest message preview
- Online user presence updates in real time
- Profile management (username and profile photo updates)
- Responsive UI for desktop and mobile

## Tech Stack

Frontend:
- React (Vite)
- Zustand (state management)
- Tailwind CSS + DaisyUI
- Axios
- React Router
- Socket.IO Client

Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT + cookie-parser
- bcrypt
- Socket.IO
- Cloudinary

## Project Structure

```text
Chatter/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── lib/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── lib/
│   └── package.json
└── package.json
```

## Prerequisites

- Node.js 18+ recommended
- npm
- MongoDB
- Cloudinary account

## Installation

1. Clone the repository.

```bash
git clone https://github.com/SubhashRelangi/chat-app.git
cd chat-app
```

2. Install root dependencies (for running frontend + backend together).

```bash
npm install
```

3. Install backend dependencies.

```bash
cd backend
npm install
```

4. Install frontend dependencies.

```bash
cd ../frontend
npm install
```

## Environment Variables

Create `backend/.env` with:

```env
PORT=5005
MONGODB_URL=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

## Running the App

Option 1: Run both servers from root.

```bash
npm run dev
```

Option 2: Run separately.

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Default URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5005`

## API Endpoints

Auth:
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/check`
- `PUT /auth/update-profile`

Messages:
- `GET /messages/users`
- `GET /messages/:id`
- `POST /messages/send/:id`

## Scripts

Root:
- `npm run dev` starts frontend and backend together

Backend:
- `npm run start` starts backend with Node
- `npm run dev` starts backend with nodemon

Frontend:
- `npm run dev` starts Vite dev server
- `npm run build` builds production assets
- `npm run preview` previews production build
- `npm run lint` runs ESLint

## Usage Flow

1. Create an account or log in.
2. Select a user from the sidebar.
3. Send text or image messages.
4. See online presence in the contact list.
5. Update profile image/username from the profile page.

## Contributing

Issues and pull requests are welcome.
