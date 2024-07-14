const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

app.use(bodyParser.json());

let movies = [
    {
        Title: 'Inception',
        Description:
            'A skilled thief is given a chance at redemption if he can successfully perform an inception.',
        Genre: {
            Type: 'Science Fiction',
            Description:
                'A genre dealing with imaginative and futuristic concepts such as advanced science and technology, space exploration, time travel, and extraterrestrial life.',
        },
        Director: {
            Name: 'Christopher Nolan',
            Bio: 'Christopher Nolan is a British-American film director, screenwriter, and producer known for his cerebral, often non-linear storytelling.',
            Born: 1970,
            Died: null,
        },
    },
    {
        Title: 'The Shawshank Redemption',
        Description:
            'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        Genre: {
            Type: 'Drama',
            Description:
                'A genre that relies on the emotional and relational development of realistic characters.',
        },
        Director: {
            Name: 'Frank Darabont',
            Bio: "Frank Darabont is a French-American film director, screenwriter, and producer known for his work on adaptations of Stephen King's works.",
            Born: 1959,
            Died: null,
        },
    },
    {
        Title: 'The Godfather',
        Description:
            'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        Genre: {
            Type: 'Crime',
            Description:
                'A genre that revolves around the lives and actions of criminals and the justice system.',
        },
        Director: {
            Name: 'Francis Ford Coppola',
            Bio: 'Francis Ford Coppola is an American film director, producer, and screenwriter known for his work on The Godfather trilogy and Apocalypse Now.',
            Born: 1939,
            Died: null,
        },
    },
];

let users = [
    {
        id: 1,
        name: 'Kim',
        favoriteMovies: ['Inception'],
    },
    {
        id: 2,
        name: 'Ben',
        favoriteMovies: ['The Shawshank Redemption', 'The Godfather'],
    },
];

// fs module creates a write stream, path to the log file is specified, flag 'a' stands for append (prevents overwriting)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
    flags: 'a',
});

// uses morgan to log all requests
app.use(morgan('combined', { stream: accessLogStream }));

// root
app.get('/', (req, res) => {
    res.send('Movie API');
});

// return a list of all movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

// return data about a movie by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params; // object destructuring
    const movie = movies.find((movie) => movie.Title === title);
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).send('Movie not found.');
    }
});

// return data about a genre (description) by type
app.get('/movies/genres/:genreType', (req, res) => {
    const { genreType } = req.params;
    const genre = movies.find(movie => movie.Genre.Type === genreType).Genre;
    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(404).send('Genre not found.');
    }
});

// return data about a director by name
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;
    if (director) {
        res.status(200).json(director);
    } else {
        res.status(404).send('Director not found.');
    }
});

// allow new users to register
app.post('/users', (req, res) => {
    const newUser = req.body;
    if (!newUser.name) {
        res.status(400).send('User registration failed: Name is required.');
    } else {
        newUser.id = uuid.v4(); // accesses the v4 property of the uuid module
        users.push(newUser);
        res.status(201).json(newUser);
    }
});

// allow users to update their user id
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    let user = users.find(user => user.id == id); // array id number == url id string
    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(404).send('User not found.');
    }
});

// allow users to add a movie to their favorites
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to ${user.name}'s favorites.`);
    } else {
        res.status(404).send('User not found.');
    }
});

// allow users to remove a movie from their favorites
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from ${user.name}'s favorites.`);
    } else {
        res.status(404).send('User not found.');
    }
});

// allow existing users to deregister
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
        users = users.filter(user => user.id != id);
        res.status(200).send('User has been removed.');
    } else {
        res.status(404).send('User not found.');
    }
});

// uses express.static to serve the documentation file
app.use(express.static(path.join(__dirname, 'public')));

// error handling function to log all app level errors to terminal, is placed last in the chain of middleware and after all instances of app.use and route calls, but before listener
app.use((err, req, res, next) => {
    console.error(err.stack);
    res
        .status(500)
        .send(
            'Something went wrong on our end. Please try again later.'
        );
});

// listen for requests
app.listen(8080, () => {
    console.log('Listening on port 8080');
});
