# Movie API Database

The server-side component of the "Movies" web application. This backend service provides users with access to detailed information about movies, directors, and genres. Users can sign up, update their personal information, and manage a list of their favorite movies.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [License](#license)

## Key Features

- **Movies API**: Retrieve detailed information about movies, including descriptions, genres, and director details.
- **User Management**: Handle user accounts and their favorite movies.
- **Authentication**: Secure access with JWT-based authentication.
- **Swagger Documentation**: Interactive API documentation for easy reference.
- **Data Validation**: Ensures the integrity and correctness of data.

## Technologies

This application is built with the following technologies:

- **Express.js**: A web framework for Node.js.
- **MongoDB**: A NoSQL database for storing application data.
- **Mongoose**: An Object Data Modeling (ODM) library for MongoDB.
- **Passport.js**: Middleware for authentication.
- **Swagger**: Tool for API documentation.
- **Cors**: Middleware for enabling Cross-Origin Resource Sharing.
- **Bcrypt**: Library for hashing passwords.

## API Endpoints

### Movies

- **Get all movies**: `GET /movies`
- **Get a movie by title**: `GET /movies/:title`
- **Get movies by genre**: `GET /movies/Genre/:GenreName`
- **Get a director by name**: `GET /Director/:DirectorName`

### Users

- **Create a user**: `POST /users`
- **Update user information**: `PUT /users/:Username`
- **Add movie to favorites**: `POST /users/:Username/movies/:MovieID`
- **Remove movie from favorites**: `DELETE /users/:Username/movies/:MovieID`
- **Delete a user**: `DELETE /users/:Username`

## Setup

To set up this project, follow the instructions provided in the setup section. 

## Usage

Instructions on how to use the API can be found in the usage section.

## License

This project is licensed under the ISC License.

