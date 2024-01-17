const express = require('express');
bodyParser = require('body-parser');
uuid = require("uuid");

const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');

mongoose.connect('mongodb://127.0.0.1:27017/[qflixdb]').
    catch(error => handleError(error));

// Or:
try {
    mongoose.connect('mongodb://127.0.0.1:27017/[qflixdb]');
} catch (error) {
    handleError(error);
}

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

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
//default text response when at /
app.get("/", (req, res) => {
    res.send("Welcome to MyFlix!");
});

// Get all movies
app.get('/movies', (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("error: " + err);
        });
});

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


//  Get a single movie by title
app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then(movie => {
            res.json(movie);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

// Get Genre by Name
app.get('/genres/:Name', (req, res) => {
    Genres.findOne({ Name: req.params.Name })
        .then(genre => {
            res.json(genre.Description);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

// Get Director by Name
app.get('/directors/:Name', (req, res) => {
    Directors.findOne({ Name: req.params.Name })
        .then(director => {
            res.json(director);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
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
// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(‘Error: ’ + err);
        })

});

//Add movie to favorites
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(‘Error: ’ + err);
        });
});

// Remove a movie from favorites
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
    try {
        const updatedUser = await Users.findOneAndUpdate(
            { Username: req.params.Username },
            { $pull: { FavoriteMovies: req.params.MovieID } },
            { new: true }
        );

        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// Delete a user by username
app.delete('/users/:Username', async (req, res) => {
    await Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
//Start Server
app.listen(port, () => {
    console.log('Your app is listening on port 8080');
});