class responseErrors {
    
    constructor(){
        this.response = { 
            errors:{},
            title: null,
            status: null,
            detail: null,
            instance: null
        }
    }

    cleanResponse(){
        this.response = { 
            errors:{},
            title: null,
            status: null,
            detail: null,
            instance: null
        }
    }

    tokenNaoInformado(endpoint){
        this.cleanResponse();
        this.response.errors.autenticacao = "Token não informado";
        this.response.title = "Falha na autenticação";
        this.response.status = 401;
        this.response.detail = "Você não está autenticado";
        this.response.instance = endpoint

        return this.response
    }

    credenciaisNaoInformadas(endpoint){
        this.cleanResponse();
        this.response.errors.autenticacao = "Credenciais não informadas";
        this.response.title = "Falha na autenticação";
        this.response.status = 401;
        this.response.detail = "informe usuario e senha";
        this.response.instance = endpoint

        return this.response
    }

    authenticationFailure(endpoint){
        this.cleanResponse();
        this.response.errors.autenticacao = "Usuario ou senha invalido";
        this.response.title = "Falha na autenticação";
        this.response.status = 401;
        this.response.detail = "Verifique se o usuário e senha estão correstos";
        this.response.instance = endpoint

        return this.response
    }

    authenticationFailureUserBlock(endpoint){
        this.cleanResponse();
        this.response.errors.autenticacao = "Usuário bloqueado!";
        this.response.title = "Usuário bloqueado!";
        this.response.status = 401;
        this.response.detail = "Este usuário foi bloqueado pelo administrador. Você não tem mais acesso!";
        this.response.instance = endpoint

        return this.response
    }

    userNotExists(endpoint){        
        this.cleanResponse();        
        this.response.errors.user = "Este usuário não existe";
        this.response.title = "Usuário não localizado";
        this.response.status = 404;
        this.response.detail = `Este usuário não foi localizado. Verifique o usuário informado`;
        this.response.instance = endpoint;

        return this.response
    }
    
    userExists(endpoint){        
        this.cleanResponse();        
        this.response.errors.user = "Informações já cadastradas em outro usuário";
        this.response.title = "Não foi possivel criar este usuário";
        this.response.status = 400;
        this.response.detail = `O campo user, ou email, ou cellPhone já pertencem a outro usuário`;
        this.response.instance = endpoint;

        return this.response
    }

    validateTypeUser(type, endpoint){
        this.cleanResponse();
        switch(type){
            case 'provider':
            case 'customer':
            case 'administrator':
                return this.response
        
            default:
                this.response.errors.request = "Requisição inválida";
                this.response.status = 400;
                this.response.title = "O type informado não é valido";
                this.response.detail = "Por favor, verifique se o type informado é igual a provider, customer ou administrator";
                this.response.instance = endpoint;
   
                return this.response

        }
        
    }

    validateAdministratorPermission(type,endpoint){
        this.cleanResponse();        
        switch(type){           
            case 'administrator':
                return this.response
        
            default:
                this.response.errors.request = "Usuário não autorizado";
                this.response.status = 401;
                this.response.title = "Este usuário não é administrador";
                this.response.detail = "Este usuário não tem permissão para criar, alterar ou apagar outros usuários";
                this.response.instance = endpoint;
                return this.response
        }
    }

    createUserError(endpoint){        
        this.cleanResponse();        
        this.response.errors.user = "Não foi possivel criar este usuário";
        this.response.title = "Não foi possivel criar este usuário";
        this.response.status = 500;
        this.response.detail = `Ocorreu um erro ao tentar criar este usuário.`;
        this.response.instance = endpoint;

        return this.response
    }

    removeUserError(endpoint){        
        this.cleanResponse();        
        this.response.errors.user = "Não foi possivel remover este usuário";
        this.response.title = "Não foi possivel remover este usuário";
        this.response.status = 500;
        this.response.detail = `Ocorreu um erro ao tentar remover este usuário.`;
        this.response.instance = endpoint;

        return this.response
    }

    nenhumTokenFornecido(endpoint){
        this.cleanResponse();
        this.response.errors.autenticacao = "Nenhum token fornecido";
        this.response.title = "Falha na autenticação";
        this.response.status = 401;
        this.response.detail = "Não foi fornecido o token para a autenticação";
        this.response.instance = endpoint

        return this.response
    }

    tokenInvalido(endpoint){
        this.cleanResponse();
        this.response.errors.autenticacao = "Token invalido";
        this.response.title = "Falha na autenticação";
        this.response.status = 401;
        this.response.detail = "O token fornecido é invalido ou excedeu o tempo limite";
        this.response.instance = endpoint

        return this.response
    }


    valorObrigatorio(objeto,camposObrigatorios,endpoint){        
        this.cleanResponse();              
        if(Object.keys(objeto).length == 0){
            for (let i in camposObrigatorios){
                this.response.errors[camposObrigatorios[i]] = [`O valor "${camposObrigatorios[i]}" é obrigatório`];
                this.response.status = 400;
            }           
        }else{        
            for(let i in camposObrigatorios){
                if(objeto[camposObrigatorios[i]] == undefined){
                    this.response.errors[i] = [`A chave "${camposObrigatorios[i]}" é obrigatória`];
                    this.response.status = 400;
                } 
            }
            for(let i in objeto){     
                if(camposObrigatorios.indexOf(i) != -1){                
                    if(objeto[i] != undefined){
                        if(objeto[i].length == 0){
                            this.response.errors[i] = [`O valor de ${i} é obrigatório`];
                            this.response.status = 400;
                        } 
                    }else{
                        this.response.errors[i] = [`A chave ${i} é obrigatória`];
                        this.response.status = 400;
                    }
                }     
            }
        }
        if(this.response.status == 400){
            this.response.title = "Um ou mais valores não foram informados";
            this.response.detail = "Por favor, verifique qual campo não foi informado ou se ele encontra-se em branco";
            this.response.instance = endpoint;
        }
        return this.response;
    }

    arrayObrigatorio(objeto,camposObrigatorios,endpoint){
        this.cleanResponse();
        for(let i in objeto){
            if(camposObrigatorios.indexOf(i) != -1){
                if(!Array.isArray(objeto[i])){
                    this.response.errors[i] = [`O valor ${i} deve ser uma Array`];
                    this.response.status = 400;
                }
            }            
        }
        if(this.response.status == 400){
            this.response.title = "Um ou mais valores devem ser do tipo Array";
            this.response.detail = "Por favor, verifique se o tipo do campo está correto";
            this.response.instance = endpoint;
        }
        return this.response;       
    }
    
    ticketInvalid(endpoint){
        this.cleanResponse();
        this.response.errors.ticket = "Ticket informado invalido";
        this.response.title = "Ticket informado invalido";
        this.response.status = 400;
        this.response.detail = "O ticket fornecido é invalido";
        this.response.instance = endpoint

        return this.response
    }

    createTicketError(endpoint, error){
        this.cleanResponse();
        this.response.errors.ticket = "O ticket não foi criado";
        this.response.title = "Ocorreu um erro ao criar um novo ticket";
        this.response.status = error.code;
        this.response.detail = error.message;
        this.response.instance = endpoint

        return this.response
    }

    updateTicketErrorNotExists(endpoint){
        this.cleanResponse();
        this.response.errors.ticket = "O ticket informado não existe";
        this.response.title = "O ticket informado não existe";
        this.response.status = 404;
        this.response.detail = "Não foi localizado ticket informado";
        this.response.instance = endpoint;

        return this.response
    }

    badResquest(endpoint){
        this.cleanResponse();
        this.response.errors.request = "Requisição inválida";
        this.response.title = "Verifique se está encaminhando as informações necessárias!";
        this.response.status = 400;
        this.response.detail = "Não foi possível efetuar sua requisição pois o formato enviado está incorreto";
        this.response.instance = endpoint

        return this.response
    }

    ticketValidateProgress(status,endpoint){
        this.cleanResponse();
        switch(status){
            case 'open':                
            case 'in progress':
            case 'paused':
                return this.response;          

            case 'removed':
            case 'done':    
                this.response.errors.request = "Não é possivel alterar este ticket";
                this.response.status = 400;
                this.response.title = "Não é possivel alterar este ticket";
                this.response.detail = "Você não pode mudar as informações de um tickt com status 'removed' ou 'done'";
                this.response.instance = endpoint;

                return this.response     
            default:
                this.response.errors.request = "Requisição inválida";
                this.response.status = 400;
                this.response.title = "O status informado não é valido";
                this.response.detail = "Por favor, verifique se o status informado é igual a open, in progress, paused, removed ou done";
                this.response.instance = endpoint;
   
                return this.response
        }
    }

    ticketValidateStatus(status,endpoint){
        this.cleanResponse();
        switch(status){
            case 'open':                
            case 'in progress':
            case 'paused':
            case 'removed':
            case 'done':         
                return this.response;                  
            default:
                this.response.errors.request = "Requisição inválida";
                this.response.status = 400;
                this.response.title = "O status informado não é valido";
                this.response.detail = "Por favor, verifique se o status informado é igual a open, in progress, paused, removed ou done";
                this.response.instance = endpoint;
   
                return this.response
        }
    }

}

module.exports = responseErrors;