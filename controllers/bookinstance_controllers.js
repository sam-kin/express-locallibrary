let Bookinstance = require('../models/bookinstance');
let Book = require('../models/book');

let async = require('async');
let {body, validationResult} = require('express-validator/check');
let {sanitizeBody} = require('express-validator/filter');

//Get the list of the bookinstance
exports.bookinstance_list = function (req, res, next) {
    async.parallel({
        bookinstances: function (callback) {
            Bookinstance.find().exec(callback);
        },
        books: function (callback) {
            Book.find().exec(callback);
        }
    }, function (err, results) {
        if (err) {return next(err);}

        res.render('bookinstance_list', {title: 'Book copies list', books: results.books, bookinstances: results.bookinstances});
    });
    
};

//Get the bookinstance detail
exports.bookinstance_detail = function (req, res, next) {
    Bookinstance.findById(req.params.id).populate('book').exec(function (err, bookinstance) {
        if (err) {return next(err);}
        res.render('bookinstance_detail', {title: bookinstance.id, bookinstance: bookinstance});
    });
};

//Get the bookinstance create form
exports.bookinstance_create_get = function (req, res, next) {
    Book.find(function (err, books) {
        if (err) {return next(err);}

        res.render('bookinstance_form', {title: 'Create a new book instance', books: books});
    });
};

//Create a new bookinstance
exports.bookinstance_create_post = [
    //Validators
    body('book', 'Book\'s name is required').trim().isLength({min: 1}),
    body('imprint', 'Book\'s imprint is required').trim().isLength({min: 1}),
    body('status', 'Book status is required').trim().isLength({min: 1}),
    body('due_back', 'Invalid due back date').optional({checkFalsy: true, nullable: true}),

    //Sanitizers
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').escape(),
    sanitizeBody('due_back').toDate(),

    //send a request
    (req, res, next) => {
        let errors = validationResult(req);

        let bookinstance = new Bookinstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        });

        if (!errors.isEmpty()) {
            res.render('book_form', {title: 'Create a new book', bookinstance: bookinstance});
        } else {
            bookinstance.save({}, function (err, prod) {
                if (err) {return next(err);}

                res.redirect(prod.url);
            });
        }
    }

];

//Get the delete page
exports.bookinstance_delete_get = function (req, res, next) {
    Bookinstance.findById(req.params.id).populate('book').exec(function (err, bookinstance) {
        if (err) {return next(err);}

        if (bookinstance === undefined) {
            res.redirect('/catalog/bookinstance');
        }

        res.render('bookinstance_delete', {title: 'Delete the copy ID: ' + bookinstance._id, bookinstance: bookinstance});
    });
};

//Delete a bookinstance
exports.bookinstance_delete_post = function (req, res, next) {
    Bookinstance.findByIdAndRemove(req.params.id, function (err, bookinstance) {
        if (err) {return next(err);}

        if (bookinstance === undefined) {
            res.redirect('/catalog/bookinstance');
        }

        res.render('bookinstance_delete', {message: 'This istance of the book is completely deleted'});
    });
};

//Get the update page 
exports.bookinstance_update_get = function (req, res, next) {
    async.parallel(
        {
            bookinstance: function (callback) {
                Bookinstance.findById(req.params.id).populate('book').exec(callback);
            },
            books: function (callback) {
                Book.find().exec(callback);
            }
        }, function (err, results) {
            if (err) {return next(err);}
    
            if (results.bookinstance === undefined) {
                res.redirect('/catalog/bookinstance');
            }
    
            res.render('bookinstance_form', {title: 'Up date ' + results.bookinstance._id, books: results.books, bookinstance: results.bookinstance});
        }
    );
    
};

//Update a bookinstance
exports.bookinstance_update_post = [
     //Validators
     body('book', 'Book\'s name is required').trim().isLength({min: 1}),
     body('imprint', 'Book\'s imprint is required').trim().isLength({min: 1}),
     body('status', 'Book status is required').trim().isLength({min: 1}),
     body('due_back', 'Invalid due back date').optional({checkFalsy: true, nullable: true}),
 
     //Sanitizers
     sanitizeBody('book').escape(),
     sanitizeBody('imprint').escape(),
     sanitizeBody('status').escape(),
     sanitizeBody('due_back').toDate(),
 
     //send a request
     (req, res, next) => {
         let errors = validationResult(req);
 
         let bookinstance = new Bookinstance({
             book: req.body.book,
             imprint: req.body.imprint,
             status: req.body.status,
             due_back: req.body.due_back,
             _id: req.params.id
         });
 
         if (!errors.isEmpty()) {
             res.render('book_form', {title: 'Create a new book', bookinstance: bookinstance});
         } else {
             Bookinstance.findByIdAndUpdate(req.params.id, bookinstance, function (err, prod) {
                 if (err) {return next(err);}
 
                 res.redirect(prod.url);
             });
         }
     }
];
