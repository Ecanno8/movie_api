const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const port = 8080

//Middleware
app.use(bodyParser.json());
app.use(morgan('dev'));

//Placeholder for Movies, Genres, directors, and users
const movies = [

    { title: 'Movie 1', description: 'Description 1', genre: 'Action', director: 'Director 1', imageUrl: 'url1', featured: true },

    { title: 'Movie 2', description: 'Description 2', genre: 'Drama', director: 'Director 2', imageUrl: 'url2', featured: false },
];

const genres = [
    { name: 'Action', description: 'Actions movies genre description' },

    { name: 'Comedy', description: 'Drama movies genre description' },

];

const directors = [
    { name: 'Director 1', bio: 'Bio 1', birthYear: 1956, deathYear: 2021 },

    { name: 'Director 2', bio: 'Bio 2', birthYear: 1978, deathYear: null },
];

const users = []

// Get all movies
app.get('movies', (req, res) => {
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

app.listen(port, () => {
    console.log('Your app is listening on port ${port}');
});