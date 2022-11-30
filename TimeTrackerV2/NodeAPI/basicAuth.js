//check if user session variable is set
function authUser(req, res, next) {

    console.log(req.session.user)
    if (!req.session.user) {
        res.status(403);
        return res.send('you need to sign in');
    }
    next();
}

//check if user role meets requirements
function authRole(role) {
    return (req, res, next) => {
        console.log(req.session.user)
        if (req.session.user.loggedIn.type !== role) {
            res.status(401);
            return res.send('you do not have access');
        }
        next();
    };
}

module.exports = {
    authUser,
    authRole,
};
