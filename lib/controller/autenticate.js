const jwt = require('jsonwebtoken');
require('dotenv').config();
const CryptoJS = require("crypto-js");

class Autenticate {
 
    gerarNovotoken (objUser){    
        let usuarioToken = {
            id: objUser[0].id,
            key: objUser[0].fullName.length * process.env.ENC_KEY_NUMBER,
            name: objUser[0].fullName,
            user: objUser[0].user,
            type: objUser[0].type,
            password: CryptoJS.AES.encrypt(objUser[0].password, process.env.ENC_KEY).toString()            
        }     

        let token = jwt.sign(usuarioToken, process.env.API_TOKEN, {
            expiresIn: process.env.API_TOKEN_VALIDO //Em milisegundos
        });
        
        return token
    }


    getInfoUserToken(token){        
        let decoded = jwt.verify(token, process.env.API_TOKEN);
        return {
            id: decoded.id,
            name: decoded,
            user: decoded.user
        }
    }
}

module.exports = Autenticate;