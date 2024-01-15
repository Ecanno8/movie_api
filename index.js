const express = require('express');
bodyParser = require('body-parser');
uuid = require("uuid");

const morgan = require('morgan');
//const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

mongoose.connect('mongodb://127.0.0.1:27017/test').
    catch(error => handleError(error));

// Or:
try {
    await mongoose.connect('mongodb://127.0.0.1:27017/test');
} catch (error) {
    handleError(error);
}

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Model.Director;

const app = express();
const port = 8080

//Middleware
app.use(bodyParser.json());
app.use(morgan('dev'));

//Placeholder for Movies, Genres, directors, and users
//const movies = [

//{ title: 'Movie 1', description: 'Description 1', genre: 'Action', director: 'Director 1', imageUrl: 'url1', featured: true },

//  { title: 'Movie 2', description: 'Description 2', genre: 'Drama', director: 'Director 2', imageUrl: 'url2', featured: false },
//];

//const genres = [
// { name: 'Action', description: 'Actions movies genre description' },

//  { name: 'Comedy', description: 'Drama movies genre description' },

//];

//const directors = [
//{ name: 'Director 1', bio: 'Bio 1', birthYear: 1956, deathYear: 2021 },

//  { name: 'Director 2', bio: 'Bio 2', birthYear: 1978, deathYear: null },
//];

//const users = []


// Get all users
app.get('/users', async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get a user by username
app.get('/users/:Username', async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get all movies
app.get('/movies', (req, res) => {
    res.json(movies);
});

//  Get a single movie by title
app.get('/movies/:title', (req, res) => {
    const movieTitle = req.params.title;
    const movie = movies.find((m) => m.title === movieTitle);

    if (!movie) {
        return res.status(404).json({ error: 'Movie Not Found!' });
    }

    res.json(movie);

});

// Get Genre by Name
app.get('/genres/:name', (req, res) => {
    const genreName = req.params.name;
    const genre = genres.find((g) => g.name === genreName);

    if (!genre) {
        return res.status(404).json({ error: 'Genre Not Found' });
    }

    res.json(genre);
});

// Get Director by Name
app.get('/directors/:name', (req, res) => {
    const directorName = req.params.name;
    const director = directors.find((d) => d.name === directorName);

    if (!director) {
        return res.status(404).json({ error: 'Director was Not Found!' });
    }

    res.json(director);

});

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', async (req, res) => {
    await Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

//Update user info (username)
app.put('/users/:userId', (req, res) => {
    const userId = req.params.userId;
    const { username } = req.body;

    res.json({ message: 'Users info has been updated.' });
});

//Add movie to favorites
app.post('/users/:userId/favorites', (req, res) => {
    const userId = req.params.userId;
    const { movieTitle } = req.body;

    res.json({ message: 'Movie has been add to Favorites.' });
});

// Remove a movie from favorites
app.delete('/users/:userId/favorites/:movieTitle', (req, res) => {
    const userId = req.params.userId;
    const movieTitle = req.params.movieTitle;

    res.json({ message: 'Movie has been removed from favorites.' });
});

//User deregistration
app.delete('/users/:userId', (req, res) => {
    const userId = req.params.userId;

    res.json({ message: ' User has been removed ' });
});
//Start Server
app.listen(port, () => {
    console.log('Your app is listening on port 8080');
});