const co = require('co');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment');

module.exports = function(models){

    var Quiz = models.Questionairre,
        User = models.User;

    const findUserQuizzes = function(username){
        return co(function*(){
            const user = yield User
                .findOne({githubUsername : username, active : true}, '-hunches')

            if (user){
                const quizzes = yield Quiz
                    .find({_user : ObjectId(user._id)})
                    .sort({createdAt : -1});

                return {
                    user,
                    quizzes : quizzes.map((quiz) => {
                        quiz.active = quiz.status != "completed";
                        quiz.cancelled = quiz.status === "cancelled";
                        return quiz;
                    })
                };
            }
            else {
                return {
                    status : "Account not active",
                    user : {},
                    quizzes : []
                }
            }
        });
    };

    const findUserData = function(username){

        return co(function*(){
            const user = yield User
                .findOne({githubUsername : username})
                .populate('hunches._mentor');

            const theUser = user.toObject();
            if(theUser.hunches){

                theUser.hunches.sort((h1, h2) => {
                    var date1 = h1.createdAt;
                    var date2 = h2.createdAt;

                    return date2.getTime() - date1.getTime();

                });

                theUser.hunches.forEach((hunch) => {
                    hunch.createdAt = moment(hunch.createdAt).format('llll');
                    switch (hunch.rating) {
                        case 1:
                            hunch.status = "danger";
                            break;
                        case 2:
                            hunch.status = "warning";
                            break;
                        case 3:
                            hunch.status = "success";
                            break;
                    }
                });

            }

            const quizzes = yield Quiz
                    .find({_user : ObjectId(user._id)})
                    .sort({createdAt : -1});

            return {
                user : theUser,
                quizzes : quizzes.map((quiz) => {
                    quiz.active = quiz.status != "completed";
                    quiz.cancelled = quiz.status === "cancelled";
                    return quiz;
                })
            };
        });
    };

    return {
        findUserQuizzes,
        findUserData
    };

};
