# Movie API

This is a RESTful API that provides information about movies, genres, and directors. Users can create an account, update their information, and manage a list of favorite movies.

## Features

- Users can sign up, log in, and update their profile.
- Retrieve details about movies, genres, and directors.
- Manage a list of favorite movies.
- Secure user authentication with JWT.
  
## Technologies

- **Node.js**: Runtime environment
- **Express.js**: Framework for building the API
- **MongoDB**: Database for storing movie and user data
- **Mongoose**: ODM for MongoDB
- **JWT**: Secure authentication
- **bcrypt**: Password hashing

## Installation

1. Clone the repository:

   ```zsh
   git clone https://github.com/samanthasbytes/movie_api.git
   ```

2. Install dependencies:

   ```zsh
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in the root directory with the following:

     ```plaintext
     PORT=your_port
     DB_URI=your_mongoDB_uri
     SECRET_KEY=your_jwt_secret
     ```

4. Start the server:

   ```zsh
   npm start
   ```

5. Use `nodemon` for automatic server restarts during development:

   ```zsh
   npm run dev
   ```

## Endpoints

| Method | Endpoint             | Description                             |
|--------|----------------------|-----------------------------------------|
| GET    | `/movies`            | Get a list of all movies                |
| GET    | `/movies/:title`     | Get data about a single movie           |
| GET    | `/genres/:name`      | Get movies by genre                     |
| GET    | `/directors/:name`   | Get movies by director                  |
| POST   | `/users`             | Register a new user                     |
| PUT    | `/users/:username`   | Update user information                 |
| POST   | `/users/:username/movies/:movieId` | Add movie to favorites  |
| DELETE | `/users/:username/movies/:movieId` | Remove movie from favorites |
| DELETE | `/users/:username`   | Delete user profile                     |

## License

This project is licensed under the MIT License.

--

*This README was generated by ChatGPT-4o using the prompt "Create a README for this project https://github.com/samanthasbytes/movie_api.git"*
