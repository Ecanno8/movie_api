const express = require('express'),
    morgan = require('morgan');

const app = express();

app.use(morgan('common'));

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
});

app.use(express.static('public'));

//const bodyParser = require('body-parser'),
// methodOverride = require('method-override');

//app.use(bodyParser.urlencoded({
//extended: true
//}));

//app.use(bodyParser.json());
//app.use(methodOverride());

//app.use((err, req, res, next) => {
// logic
//});


app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});