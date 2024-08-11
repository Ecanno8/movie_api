# myFlix Client

## Overview

`myFlix` is a single-page application (SPA) built with React, Parcel, and Bootstrap. It provides a rich user experience for exploring movies, viewing details, and managing user profiles. This project is designed to work with an existing server-side REST API and database.

## Features

### Essential Views & Features

- **Main View**
  - Displays all movies with an image, title, and description.
  - Includes a search feature to filter the list of movies.
  - Allows users to select a movie for more details.
  - Provides a log-out option.
  - Navigation to the Profile view.

- **Single Movie View**
  - Shows detailed information about a single movie, including description, genre, director, and image.
  - Allows users to add the movie to their list of favorites.

- **Login View**
  - Allows users to log in with a username and password.

- **Signup View**
  - Enables new users to register with a username, password, email, and date of birth.

- **Profile View**
  - Displays user registration details.
  - Allows users to update their information (username, password, email, date of birth).
  - Shows favorite movies.
  - Allows users to remove movies from their list of favorites.
  - Provides an option for users to deregister.

### Optional Views & Features

- **Actors View**
  - Displays information about different actors.

- **Genre View**
  - Provides data about a genre, including name and description.
  - Displays example movies for each genre.

- **Director View**
  - Shows data about a director, including name, bio, birth year, and death year.
  - Displays example movies from the director.

- **Enhanced Single Movie View**
  - Allows users to view actors starring in the movie.
  - Provides more information about movies, such as release date and rating.
  - Allows users to access genre descriptions and director bios without leaving the view.
  - Enables users to share a movie and view related or similar movies.

- **Enhanced Main View**
  - Provides sorting options for movies based on different criteria.

- **Enhanced Profile, Single Movie, and Main Views**
  - Allows users to create a “To Watch” list in addition to their “Favorite Movies” list.

## Technical Requirements

- **Single-Page Application (SPA):** The app uses React and state routing for navigation between views.
- **Search Functionality:** Users can filter movies using a search feature.
- **Build Tool:** Parcel is used as the build tool.
- **Styling:** Bootstrap is used for UI styling and responsiveness.
- **React Version:** The application is built using React library and ES2015+.
- **Function Components:** The app contains function components.
- **State Management (Optional):** React Redux may be used for managing state (e.g., filtering movies).
- **Hosting:** The application is hosted online.

## Setup Instructions

### Prerequisites

Ensure you have Node.js and npm installed on your machine. You can download them from [Node.js](https://nodejs.org/).

### Installation

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd myFlix


## Dependencies

The project uses the following dependencies:

### Backend Dependencies

- **`bcrypt`**: For hashing passwords.
- **`body-parser`**: To parse incoming request bodies.
- **`cors`**: For enabling Cross-Origin Resource Sharing.
- **`express`**: For creating the server.
- **`express-validator`**: For validating request data.
- **`jsonwebtoken`**: For handling JSON Web Tokens.
- **`mongoose`**: For MongoDB interactions.
- **`morgan`**: For logging HTTP requests.
- **`passport`**: For authentication middleware.
- **`passport-jwt`**: For JWT authentication strategy.
- **`passport-local`**: For local authentication strategy.
- **`uuid`**: For generating unique identifiers.

### Development Dependencies

- **`nodemon`**: For automatically restarting the server during development.
