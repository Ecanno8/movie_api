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


const app = express();
const port = 8080

//Middleware
app.use(bodyParser.json());
app.use(morgan('dev'));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.get("/", (req, res) => {
    res.send("Welcome to MyFlix!");
});

// Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
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
    Movies.findOne({ 'Genre.Name': req.params.Name })
        .then(movie => {
            if (!movie) {
                //Error Handling if genre isnt name found.
                return res.status(404).json({ error: 'Genre not found' });
            }
            const genre = movie.Genre;
            res.json({ Name: genre.Name, Description: genre.Description });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error: " + err.message);
        });
});

// Get Director by Name
app.get('/directors/:Name', (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
        .then(director => {
            //
            res.json(director.Director);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error: " + err).message;
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
            res.status(500).send('Error: ' + err);
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
            res.status(500).send('Error:  ' + err);
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
    await Users.findOneAndDelete({ Username: req.params.Username })
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