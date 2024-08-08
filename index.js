const express = require('express'),
  app = express(),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/movieDB');

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// fs module creates a write stream, path to the log file is specified, flag 'a' stands for append (prevents overwriting)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

// uses morgan to log all requests
app.use(morgan('combined', { stream: accessLogStream }));

// root
app.get('/', (req, res) => {
  res.send('Movie API Homepage');
});

// 1 get all movies - new
app.get('/movies', async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// 2 get movie by title - new
app.get('/movies/:Title', async (req, res) => {
  await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// 3 get genre by name - new
app.get('/movies/genres/:GenreName', async (req, res) => {
  await Movies.find({ 'Genre.Name': req.params.GenreName })
    .then((genre) => {
      res.json(genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// 4 get director by name
app.get('/movies/directors/:DirectorName', async (req, res) => {
  await Movies.find({ 'Director.Name': req.params.DirectorName })
    .then((director) => {
      res.json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
})

// 5 add a user - new
/* expects JSON in this format
{
  "ID": Integer,
  "Username": "String",
  "Password": "String",
  "Email": "String",
  "Birthday": "Date"
} */
app.post('/users', async (req, res) => {
  // attempt to find a user with the given username in the database
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        // if username is taken
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        // if username is availible, creates a document
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
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

// get all users - new
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

// get a user by username - new
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

// 6 update user info - new
/* TODO: come back to these comments after exercise 2.9
FIXME: allows user to update username to one that already exists, creating multiple users with the same username
FIXME: even worse, if you include password, email or any other information in the request body, it will update the first user that it finds with that username
FIXME: exercise specifies that the response the username, password and email are required, however, it works if I just include a username, which makes sense because there is no code in place to require any other information */
/* expects JSON in this format
{
  "Username": "String",
  (required)
  "Password": "String",
  (required)
  "Email": "String",
  (required)
  "Birthday": "Date"
} */
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }
  ) // ensures updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// 7 add movie to favorites - new
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { favoriteMovies: req.params.MovieID }
  },
    { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// 8 delete movie from favorites - new
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { favoriteMovies: req.params.MovieID }
  },
    { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// 9 delete user - new
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found.');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// uses express.static to serve the documentation file
app.use(express.static(path.join(__dirname, 'public')));

// error handling function to log all app level errors to terminal, is placed last in the chain of middleware and after all instances of app.use and route calls, but before listener
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .send('Something went wrong on our end. Please try again later.');
});

// listen for requests
app.listen(8080, () => {
  console.log('Listening on port 8080');
});
