async function getToken() {
    const url = 'http://localhost:3000/login';
    const data = {
        user: 'admin.geane.cornedi',
        password: 'admin.12344'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Ocorreu um erro ao fazer o login.');
        }

        const jsonData = await response.json();
        return jsonData;

    } catch (error) {

        console.error('Erro:', error);
        return null;
    }
}

async function createUser(data) {

    const token = await getToken();

    const url = 'http://localhost:3000/user/create';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-loverspet-token': token.data['x-loverspet-token'].token
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Ocorreu um erro ao criar o usuário.');
        }

        const jsonData = await response.json();
        return jsonData; // Retorna os dados do usuário criado

    } catch (error) {
        console.error('Erro:', error);
        return null; // Retorna null em caso de erro
    }
}

async function getUserList() {
    const token = await getToken();
    const url = 'http://localhost:3000/user/list';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-loverspet-token': token.data['x-loverspet-token'].token
            }
        });

        if (!response.ok) {
            throw new Error('Ocorreu um erro ao obter a lista de usuários.');
        }

        const userList = await response.json();
        return userList; // Retorna a lista de usuários

    } catch (error) {
        console.error('Erro:', error);
        return null; // Retorna null em caso de erro
    }
}

async function deleteUser(userId) {
    const token = await getToken();
    const url = `http://localhost:3000/user/${userId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-loverspet-token': token.data['x-loverspet-token'].token
            }
        });

        if (!response.ok) {
            throw new Error('Ocorreu um erro ao excluir o usuário.');
        }

        return { success: true, message: 'Usuário excluído com sucesso.' };

    } catch (error) {
        console.error('Erro:', error);
        return { success: false, message: 'Erro ao excluir o usuário.' };
    }
}


async function updateUser(userId, userData) {
    const token = await getToken();
    const url = `http://localhost:3000/user/${userId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-loverspet-token': token.data['x-loverspet-token'].token
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Ocorreu um erro ao atualizar o usuário.');
        }

        const updatedUser = await response.json();
        return updatedUser; // Retorna os dados do usuário atualizado

    } catch (error) {
        console.error('Erro:', error);
        return null; // Retorna null em caso de erro
    }
}


// Função para exibir os itens na tabela
async function renderItems() {
    let items = await getUserList();
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';
    items.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item._id}</td>
            <td>${item.user}</td>
            <td>${item.fullName}</td>
            <td>${item.email}</td>
            <td>${item.cellPhone}</td>
            <td>${item.type}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editItem('${item._id}')">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('${item._id}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para adicionar um novo item
async function addItem() {
    const itemLogin = document.getElementById('itemLogin').value;
    const itemPassword = document.getElementById('itemPassword').value;
    const itemName = document.getElementById('itemName').value;
    const itemEmail = document.getElementById('itemEmail').value;
    const itemPhone = document.getElementById('itemPhone').value;
    const itemType = document.getElementById('itemType').value;

    const newUser = {
        user: itemLogin,
        password: itemPassword,
        fullName: itemName,
        email: itemEmail,
        cellPhone: itemPhone,
        type: itemType,
    };

    // items.push(newUser);
    let result = await createUser(newUser)
    renderItems();
    $('#itemModal').modal('hide');
}

// Função para editar um item existente
async function editItem(id) {
    let items = await getUserList();
    const item = items.find(item => item._id === id);
    document.getElementById('itemId').value = item._id;
    document.getElementById('itemLogin').value = item.user;
    document.getElementById('itemPassword').value = item.password
    document.getElementById('itemName').value = item.fullName;
    document.getElementById('itemEmail').value = item.email
    document.getElementById('itemPhone').value = item.cellPhone
    document.getElementById('itemType').value = item.type

    $('#itemModalLabel').text('Editar Item');
    $('#itemModal').modal('show');
}

// Função para salvar alterações em um item
async function saveItem(id) {
    const itemId = parseInt(document.getElementById('itemId').value);
    const itemLogin = document.getElementById('itemLogin').value;
    const itemPassword = document.getElementById('itemPassword').value;
    const itemName = document.getElementById('itemName').value;
    const itemEmail = document.getElementById('itemEmail').value;
    const itemPhone = document.getElementById('itemPhone').value;
    const itemType = document.getElementById('itemType').value;

    userData = {
        user: itemLogin,
        password: itemPassword,
        fullName: itemName,
        email: itemEmail,
        cellPhone: itemPhone,
        type: itemType
    }


    await updateUser(id, userData)
    renderItems();
    $('#itemModal').modal('hide');

}

// Função para excluir um item
async function deleteItem(id) {    
    await deleteUser(id)
    renderItems();
}

// Event listener para o botão "Adicionar Item"
document.getElementById('addBtn').addEventListener('click', function () {
    document.getElementById('itemId').value = '';
    document.getElementById('itemName').value = '';
    $('#itemModalLabel').text('Adicionar Item');
    $('#itemModal').modal('show');
});

// Event listener para o botão "Salvar" no modal
document.getElementById('saveBtn').addEventListener('click', function () {
    const itemId = document.getElementById('itemId').value;
    if (itemId === '') {
        addItem();
    } else {
        saveItem(itemId);
    }
});

// Inicialização da tabela ao carregar a página
renderItems();       