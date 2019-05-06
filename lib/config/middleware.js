'use strict';

const jwt = require('jsonwebtoken');
const getPublicKey = require('../utils/fetch_public_key');

function getToken(headers) {
  if (headers && headers.authorization) {
    //console.log(headers.authorization);
    let parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    }
  }
}

function verifyToken(req, res, next){
  let token = getToken(req.headers)
  if (!token) {
   res.status(401).send({message: 'No token provided.'});
 } else{
   let config = {
     audience: 'wury.co.id',
     issuer: 'api.wury.auth.com'
   };
   getPublicKey().then(publicKey => {
     jwt.verify(token, publicKey, config, (err, decoded) => {
       if (err) {
        if(err.name === 'TokenExpiredError'){
          res.status(401).send({message: 'Access token expired', active:'false'});
        } else {
          res.status(401).send({message: 'Token is not valid', active:'false'});
        }
      } else {
        let id = decoded.sub;
        req.userOrClientId = id.substring(3); // extract the user Id from the string...
        next();
      }
     });
   }).catch(err => {
     res.status(500).send({message: 'Error occurred', active:'false'});
   });
 }
}

module.exports = {
  verifyToken: verifyToken
};
