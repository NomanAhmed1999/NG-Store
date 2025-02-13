const { expressjwt: expressJwt } = require('express-jwt')

// ...existing code...

function authJwt(){
    const secret = process.env.JWT_SECRET;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        userProperty: 'auth',
        isRevoked: isRevoked
    }).unless({
        path: [
            {url: /\/public\/uploads\/(.*)/, method: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/products\/(.*)/, method: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/categories\/(.*)/, method: ['GET', 'OPTIONS']},
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    })
}

async function isRevoked(req, payload) {
    if(!payload.isAdmin){
        return false
    }
    
    return true
    
}

module.exports = authJwt;
