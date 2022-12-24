const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const envVars = require('../../env-vars');
const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email}).exec()
    .then(emails => {
        if (emails.length > 0) {
            res.status(409).json({error: 'Email taken'});
        }
        else {
            bcrypt.hash(req.body.password, 10)
                .then(hash => {
                    new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    })
                    .save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({message: 'User created'})
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({error: err})
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({error: err});
                });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: 'Failed to check if email is taken'})
    })
});


router.post('/login', (req, res, next) => {
    User.find({email: req.body.email}).exec()
        .then(users => {
            if (users.length !== 1) {
                res.status(401).json({message: 'Auth failed'});
            }
            else {
                const user = users[0];
                bcrypt.compare(req.body.password, user.password)
                    .then(result => {
                        if (result) {
                            const token = jwt.sign({email: user.email, id: user._id,}, 
                                envVars.jwtKey,
                                { expiresIn: "1h" }
                            );
                            res.status(200).json({
                                message: 'Auth successful',
                                token: token
                            });
                        }
                        else {
                            res.status(401).json({message: 'Auth failed'});
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({error: err});
                    });
            }
        })
        .catch(error => res.status(500).json({error: error}))
});

router.delete('/:userId', (req, res, next) => {
    User.findOneAndRemove({_id: req.params.userId}).exec()
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({error: error}))
});

module.exports = router;