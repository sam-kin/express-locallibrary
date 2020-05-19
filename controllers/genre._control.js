let Genre = require('../models/genre');
let Book = require('../models/book');

let async = require('async');
let {body, validationResult} = require('express-validator/check');
let {sanitizeBody} = require('express-validator/filter');


//Get genre create form 
exports.genre_create_get = function (req, res, next) {
    res.render('genre_form', {title: 'Create a new genre'});
};

//Create a new genre
exports.genre_create_post = [
    //validator
    body('name', 'The name of the genre is required').trim().isLength({min: 1}),

    //Sanitizer
    sanitizeBody('name').escape(),

    //sent a req
    (req, res, next) => {
        let errors = validationResult(req);

        let genre = new Genre({
            name: req.body.name
        });

        if (!errors.isEmpty()) {
            res.render('genre_form', {title: 'Create a new genre', genre: genre, errors: errors.array()});
        } else {
            Genre.find({'name': genre.name}, function (err, result) {
                if (err) {return next(err);}
                
                if (result.length > 0) {
                    res.redirect(result[0].url);
                } else {
                    genre.save({}, function (err, prod) {
                        if (err) {return next(err);}
        
                        res.redirect(prod.url);
                    });
                }
            });

        }
    }
];

//Get the list of all genres
exports.genre_list = function (req, res, next) {
    Genre.find().exec(function (err, genres) {
        if (err) {return next(err);}

        res.render('genre_list', {title: 'Genre list', genres: genres});
    });
};

//Get the single genre details page
exports.genre_detail = function (req, res, next) {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        books: function (callback) {
            Book.find({'genre': req.params.id}).exec(callback);
        }
    }, function (err, results) {
        if (err) {return next(err);}

        if (results.genre === undefined) {
            res.redirect('/catalog/genre');
        }

        res.render('genre_detail', {title: results.genre.name + ' Detail', genre: results.genre, books: results.books});
    });
};

//Get the genre update page
exports.genre_update_get = function (req, res, next) {
    Genre.findById(req.params.id, function (err, genre) {
        if (err) {return next(err);}

        if (genre === undefined) {
            res.redirect('/catalog/genre');
        }

        res.render('genre_form', {title: 'Update ' + genre.name, genre: genre});
    });
};

//Update the genre
exports.genre_update_post = [
    //validator
    body('name', 'Genre name is required').trim().isLength({min: 1}),

    //sanitizer
    sanitizeBody('name').escape(),

    //send a req
    (req, res, next) => {
        let errors = validationResult(req);

        let genre = new Genre({
            name: req.body.name,
            _id: req.params.id
        });
        
        if (!errors.isEmpty()) {
            res.render('genre_form', {title: 'Update ' + genre.name, errors: errors.array(), genre: genre});
        } else {
            Genre.findByIdAndUpdate(req.params.id, genre, function (err, newGenre) {
                if (err) {return next(err);}

                res.redirect(newGenre.url);
            });
        }
    }
];

//Get the delete page
exports.genre_delete_get = function (req, res, next) {
    async.parallel({
        books: function (callback) {
            Book.find({'genre': req.params.id}).exec(callback);
        },
        genre: function (callback) {
            Genre.findById(req.params.id).exec(callback);
        }
    }, function (err, results) {
        if (err) {return next(err);}

        let sentBooks = [];
        for (let i = 0; i < results.books.length; i++) {
            if (results.books[i].genre.length === 1) {
                sentBooks.push(results.books[i]);
            }
        }

        res.render('genre_delete', {title: 'Delete genre ' + results.genre.name, genre: results.genre, books: sentBooks});
    });
     
};

//Delete the genre
exports.genre_delete_post = function (req, res, next) {
    async.parallel(
        {
            books: function (callback) {
                Book.find({'genre': req.params.id}, function (err, books) {
                    if (err) {return next(err);}

                    function callb (err) {
                        if (err) {return next(err);}
                    }
                    if (books.length > 0) {
                        for (let i = 0; i < books.length; i++) {
                            Book.findByIdAndRemove(books[i].id, callb);
                        }
                    }                   
                }).exec(callback);
            },
            genre: function (callback) {
                Genre.findByIdAndRemove(req.params.id).exec(callback);
            }
        }, function (err, results) {
            if (err) {return next(err);}

            res.render('genre_delete', {title: 'Delete a genre', message: 'This genre has been successfully deleted'});
        }
    );
};