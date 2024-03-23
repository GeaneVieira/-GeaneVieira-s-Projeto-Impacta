require('dotenv').config();
const restify = require('restify');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const responseErrors = require('./lib/controller/responseError');
const responseSucces = require('./lib/controller/responseSuccess');
const Autenticate = require('./lib/controller/autenticate');

const version = '/v1';
const returnSuccess = new responseSucces;
const returnErrors = new responseErrors;
const autenticacao = new Autenticate;

const API_NOME = 'Lovers Pet';
const API_URL = 'https://loverspet.dev';
const API_PORT = '3000';
const API_TOKEN = 'L0V3rS@P3t2024';
const API_TOKEN_VALIDO = '3600000';

const conn = 'mongodb://127.0.0.1:27017/loverspet';

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}


const customerSchema = new mongoose.Schema({
    pet : {
        animal: String,
        name: String,
        type: String,
        age: Number,
        size: String,
        color: String,
        breed: String,
        description: String,
    },
    tutor: {
        name: String,
        phone: String,
        email: String
    }
})

const ticketSchema = new mongoose.Schema({
    ticket : Number,
    timestamp: Number,    
    status: String,
    author: String,
    owner: Array,
    interaction: Array,
    audit: Array
});

const userSchema = new mongoose.Schema({
    user: String,
    password: {type: String, select: true, require: true},
    fullName: String,
    type: String,
    status: Number,
    email: String,
    cellPhone: String,
    audit: Array
});

const tokenSchema = new mongoose.Schema({
    timestamp : Number,
    user: String,
    token : String
});

const server = restify.createServer({
    name: process.env.API_NOME,
    url : process.env.API_URL,
    version: '0.0.1',
});

/** O Plugin bodyParser se faz necessário para receber json via post */
server.use(restify.plugins.bodyParser())
/** O Plugin queryParser se faz necessario para converter a query http em objeto */
server.use(restify.plugins.queryParser());

/** Conexão com mongodb */
mongoose.connect(conn);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const tickets = mongoose.model('tickets',ticketSchema);
const users = mongoose.model('users', userSchema);
const customer = mongoose.model('customer', customerSchema);
const tokens = mongoose.model('tokens', tokenSchema);

/** registra a criação de um novo token */
async function registerNewToken(user,token){
    let newToken = {
        timestamp : Date.now(),
        user : user,
        token : token
    }
    return await tokens.create(newToken);
}


/** Verificação do JWT */
function JWTvalidateSession(req, res,next){

    let token = req.headers['x-loverspet-token'];       
    
    if (!token){
        let nenhumTokenFornecido = returnErrors.nenhumTokenFornecido('token');
        return res.send(nenhumTokenFornecido.status, nenhumTokenFornecido);  
    }     

    try{
                
        let test = jwt.verify(token, process.env.API_TOKEN);
        next();
    }catch(err){
        let tokenInvalido = returnErrors.tokenInvalido('token');
        res.send(tokenInvalido.status, tokenInvalido);        
    }

}  

server.post('/login', async function(req,res){    
    if(req.body == undefined){
        let credenciaisNaoInformadas = returnErrors.credenciaisNaoInformadas(req.getPath());
        return res.send(credenciaisNaoInformadas.status, credenciaisNaoInformadas);
    }
        
    let user = req.body.user;
    let password  = req.body.password;
   
    let objUser = await users.find({user: user, password : password});        

    if(objUser.length == 0){
        let falhaLogin = returnErrors.authenticationFailure(req.getPath());
        res.send(falhaLogin.status, falhaLogin); 
    }else{  
        
        if(objUser[0].status){
            /** Adicionar validação para o ultimo token */
            let lastToken = await tokens.findOne({user : user}).sort({_id: -1}).exec();
           


            try{

                let decoded = jwt.verify(lastToken.token, process.env.API_TOKEN);
                
                
                /**  O Token ainda é valido, será utilizado o mesmo token até que expire  */
                let returnToken = returnSuccess.tokenGeradoComSucesso(lastToken.token)
                res.send(200, returnToken);
              
            }catch(err){                

                
                /** O Token Expirou, será criado um novo token */
                if (objUser[0]._id != undefined && objUser[0]._id != null){                                                    
                    
                    let token = autenticacao.gerarNovotoken(objUser);      
                    
                    await registerNewToken(user,token).then(function(success){
                        let returnToken = returnSuccess.tokenGeradoComSucesso(success.token)
                        res.send(200, returnToken);
                    }).catch(function(err){
                        /** Falha no login */
                        let falhaLogin = returnErrors.authenticationFailure(req.getPath())
                        res.send(falhaLogin.status, falhaLogin); 
                    })
                }else{
                    /** Falha no login */
                    let falhaLogin = returnErrors.authenticationFailure(req.getPath())
                    res.send(falhaLogin.status, falhaLogin); 
                }
            }
        }else{
            let authenticationFailureUserBlock = returnErrors.authenticationFailureUserBlock(req.getPath());
            res.send(authenticationFailureUserBlock.status, authenticationFailureUserBlock);
        }
    }        
})



/** Consultar um ticket pelo seu numero */
server.get(version + '/list/ticket/:ticket', JWTvalidateSession, async function(req, res){
    let numero = req.params.ticket    
    if(!isNaN(numero)){
        let result = await tickets.find({ticket : req.params.ticket}).exec();

        if(result.length){
            res.send(200,  returnSuccess.listTicket(result));
        }else{
            res.send(200, returnSuccess.listTicketResultEmpty());
        }
    }else{
        res.send(400, returnErrors.ticketInvalid());
    } 
});

server.get(version + '/list/tickets',async function(req, res){
    /** Logica para a paginação com mongodb */
    let page = req.query.page? req.query.page : 1;
    let limit = process.env.PAGE_LIMIT;
    let skip = (page * limit) - limit;
    let result = await tickets.find({}).skip(skip).limit(limit).exec();
    // console.log(result)
    if(result.length){
        res.send(200,  returnSuccess.listAllTickets(result));
    }else{
        res.send(200, returnSuccess.listTicketResultEmpty());
    }            
});

/** ==== Atualização de ticket ==== */
/** Criar um metodo para update geral????? Nao sei ainda!! */
server.patch(version + '/update/ticket/owner/:ticket', JWTvalidateSession, async function(req,res){

    if(req.body == undefined)
        res.send(400,returnErrors.badResquest(req.getPath()));

    let valorObrigatorio = returnErrors.valorObrigatorio(req.body,['owner'], req.getPath());
    
    if(valorObrigatorio.status === null){
        let ticket = req.params.ticket 
        let owner = req.body.owner
        
        if(!isNaN(ticket)){

            let search = { 
                ticket: ticket
            }

            let update = { 
                status: "in progress",
                $push: { 
                    owner: { 
                        timestamp: Date.now(), 
                        user: owner 
                    } 
                },
                $push : {
                    audit: {
                        timestamp :  Date.now(),
                        event: `O "owner" do ticket mudou para "${owner}"`,
                        user: owner
                    }
                }
                
            }

            let result = await tickets.findOneAndUpdate(search, update, {
                new: true,
                rawResult: true 
            });
                        
            if(result.lastErrorObject.updatedExisting){
                res.send(200, returnSuccess.listUpdateTicket(result));
            }else{
                let updateTicketErrorNotExists = returnErrors.updateTicketErrorNotExists(req.getPath());
                res.send(updateTicketErrorNotExists.status, updateTicketErrorNotExists);  
            }
            
        }else{
            res.send(400, returnErrors.ticketInvalid());
        } 
    }else{
        res.send(valorObrigatorio.status, valorObrigatorio);   
    }
});

server.patch(version + '/update/ticket/status/:ticket',JWTvalidateSession, async function(req,res){

    let token = req.headers['x-loverspet-token'];
    let infoUser = autenticacao.getInfoUserToken(token);

    if(req.body == undefined)
        res.send(400,returnErrors.badResquest(req.getPath()));

    let valorObrigatorio = returnErrors.valorObrigatorio(req.body,['status'], req.getPath());
    
    if(valorObrigatorio.status === null){
        let ticket = req.params.ticket 
        let status = req.body.status 
        let ticketValidateStatus = returnErrors.ticketValidateStatus(status, req.getPath());      

        if(ticketValidateStatus.status === null){
            
            if(!isNaN(ticket)){
                let search = { 
                    ticket: ticket
                }    

                let update = { 
                    status: status,           
                    $push: {
                        audit: {
                            timestamp :  Date.now(),
                            event: `O "status" do ticket mudou para "${status}"`,
                            user: infoUser.user
                        }
                    }
                }

                let result = await tickets.findOneAndUpdate(search, update,{
                    new: true,
                    rawResult: true 
                });
                
                if(result.lastErrorObject.updatedExisting){
                    res.send(200, returnSuccess.listUpdateTicket(result));                    
                }else{                    
                    let updateTicketErrorNotExists = returnErrors.updateTicketErrorNotExists(req.getPath());
                    res.send(updateTicketErrorNotExists.status, updateTicketErrorNotExists);                    
                }
                
            }else{
                res.send(400, returnErrors.ticketInvalid());
            } 

        }else{
            res.send(ticketValidateStatus.status, ticketValidateStatus);
        } 

    }else{
        res.send(valorObrigatorio.status, valorObrigatorio);   
    }
});

/** Endpoint responsavel por adicionar interaction ao ticket */
server.patch(version + '/update/ticket/interaction/:ticket', JWTvalidateSession, async function(req,res){
    
    if(req.body == undefined)
        res.send(400,returnErrors.badResquest(req.getPath()));    

    let valorObrigatorio = returnErrors.valorObrigatorio(req.body,['interaction'], req.getPath());
    if(valorObrigatorio.status === null){
        let interactionUpdate = req.body.interaction;
        let valorObrigatorioInteracation = returnErrors.valorObrigatorio(interactionUpdate[0],['user','subject','message'], req.getPath());
        if(valorObrigatorioInteracation.status === null){
            let ticket = req.params.ticket 

            if(!isNaN(ticket)){
                let ticketValidate = await tickets.findOne({ticket: ticket});      
                let ticketValidateStatus = returnErrors.ticketValidateProgress(ticketValidate.status, req.getPath()); 
                if(ticketValidateStatus.status === null){
                
                        let search = { 
                            ticket: ticket
                        }    
        
                        let update = {                         
                            $push: {
                                interaction: {
                                    user :  interactionUpdate[0].user,
                                    subject: interactionUpdate[0].subject,
                                    message: interactionUpdate[0].message,
                                }
                            },
                            $push: {
                                audit: {
                                    timestamp :  Date.now(),
                                    event: `O usuário ${interactionUpdate[0].user} adicionou uma nova interação`,
                                    user: interactionUpdate[0].user
                                }
                            }
                        }
        
                        let result = await tickets.findOneAndUpdate(search, update,{
                            new: true,
                            rawResult: true 
                        });
                        
                        if(result.lastErrorObject.updatedExisting){
                            res.send(200, returnSuccess.listUpdateTicket(result));                    
                        }else{                    
                            let updateTicketErrorNotExists = returnErrors.updateTicketErrorNotExists(req.getPath());
                            res.send(updateTicketErrorNotExists.status, updateTicketErrorNotExists);                    
                        }                    
                }else{
                    res.send(ticketValidateStatus.status, ticketValidateStatus);
                }
            }else{
                res.send(400, returnErrors.ticketInvalid());
            } 
        }else{
            res.send(valorObrigatorioInteracation.status, valorObrigatorioInteracation);   
        }    
    }else{
        res.send(valorObrigatorio.status, valorObrigatorio);   
    } 
});

/** ==== Criação de ticket ==== */
server.post(version + '/create/ticket', JWTvalidateSession, function(req,res,next){      
    let valorObrigatorio = returnErrors.valorObrigatorio(req.body,['user','subject','message'],`${server.url}/create/ticket`);
    if(valorObrigatorio.status === null){        
        createNewTicket(req.body).then(function(result){            
            switch(result.code){
                  case 500:
                    res.send(500,returnErrors.createTicketError(`${server.url}/create/ticket`, result));
                    break;

                default:
                    res.send(200,returnSuccess.createTicketSuccess(result));
                
            }
                
        })
    }else{
        res.send(valorObrigatorio.status, valorObrigatorio);   
    }
});

/**
 * Método utilizado para criação de um novo ticket,
 * este método valida o ultimo numero de ticket 
 * criado e incrementa mais um para um novo ticket
 * @param {*} body req.body da requisição 
 * @returns 
 */
async function createNewTicket(body){

    async function getLastTicket(){
        return await tickets.findOne().sort({_id: -1}).exec();
    }

    async function insertNewTicket(lastTicket, body){
        if(lastTicket === null)
            lastTicket = {
                ticket : 0
            }
        

        if(lastTicket != null && lastTicket.ticket != null || lastTicket.ticket != undefined ){
            var novoTicket = {
                ticket : (lastTicket.ticket + 1),
                timestamp :  Date.now(),
                status: 'open',
                author: body.user,
                owner: [],
                interaction : [
                    body
                ],
                audit: [{
                    timestamp :  Date.now(),
                    event: "Criação de um novo ticket",
                    user: body.user
                }] 
            }
           
            return await tickets.create(novoTicket);

        }else{
            return {code: 500, message: "Ocorreu um erro ao tentar criar um novo ticket!"};
        }
    }

    return getLastTicket().then(function(result){
        return insertNewTicket(result,body).then(function(insertResult){
            return insertResult;
        });
    });
}

/** Usuários */
server.get('/user/list',JWTvalidateSession, async function(req,res){
    let token = req.headers['x-loverspet-token'];
    let infoUser = autenticacao.getInfoUserToken(token);

    let validateAdministratorPermission = returnErrors.validateAdministratorPermission(infoUser.name.type, req.getPath());
    if(validateAdministratorPermission.status !== null){
        res.send(validateAdministratorPermission.status, validateAdministratorPermission);
    }

    let usuarios = await users.find();
    res.send(200, usuarios);

});


/** Remover usuário */
server.del('/user/:id',JWTvalidateSession, async function(req,res){
    let id = req.params.id;

    let token = req.headers['x-loverspet-token'];
    let infoUser = autenticacao.getInfoUserToken(token);

    let validateAdministratorPermission = returnErrors.validateAdministratorPermission(infoUser.name.type, req.getPath());
    if(validateAdministratorPermission.status !== null){
        res.send(validateAdministratorPermission.status, validateAdministratorPermission);
    }
    
    await users.findOneAndRemove({ _id: id }).then(function(success){
        let removeUserSuccess = returnSuccess.removeUserSuccess(success);                
        res.send(200, removeUserSuccess);
    }).catch(function(err){
        let removeUserError = returnErrors.removeUserError(req.getPath());
        res.send(removeUserError.status, removeUserError);
    })    

});



server.post('/user/create', JWTvalidateSession, async function(req,res){
    let token = req.headers['x-loverspet-token'];
    let infoUser = autenticacao.getInfoUserToken(token);

    let validateAdministratorPermission = returnErrors.validateAdministratorPermission(infoUser.name.type, req.getPath());
    if(validateAdministratorPermission.status !== null){
        res.send(validateAdministratorPermission.status, validateAdministratorPermission);
    }
        
    let valorObrigatorio = returnErrors.valorObrigatorio(req.body,['fullName','user', 'password', 'type', 'cellPhone', 'email'],req.getPath())
    
    if(valorObrigatorio.status === null){
        let userParams = req.body;

        let validateTypeUser = returnErrors.validateTypeUser(userParams.type);
        if (validateTypeUser.status !== null){
            res.send(validateTypeUser.status, validateTypeUser)
        }

        let newUser = await users.findOne({$or : [{user: userParams.user}, {email :userParams.email }, {cellPhone: userParams.cellPhone}]});
        if(newUser === null){

            userParams.audit = [{
                timestamp :  Date.now(),
                event: `O usuario "${userParams.user}" foi criado pelo usuario "${infoUser.user}"`,
                user: infoUser.user
            }];

            /** Status do usuário: 1 - Ativo, 0 - Bloqueado */
            if(userParams.status !== 1){
                userParams.status = 0;
            }

            await users.create(userParams).then(function(success){
                let createUserSuccess = returnSuccess.createUserSuccess(success);                
                res.send(200, createUserSuccess);
            }).catch(function(err){
                let createUserError = returnErrors.createUserError(req.getPath());
                res.send(createUserError.status, createUserError);
            })

        }else{
            /** Usuario existe */            
            let userExists = returnErrors.userExists(req.getPath());
            res.send(userExists.status, userExists)            
        }
    }else{
        res.send(valorObrigatorio.status,valorObrigatorio);
    }
   
});

server.patch('/user/update/type/:user', JWTvalidateSession, async function(req,res){
    let token = req.headers['x-loverspet-token'];
    let infoUser = autenticacao.getInfoUserToken(token);

    let validateAdministratorPermission = returnErrors.validateAdministratorPermission(infoUser.name.type, req.getPath());
    if(validateAdministratorPermission.status !== null){
        res.send(validateAdministratorPermission.status, validateAdministratorPermission);
    }
    
    let valorObrigatorio = returnErrors.valorObrigatorio(req.body,['type'],req.getPath())
    if(valorObrigatorio.status === null){
        let user = req.params.user;
        let type = req.body.type;

        let validateTypeUser = returnErrors.validateTypeUser(type);
        if (validateTypeUser.status !== null){
            res.send(validateTypeUser.status, validateTypeUser)
        }

        let search = { 
            user: user
        }

        let update = { 
            type: type,
            $push : {
                audit: {
                    timestamp :  Date.now(),
                    event: `O "type" do usuário foi alterado para "${type}"`,
                    user: infoUser.user
                }
            }
            
        }

        let result = await users.findOneAndUpdate(search, update, {
            new: true,
            rawResult: true 
        });

        if(result.lastErrorObject.updatedExisting){            
            res.send(200, returnSuccess.updateTypeUserSuccess(result));
        }else{
            let userNotExists = returnErrors.userNotExists(req.getPath());
            res.send(userNotExists.status, userNotExists);  
        }

    }else{
        res.send(valorObrigatorio.status,valorObrigatorio);
    }
   

    
})

server.patch('/user/update/fullname/:user', JWTvalidateSession, async function(req,res){
    let token = req.headers['x-loverspet-token'];
    let infoUser = autenticacao.getInfoUserToken(token);

    let validateAdministratorPermission = returnErrors.validateAdministratorPermission(infoUser.name.type, req.getPath());
    if(validateAdministratorPermission.status !== null){
        res.send(validateAdministratorPermission.status, validateAdministratorPermission);
    }

    let valorObrigatorio = returnErrors.valorObrigatorio(req.body,['fullName'],req.getPath())
    if(valorObrigatorio.status === null){
        let user = req.params.user;
        let fullName = req.body.fullName;

        let search = { 
            user: user
        }

        let update = { 
            fullName: fullName,
            $push : {
                audit: {
                    timestamp :  Date.now(),
                    event: `O "fullName" do usuário foi alterado para "${fullName}"`,
                    user: infoUser.user
                }
            }            
        }

        let result = await users.findOneAndUpdate(search, update, {
            new: true,
            rawResult: true 
        });

        if(result.lastErrorObject.updatedExisting){            
            res.send(200, returnSuccess.updateFullNameUserSuccess(result));
        }else{
            let userNotExists = returnErrors.userNotExists(req.getPath());
            res.send(userNotExists.status, userNotExists);  
        }

    }else{
        res.send(valorObrigatorio.status,valorObrigatorio);
    }

})

/** Atualizar usuário */
server.put('/user/:id',JWTvalidateSession, async function(req,res){
    let id = req.params.id;

    let token = req.headers['x-loverspet-token'];
    let infoUser = autenticacao.getInfoUserToken(token);

    let validateAdministratorPermission = returnErrors.validateAdministratorPermission(infoUser.name.type, req.getPath());
    if(validateAdministratorPermission.status !== null){
        res.send(validateAdministratorPermission.status, validateAdministratorPermission);
    }

    let valorObrigatorio = returnErrors.valorObrigatorio(req.body,['fullName','user', 'password', 'type', 'cellPhone', 'email'],req.getPath())

    if(valorObrigatorio.status === null){
        let userParams = req.body
        let user = req.body.user;
        let fullName = req.body.fullName;
        let password = req.body.password;
        let type = req.body.type;
        let cellPhone = req.body.cellPhone;
        let email = req.body.email;
        
        let search = { 
            _id: id
        }

        let update = { 
            user: user,
            password: password,
            fullName: fullName,
            type: type,
            cellPhone: cellPhone,
            email: email,
            $push : {
                audit: {
                    timestamp :  Date.now(),
                    event: `Os dados do usuário foram alterados para "${JSON.stringify(userParams)}"`,
                    user: infoUser.user
                }
            }            
        }

        let result = await users.findOneAndUpdate(search, update, {
            new: true,
            rawResult: true 
        });

        if(result.lastErrorObject.updatedExisting){            
            res.send(200, returnSuccess.updateUserSuccess(result));
        }else{
            let userNotExists = returnErrors.userNotExists(req.getPath());
            res.send(userNotExists.status, userNotExists);  
        }

    }else{
        res.send(valorObrigatorio.status,valorObrigatorio);
    }


});



/** O front está aqui */
server.get('/*', restify.plugins.serveStatic({   
    directory: './public',
    default: 'index.html'
}));

server.listen(process.env.API_PORT, function(){
    console.log('%s Escutando em %s', server.name, server.url);
});