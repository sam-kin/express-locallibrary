let Author = require('../models/author');
let Book = require('../models/book');

let async = require('async');
let {body, validationResult} = require('express-validator/check');
let {sanitizeBody} = require('express-validator/filter');

//Get the author list from the database
exports.author_list_get = function (req, res, next) {
    Author.find().exec(function (err, author) {
        if (err) {return next(err);}

        res.render('author_list', {title: 'Author list', authors: author});
    });        
};

//Get the author detail
exports.author_detail = function (req, res, next) {

    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id).exec(callback);
        },
        book: function (callback) {
            Book.find({'author': req.params.id}).exec(callback);
        }
    }, function (err, results) {
        if (err) {return next(err);}

        if (results.author === undefined) {
            res.redirect('/catalog/author');
        }

        res.render('author_detail', {title: results.author.name, author: results.author, books: results.book});
    });

};

//Get the create auther form 
exports.author_create_get = function (req, res, next) {
    res.render('author_form', {title: 'Create a new author'});
};

//Create a new author
exports.author_create_post = [
    //validators
    body('first_name', 'Author first name is required').trim().isLength({min: 1}),
    body('last_name', 'Author familly name is required'). trim().isLength({min: 1}),
    body('date_of_birth', 'Invalid date of birth').optional({checkFalsy: true}),
    body('date_of_death', 'Invalid date of death').optional({checkFalsy: true, nullable: true}),

    //Sanitizers
    sanitizeBody('first_name').escape(),
    sanitizeBody('last_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    //req
    (req, res, next) => {

        let errors = validationResult(req);

        let author = new Author({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: (req.body.date_of_death===undefined)? '':req.date_of_death
        });

        if (!errors.isEmpty()) {
            res.render('author_form', {title: 'Create new author', author: author});
        } else {
            author.save({}, function (err, prod) {
                if (err) {return next(err);}

                res.redirect(prod.url);
            });
        }
    }
];

//Get author delete page
exports.author_delete_get = function (req, res, next) {
    Author.findById(req.params.id).exec(function (err, author) {
        if (err) {return next(err);} 

        if (author === undefined) {

        }

        res.render('author_delete', {title: 'Delete' + author.name, author:author});
    });
};

// Delete author
exports.author_delete_post = function (req, res, next) {
    // alert('Do you really want to delete this author ? \nNotice that all his books will be deleted too.');

    async.parallel({
        books: function (callback) {
            Book.find({'author': req.params.id}).exec(callback);
        },
        author: function (callback) {
            Author.findByIdAndRemove(req.params.id).exec(callback);
        }
    }, function (err, results) {
        if (err) {return next(err);}

        function callb(err) {
            if (err) {return next(err);}
        }

        if (results.books.length > 0) {
            for (let i = 0; i < results.books.length; i++) {
                Book.findByIdAndRemove(results.books[i]._id, callb);
            }
        }

        res.render('author_delete', {title: 'Delete an author', message: 'Author has been successfully deleted.'});
    });

};

//Get the author form for update
exports.author_update_get = function (req, res, next) {
    Author.findById(req.params.id).exec(function (err, author) {
        if (err) {return next(err);}

        res.render('author_form', {title: 'Update author', author: author});
    });
};

//Update an author
exports.author_update_post =[
     //validators
     body('first_name', 'Author first name is required').trim().isLength({min: 1}),
     body('last_name', 'Author familly name is required'). trim().isLength({min: 1}),
     body('date_of_birth', 'Invalid date of birth').optional({checkFalsy: true}),
     body('date_of_death', 'Invalid date of death').optional({checkFalsy: true, nullable: true}),
 
     //Sanitizers
     sanitizeBody('first_name').escape(),
     sanitizeBody('last_name').escape(),
     sanitizeBody('date_of_birth').toDate(),
     sanitizeBody('date_of_death').toDate(),
 
     //req
     (req, res, next) => {
 
         let errors = validationResult(req);
 
         let author = new Author({
             first_name: req.body.first_name,
             last_name: req.body.last_name,
             date_of_birth: req.body.date_of_birth,
             date_of_death: (req.body.date_of_death===undefined)? '':req.date_of_death,
             _id: req.params.id
         });
 
         if (!errors.isEmpty()) {
             res.render('author_form', {title: 'Create new author', author: author});
         } else {
             Author.findByIdAndUpdate(req.params.id, author, function (err, prod) {
                 if (err) {return next(err);}
 
                 res.redirect(prod.url);
             });
         }
     }
];