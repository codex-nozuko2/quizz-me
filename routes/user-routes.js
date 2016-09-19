const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    render = require('../utilities/render'),
    reportErrors = require('../utilities/http_utilities').reportErrors;

module.exports = function(models) {

    const User = models.User;

    const listUsers = (req, res) => {
        User
            .find({})
            .then(users => render(req, res, 'users', {
                users: users
            }));
    };

    const addScreen = (req, res) => render(req, res, 'user_add');

    function validateUserDetails(req){
        req.checkBody('firstName', 'First name is required').notEmpty();
        req.checkBody('lastName', 'Last name is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('githubUsername', 'Github username is required').notEmpty();
        return req.validationErrors();
    }

    const addUser = (req, res) => {

        var errors = validateUserDetails(req);
        if (errors){
            reportErrors(req, errors);
            return res.redirect('/user/add');
        }

        var userData = req.body;
        userData.role = 'candidate';

        User(userData)
          .save()
          .then(() => res.redirect('/users'));

    };

    const showUser = function(req, res){
        var username = req.params.username;

        User.findOne({githubUsername : username})
            .then((user) => {
                var userObj = user.toJSON({virtuals : true});
                render(req, res, 'user_edit', userObj);
            });
    };

    const unknownUser = function (req, res) {
        render(req, res, 'user_unknown', {username : req.flash('username')});
    };

    const updateUser = function(req, res){
        var username = req.params.username;

        User.update({githubUsername : username}, req.body)
            .then(() => {
                res.redirect('/users');
            });
    };

    const registerUserScreen = function(req, res, next){

        var username = req.flash('new_username');
        var fullName = req.flash('fullName');

        var nameParts = fullName[0].split(' ');
        console.log(nameParts);

        var firstName = nameParts.length >= 0 ? nameParts[0] : '',
            lastName =  nameParts.length >= 1 ? nameParts[1] : '';

        render(req, res, 'user_register' , { githubUsername : username,
            firstName : firstName,
            lastName : lastName});
    };

    const registerUser = (req, res) => {

        var errors = validateUserDetails(req);
        if (errors){
            reportErrors(req, errors);
            return res.redirect('/user/register');
        }

        var userData = req.body;
        userData.role = 'candidate';

        User(userData)
          .save()
          .then(() => res.redirect('/user/registered'));

    };

    return {
        listUsers: listUsers,
        addScreen : addScreen,
        add : addUser,
        show : showUser,
        update : updateUser,
        registerUserScreen : registerUserScreen,
        registerUser : registerUser,

        unknownUser : unknownUser
    };
}
