// imports
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');

// initialize app
const app = express();

// db connection
// mongoose.connect('mongodb://127.0.0.1:27017/movieDB');
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// import models
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

// parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// authentication and passport setup
const cors = require('cors');
app.use(cors());
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// HTTP request log
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

app.use(morgan('combined', { stream: accessLogStream }));

app.get('/', (req, res) => {
  res.send('Movie API Homepage');
});

// 1 get all movies
app.get('/movies', passport.authenticate('jwt', {session: false}),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// 2 get movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// 3 get genre by name
app.get('/movies/genres/:GenreName', passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find({ 'Genre.Name': req.params.GenreName })
      .then((genre) => {
        res.json(genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// 4 get director by name
app.get('/movies/directors/:DirectorName', passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find({ 'Director.Name': req.params.DirectorName })
      .then((director) => {
        res.json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
      });
  }
);

//  5 add a user
app.post('/users',
  // validation logic
  [
    check('Username', 'Username must be at least 5 characters long.').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Password', 'Password must be at least 8 characters long.').isLength({ min: 8 }),
    check('Email', 'Email does not appear to be valid').isEmail(),
    check('Birthday', 'Invalid date. Enter a date in the format: MM/DD/YYYY.').isDate({ format: 'MM/DD/YYYY', strictMode: false })
  ],
  async (req, res) => {
    // check validation object for errors
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
            Birthday: req.body.Birthday,
          })
            // takes the newly created document as a param, sends the created user data in the response
            .then((user) => {
              res.status(201).json(user);
            })
            // handles errors that occur during user creation
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      // handles errors that occur as a result of Users.findOne
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// get all users
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

// get a user by username
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

//  6 update user info
/*
  allows user to update username to one that already exists, creating multiple users with the same username; if you include a password, email or any other information in the request body, it will update the first user that it finds with that username
*/
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
  // validation logic
  [
    check('Username', 'Username must be at least 5 characters long.').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password must be at least 8 characters long.').isLength({ min: 8 }),
    check('Email', 'Email does not appear to be valid').isEmail(),
    check('Birthday', 'Invalid date. Enter a date in the format: MM/DD/YYYY.').isDate({ format: 'MM/DD/YYYY', strictMode: false })
  ],
  async (req, res) => {
    // check validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true } // ensures updated document is returned
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// 7 add movie to favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { favoriteMovies: req.params.MovieID },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// 8 delete movie from favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { favoriteMovies: req.params.MovieID },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// 9 delete user
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    await Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found.');
        } else {
          res.status(200).send('Your account has been successfully deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// uses express.static to serve the documentation file
app.use(express.static(path.join(__dirname, 'public')));

// Express error handling function, logs all app level errors to terminal, place last in chain of middleware and route handlers, before listener
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .send('Something went wrong on our end. Please try again later.');
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on port ' + port);
});
