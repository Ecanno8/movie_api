const express = require('express');
bodyParser = require('body-parser');
uuid = require("uuid");

const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');

const { check, validationResult } = require('express-validator');


const CONNECTION_URI = 'mongodb+srv://MovieFlixAdmin:gogB4Y4RYjfQu3UH@movieflix.s7vgm2e.mongodb.net/movieapi?retryWrites=true&w=majority';
mongoose.connect(CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to the database');
    })
    .catch((error) => {
        console.error('Error connecting to the database: ' + error);
    });


const Movies = Models.Movie;
const Users = Models.User;


const app = express();

//Middleware
app.use(bodyParser.json());
app.use(morgan('dev'));

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'http://localhost:56418'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));


let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.get("/", (req, res) => {
    res.send("Welcome to MyFlix!");
});

// Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
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
app.get('/users', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
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
app.get('/users/:Username', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
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
app.get('/movies/:Title',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movies.findOne({ Title: req.params.Title })
            .then((movie) => {
                res.json(movie);
            })
            .catch((err) => {
                res.status(500).send('Error: ' + err);
            });
    });


// Get Genre by Name
app.get('/movies/genres/:Name',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.findOne({ 'Genre.Name': req.params.Name })
            .then((movie) => {
                if (!movie) {
                    return res.status(404).json({ error: 'Genre not found.' });
                }
                res.status(200).json(movie.Genre.Description);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err.message);
            });
    });

// Get Director by Name
app.get('/movies/directors/:Name',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.findOne({ 'Director.Name': req.params.Name })
            .then(director => {
                res.status(200).json(director.Director);
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
app.post('/users', [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
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
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    // CONDITION TO CHECK ADDED HERE
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: req.body.hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error: ' + err);
        })
});




//Add movie to favorites
app.post('/users/:Username/movies/:MovieID',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
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
app.delete('/users/:Username',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
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

// Update movie image path by ID
app.put('/movies/:MovieID/image', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Find the movie by its ID
        const movie = await Movies.findById(req.params.MovieID);

        // Check if the movie exists
        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        // Check if the request body contains the required fields
        if (!req.body.ImagePath) {
            return res.status(400).send('ImagePath is required');
        }

        // Update the movie's image path
        movie.ImagePath = req.body.ImagePath;
        const updatedMovie = await movie.save();

        res.json(updatedMovie);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});


//Start Server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});