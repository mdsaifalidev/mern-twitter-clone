# mern-twitter-clone
A full-stack Twitter clone app built using MERN stack. 

## Features

- Sign up/ Sign in via JWT Token
- Customize account
- Tweet
- Comment
- Retweet
- Follow user
- Like tweets and comments
- Edit tweets and comments
- Delete tweets and comments

## Technologies Used

- **Frontend**: Developed with React.js for a dynamic and responsive user interface.
- **Backend**: Utilizes Node.js and Express.js for efficient server-side logic.
- **Database**: MongoDB for storing user profiles, chat histories, and other essential data.
- **Authentication**: Passport.js provides a comprehensive set of strategies to support authentication using a username and password, social media logins, and more.

  ## Getting Started

### Prerequisites

- Node.js
- MongoDB
- React

### Installation

1. Clone the repository: git clone https://github.com/mdsaifalidev/mern-twitter-clone.git
2. Install backend dependencies
3. Install frontend dependencies
4. Create a `.env` file in the root directory
5. Start the server

### Setup .env file

```js
NODE_ENV=
PORT=
MONGODB_URI=
CORS_ORIGIN=
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=
SESSION_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_EMAIL=
SMTP_PASSWORD=
```

## Usage

After installation, open your web browser and navigate to `http://localhost:8000` to start using the MERN Twitter Clone.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or improvements.

## License

Distributed under the MIT License. See `LICENSE` for more information.
