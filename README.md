# Chatter

A real-time chat application that allows users to communicate instantly in one-on-one conversations.

## Features

- **Real-time Messaging:** Instant messaging between users.
- **User Authentication:** Secure user authentication with signup, login, and logout functionality using JWT.
- **Profile Customization:** Users can update their profile pictures.
- **User Discovery:** A sidebar lists all registered users, making it easy to start a conversation.
- **Private Conversations:** All conversations are private between two users.
- **Responsive UI:** The application is designed to be responsive and work on various screen sizes.
comm
## Tech Stack

### Frontend

- **Framework:** React.js with Vite
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Icons:** Lucide React

### Backend

- **Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcrypt
- **Image Storage:** Cloudinary

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SubhashRelangi/chat-app.git
    cd chat-app
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```

### Environment Variables

The backend requires the following environment variables. Create a `.env` file in the `backend` directory and add the following:

```
PORT=5005
MONGODB_URL=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

### Running the Application

1.  **Start the backend server:**
    ```bash
    cd backend
    npm start
    ```

2.  **Start the frontend development server:**
    ```bash
    cd ../frontend
    npm run dev
    ```

The application will be available at `http://localhost:5173`.

## API Endpoints

### Auth

- `POST /auth/signup`: Register a new user.
- `POST /auth/login`: Login a user.
- `POST /auth/logout`: Logout a user.
- `GET /auth/check`: Check if a user is authenticated.
- `PUT /auth/update-profile`: Update user's profile picture.

### Messages

- `GET /messages/:id`: Get messages with a specific user.
- `POST /messages/:id`: Send a message to a specific user.
- `GET /messages/users`: Get all users for the sidebar.

## Usage

1.  Register for a new account or log in with an existing one.
2.  Click on a user from the sidebar to start a conversation.
3.  Start sending and receiving messages in real-time.
4.  Go to the profile page to update your profile picture.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
