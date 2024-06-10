function checkLogin() {
    const token = localStorage.getItem('token');
    if (token) {
        
        $.ajax({
            url: 'http://localhost:3000/validate-token',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ token: token }),
            success: function(response) {
                console.log(response);
                // if (response.valid) {
                //     window.location.href = 'http://localhost:3000/painel';
                // }
            },
            error: function() {                
                localStorage.removeItem('token');
                window.location.href = 'http://localhost:3000'
            }
        });
    }
}