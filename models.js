const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  genre: {
    name: String,
    description: String
  },
  director: {
    name: String,
    bio: String,
    birthYear: Number,
    deathYear: Number
  }
  // imagePath: String,
  // featured: Boolean
});

let userSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true}, // todo: add an error message "username taken"
  password: {type: String, required: true},
  email: {type: String, required: true, unique: true}, // todo: add an error message "email already in use"
  birthday: Date,
  favoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
  // ref: 'model name in Mongoose' when Mongoose fetches from db it lowercase & pluralizes the model name (collection naming best practice: lowercase, not plural)
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema)

module.exports.Movie = Movie;
module.exports.User = User;