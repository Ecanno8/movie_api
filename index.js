const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');
const cors = require('cors');
const passport = require('passport');
require('./passport');

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

// Middleware
app.use(bodyParser.json());
app.use(morgan('dev'));

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'http://localhost:56418', 'https://qmovieflix.netlify.app', 'http://localhost:4200', 'https://ecanno8.github.io', 'https://ecanno8.github.io/MyFlix-AngularApp/', 'http://ec2-3-80-244-122.compute-1.amazonaws.com/', 'http://3.80.244.122/', 'http://cfcloudcomputingwebsite.s3-website-us-east-1.amazonaws.com/', 'http://cccfmovieapi.s3-website-us-east-1.amazonaws.com/', 'http://cccfmovieapi.s3-website-us-east-1.amazonaws.com'];

// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
//             let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
//             return callback(new Error(message), false);
//         }
//         return callback(null, true);
//     }
// }));
app.use(cors());


let auth = require('./auth')(app);

/**
 * @route GET /
 * @group Root - Welcome endpoint
 * @returns {string} 200 - Welcome message
 */
app.get("/", (req, res) => {
    res.send("Welcome to MyFlix!");
});

/**
 * @route GET /movies
 * @group Movies - Operations about movies
 * @returns {Array<Movie>} 200 - An array of movie objects
 * @returns {Error} 500 - Unexpected error
 * @security JWT
 */
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

/**
 * @route GET /users
 * @group Users - Operations about users
 * @returns {Array<User>} 200 - An array of user objects
 * @returns {Error} 500 - Unexpected error
 * @security JWT
 */
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

/**
 * @route GET /users/:Username
 * @group Users - Operations about users
 * @param {string} Username.path.required - Username of the user
 * @returns {User} 200 - A user object
 * @returns {Error} 500 - Unexpected error
 * @security JWT
 */
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

/**
 * @route GET /movies/:Title
 * @group Movies - Operations about movies
 * @param {string} Title.path.required - Title of the movie
 * @returns {Movie} 200 - A movie object
 * @returns {Error} 500 - Unexpected error
 * @security JWT
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movies.findOne({ Title: req.params.Title })
            .then((movie) => {
                res.json(movie);
            })
            .catch((err) => {
                res.status(500).send('Error: ' + err);
            });
    });

/**
 * @route GET /movies/genres/:Name
 * @group Movies - Operations about movies
 * @param {string} Name.path.required - Name of the genre
 * @returns {string} 200 - Description of the genre
 * @returns {Error} 404 - Genre not found
 * @returns {Error} 500 - Unexpected error
 * @security JWT
 */
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }),
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

/**
 * @route GET /movies/directors/:Name
 * @group Movies - Operations about movies
 * @param {string} Name.path.required - Name of the director
 * @returns {Director} 200 - Director object
 * @returns {Error} 500 - Unexpected error
 * @security JWT
 */
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }),
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

/**
 * @route POST /users
 * @group Users - Operations about users
 * @param {User.model} user.body.required - New user object
 * @returns {User} 201 - Created user object
 * @returns {Error} 400 - User already exists
 * @returns {Error} 422 - Validation error
 * @returns {Error} 500 - Unexpected error
 */
app.post('/users', [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists');
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                    .then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

/**
 * @route PUT /users/:Username
 * @group Users - Operations about users
 * @param {string} Username.path.required - Username of the user to update
 * @param {User.model} user.body.required - Updated user object
 * @returns {User} 200 - Updated user object
 * @returns {Error} 400 - Permission denied
 * @returns {Error} 422 - Validation error
 * @returns {Error} 500 - Unexpected error
 * @security JWT
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }

    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set: {
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
        });
});

/**
 * @route POST /users/:Username/movies/:MovieID
 * @group Users - Operations about users
 * @param {string} Username.path.required - Username of the user
 * @param {string} MovieID.path.required - ID of the movie to add to favorites
 * @returns {User} 200 - Updated user object
 * @returns {Error} 500 - Unexpected error
 * @security JWT
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }),
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

/**
 * @route DELETE /users/:Username/movies/:MovieID
 * @group Users - Operations about users
 * @param {string} Username.path.required - Username of the user
 * @param {string} MovieID.path.required - ID of the movie to remove from favorites
 * @returns {User} 200 - Updated user object
 * @returns {Error} 500 - Unexpected error
 * @security JWT
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }),
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

/**
 * @route DELETE /users/:Username
 * @group Users - Operations about users
 * @param {string} Username.path.required - Username of the user to delete
 * @returns {string} 200 - Success message
 * @returns {Error} 400 - User not found
 * @returns {Error} 500 - Unexpected error
 * @security JWT
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }),
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

/**
 * @route PUT /movies/:MovieID/image
 * @group Movies - Operations about movies
 * @param {string} MovieID.path.required - ID of the movie
 * @param {object} image.body.required - New image path
 * @returns {Movie} 200 - Updated movie object
 * @returns {Error} 400 - ImagePath is required
 * @returns {Error} 404 - Movie not found
 * @returns {Error} 500 - Unexpected error
 */
app.put('/movies/:MovieID/image', async (req, res) => {
    try {
        const movie = await Movies.findById(req.params.MovieID);

        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        if (!req.body.ImagePath) {
            return res.status(400).send('ImagePath is required');
        }

        movie.ImagePath = req.body.ImagePath;
        const updatedMovie = await movie.save();

        res.json(updatedMovie);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// TODO
// Endpoint to upload a file to the S3 'images/' folder
app.post('/resized-images', async (req, res) => {
    // if (!req.files || !req.files.image) {
    //     return res.status(400).send("No file uploaded.");
    // }
    console.log(req.file?.image?.name, req.files?.image?.name)
    res.status(200).send(req.files)

    // console.log(req.file)
    // console.log(req.files)
    // const file = req.files.image;
    // const tempDir = path.join(__dirname, 'uploads');
    // mkdirp.sync(tempDir);
    // const tempPath = path.join(tempDir, file.name);
    // file.mv(tempPath, async (err) => {
    //     if (err) return res.status(500).send(err);
    //     try {
    //         const fileStream = fs.createReadStream(tempPath);
    //         const uploadParams = {
    //             Bucket: 'cccflambucket',
    //             Key: `original_images/${file.name}`, // Ensure the path matches your S3 folder
    //             Body: fileStream,
    //         };
    //         await s3Client.send(new PutObjectCommand(uploadParams));
    //         res.send(`File uploaded successfully to ${uploadParams.Bucket}/images/${file.name}`);
    //         // for qflix API changes START
    //         // =================================
    //         // delay 3 seconds for lambda to run
    //         // list files @ `resized_images/` and save the one that matches `file.name`
    //         res.send({ "original_file": `$file.name`, "resized_file": resizedfilename })
    //         // ==================================
    //     } catch (err) {
    //         console.error("Error uploading file:", err);
    //         res.status(500).send("Error uploading file");
    //     } finally {
    //         fs.unlinkSync(tempPath);
    //     }
    // });
});

// Start Server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});
