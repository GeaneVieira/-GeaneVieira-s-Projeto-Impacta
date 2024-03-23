class responseSuccess{
    
    constructor(){
        this.response =  {
            success: null,
            message: null,
            data: {}
        }
    }


    semDadosParaAtualizar(){
        this.response.success = true;
        this.response.message = "Sem dados para atualizar";
        this.response.status = 201;
        this.response.data = {
            message: "As informções já existem na base de dados"
        }

        return this.response
    }

    tokenGeradoComSucesso(token){
        this.response.success = true;
        this.response.message = `Loverspet-Token criado com sucesso`;
        this.response.data = {
            'x-loverspet-token' : {
                token : token
            }
        }

        return this.response;
    }
   

    createUserSuccess(user){
        this.response.success = true;
        this.response.message = `A inclusão do usuário "${user.user}" foi efetuada com sucesso`;
        this.response.data = {
            user : {
                fullName : user.fullName,
                user: user.user,
            }
        }
        return this.response;
    }

    removeUserSuccess(user){
        this.response.success = true;
        this.response.message = `O usuário "${user.user}" foi removido do sistema!`;
        this.response.data = {
            user : {
                fullName : user.fullName,
                user: user.user,
            }
        }
        return this.response;
    }

    updateTypeUserSuccess(user){
        this.response.success = true;
        this.response.message = `O type do usuário foi atualizado com sucesso!`;
        this.response.data = {            
        }
        return this.response;
    }

    updateFullNameUserSuccess(user){
        this.response.success = true;
        this.response.message = `O fullName do usuário foi atualizado com sucesso!`;
        this.response.data = {            
        }
        return this.response;
    }
    
    updateUserSuccess(user){
        this.response.success = true;
        this.response.message = `O dados do usuário foram atualizados com sucesso!`;
        this.response.data = {            
        }
        return this.response;
    }
    

    createTicketSuccess(ticket){
        this.response.success = true;
        this.response.message = `O registro "${ticket.interaction[0].subject}" foi efetuada com sucesso`;
        this.response.data = {
            ticket: ticket.ticket,
            timestamp :  ticket.timestamp,
            status: ticket.status,
            interaction : [{
                subject : ticket.interaction[0].subject,
                message: ticket.interaction[0].message,
            }],
        }
        return this.response;
    }

    listAllTickets(ticket){
        let array_ticket = []
        this.response.success = true;
        this.response.message = `Registro localizado`;                  
        for (let i in ticket){
            let objticket = {}
            objticket.ticket = ticket[i].ticket
            objticket.timestamp = ticket[i].timestamp
            objticket.status = ticket[i].status,
            objticket.owner = ticket[i].owner,
            objticket.interaction = ticket[i].interaction
            objticket.audit = ticket[i].audit
            array_ticket.push(objticket);
        }   
        this.response.data = {
            ticket : array_ticket
        }
        return this.response;
    }

    listTicket(ticket){        
        this.response.success = true;
        this.response.message = `Registro localizado`;
        this.response.data = {
            ticket: ticket[0].ticket,
            timestamp :  ticket[0].timestamp,
            status: ticket[0].status,
            owner: ticket[0].owner,
            interaction : ticket[0].interaction,
            audit: ticket[0].audit
        }
        return this.response
    }

    listUpdateTicket(ticket){        
        this.response.success = true;
        this.response.message = `Ticket Atualizado!`;
        this.response.data = {
            ticket: ticket.ticket,
            timestamp :  ticket.timestamp,
            status: ticket.status,
            owner: ticket.owner,
            interaction : ticket.interaction,
            audit : ticket.audit,
        }
        return this.response
    }

    listTicketResultEmpty(){
        this.response.success = true;
        this.response.message = `Requisição feita com sucesso mas não foram encontradas informações`;
        this.response.data = {}
        return this.response;
    }

    dadosNaoEncontrados(){
        this.response.success = true;
        this.response.message = `Requisição feita com sucesso mas não foram encontradas informações`;
        this.response.data = {}

        return this.response;
    }


}

module.exports = responseSuccess;