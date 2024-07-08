// imports express, morgan, and the built in node modules fs and path
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express(); // initializes express

// fs module creates a write stream, path to the log file is specified, flag 'a' stands for append (prevents overwriting)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

// uses morgan to log all requests
app.use(morgan('combined', {stream: accessLogStream}));

// an array of objects formatted in json, used in a GET request below
let topMovies = [
  {
    rank: 1,
    title: 'Pretty Woman',
    starring: ['Julia Roberts', 'Richard Gere'],
    year: 1990,
  },
  {
    rank: 2,
    title: 'Runaway Bride',
    starring: ['Julia Roberts', 'Richard Gere'],
    year: 1999,
  },
  {
    rank: 3,
    title: '50 First Dates',
    starring: ['Adam Sandler', 'Drew Barrymore'],
    year: 1996,
  },
  {
    rank: 4,
    title: 'Just Go With It',
    starring: ['Adam Sandler', 'Jennifer Aniston'],
    year: 2011,
  },
  {
    rank: 5,
    title: 'Murder Mystery',
    starring: ['Adam Sandler', 'Jennifer Aniston'],
    year: '2019',
  },
  {
    rank: 6,
    title: 'Murder Mystery 2',
    starring: ['Adam Sandler', 'Jennifer Aniston'],
    year: '2023',
  },
  {
    rank: 7,
    title: 'Friends with Benefits',
    starring: ['Justin Timberlake', 'Mila Kunis'],
    year: 2011,
  },
  {
    rank: 8,
    title: 'Forgetting Sarah Marshall',
    starring: ['Kristen Bell', 'Jason Segel', 'Mila Kunis', 'Paul Rudd'],
    year: 2008,
  },
  {
    rank: 9,
    title: 'No Strings Attached',
    starring: ['Natalie Portman', 'Ashton Kutcher'],
    year: 2011,
  },
  {
    rank: 10,
    title: 'Clueless',
    starring: ['Alicia Silverstone', 'Stacey Dash'],
    year: 1995,
  },
];

// GET requests
app.get('/', (req, res) => {
  res.send('A default textual response of your choosing.');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// uses express.static to serve the documentation file
app.use(express.static(path.join(__dirname, 'public')));

// error handling function to log all app level errors to terminal, is placed last in the chain of middleware and after all instances of app.use and route calls, but before listener
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .send(
      'Well, this is embarassing... it appears our server is feeling a bit under the weather. Please try again later.'
    );
});

// listen for requests
app.listen(8080, () => {
  console.log('Listening on port 8080');
});
