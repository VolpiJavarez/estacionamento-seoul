let users;

//carrega o json
window.onload = function(){
  var xmlhttp = new XMLHttpRequest();
  var url = "./json/users.json";

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText);
        users = data;
    }
  };
  //carrega aqruivo
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (users[username] && users[username].password == password) {
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("role", users[username].role);
      window.location.href = "../parking.html";
  } else {
      alert("Usuário ou senha incorretos");
  }
});