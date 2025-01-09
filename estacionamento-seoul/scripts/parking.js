// ariáveis globais
var currTime = new Date();
var tariff = 10.00;
var carCount = 0;
var openTickets = [];
var closedTickets = [];
var agreements = [];

var table = document.getElementById("tickets-table").getElementsByTagName("tbody")[0];

window.onload = function(){
  //Controle de tarifa (apenas ADMIN pode alterar)
  if (sessionStorage.getItem("role") != "ADMIN")
    document.getElementById('button-change-tariff').disabled = true;

  let xmlhttp = new XMLHttpRequest();
  let url = "./json/tickets.json";

  xmlhttp.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200) {
        let data = JSON.parse(this.responseText);
        tariff = data.tariff;
        updateTariffDisplay();
        loadRegistry(data.tickets);
    }
  };
  //carrega aqruivo
  xmlhttp.open("GET", url, true);
  xmlhttp.send();

  xmlhttp = new XMLHttpRequest();
  url = "./json/discounts.json";

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        let data = JSON.parse(this.responseText);
        agreements = data.agreements;
    }
  };
  //carrega aqruivo
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

window.onpageexit = function(){

}

//Aturaliza data e hora a cada segundo
setInterval(updateDateTime, 1000);

function updateDateTime() {
  currTime = new Date();

  updateTimeDisplay();
}

function changeTariff(){
  const newTariff = parseFloat(prompt("Digite o novo valor da tarifa (R$):"));
  if (!isNaN(newTariff) && newTariff > 0) {
    tariff = newTariff;
    updateTariffDisplay();
  } 
  else
    alert("Valor inválido!");
}

//Carregar Tickets
function loadRegistry(tickets){
  for(let ticket of tickets)
    if(!ticket.payed){
        openTickets.push(ticket); 
        carCount++;
    }
    else
      closedTickets.push(ticket);

  logTickets();

  updateCarTable(openTickets);
  updateCarCountDisplay();
}

//Buscar Tickets
function search(){
  let searchTerm = document.getElementById('input-search-car').value.toLowerCase();
  let searchResult = [];
  for(let ticket of openTickets)
    if(!ticket.payed && ticket.registry.toLowerCase().includes(searchTerm))
      searchResult.push(ticket); 
  updateCarTable(searchResult);
}

//Criar Ticket
function newTicket(){
  //Criar um novo objeto para o carro
  let carRegistry = document.getElementById("input-add-car").value.toLowerCase();
  let newTicket = {
    registry: carRegistry,
    entryTime: currTime.toJSON(),
    leaveTime: null,
    tariff: tariff,
    discountCode: null,
    payed: null
  };
    
  //Adicionar o carro ao array de tickets
  openTickets.push(newTicket);

  //Adicionar a nova linha na tabela HTML
  createRow(newTicket);  

  //Atualizar a contagem de carros
  carCount++;
  updateCarCountDisplay();
  search();

  logTickets();
}

//Finalizar o ticket
function finalizeTicket(registry){
  //Encontrar o carro no array de tickets usando a placa
  var ticket = openTickets.find(ticket => ticket.registry == registry);

  if (ticket){
    //Atualizar o status do ticket para "finalizado"
    ticket.leaveTime = currTime.toJSON();

    if(confirm("Aplicar disconto de convênio?")){
      let newDiscountCode = prompt("Digite o codigo do convenio:").toLowerCase();
      if (newDiscountCode != null)
        ticket.discountCode = newDiscountCode;
    }
    ticket.payed = calculateTotal(ticket);
    alert("valor total pago(R$): " + ticket.payed);
     
    //Remover a linha da tabela
    const index = openTickets.indexOf(ticket);
    if (index > -1)
      openTickets.splice(index, 1);
    closedTickets.push(ticket);
    removeRow(ticket);

    //Atualizar a contagem de carros
    carCount--;
    updateCarCountDisplay();
    search();

    logTickets();
  }
  else{
    alert("Ocorreu um erro");
  }
}

function generateReport(){
  sessionStorage.setItem("closedTickets", closedTickets);
  window.location.href = "../report.html";
}

//Miscelaneous
function formatDate(date){
  var datetime = date.toLocaleString('pt-BR', {
    year: "numeric", 
    month: "long", 
    day: "numeric", 
    hour: "numeric", 
    minute: "numeric"});

  return datetime;
}

function calculateTotal(ticket){
  discount = 0;
  if(ticket.discountCode){
    let agreement = agreements.find(agreement => agreement.code.toLowerCase() == ticket.discountCode.toLowerCase());
    if(agreement)
      discount = agreement.discount;
  }
  let totalHours = Math.ceil(Math.abs(new Date(ticket.leaveTime) - new Date(ticket.entryTime)) / 36e5);
  return (ticket.tariff + ticket.tariff/2 * (totalHours - 1)) * (1 - discount);
}

function logTickets(){
  console.log("Tickets Abertos:")
  console.log(openTickets);
  console.log("Tickets Fexados:")
  console.log(closedTickets);
}

//HTML DOM functions
function updateTimeDisplay(){
  datetime = formatDate(currTime);

  document.getElementById("time-display").innerHTML = datetime;
}

function updateTariffDisplay(){
  document.getElementById('display-tariff').textContent = tariff.toFixed(2);
}

function updateCarCountDisplay(){
  document.getElementById("car-count").innerHTML = carCount;
  if(carCount == 0)
    document.getElementById("tickets-table").style.visibility = "hidden";
  else
    document.getElementById("tickets-table").style.visibility = "visible";
}

function updateCarTable(tickets){
  table.innerHTML = '';

  if(tickets.length == 0)
    table.innerHTML = "Nenhum resultado encontrado";

  for(let ticket of tickets)
    createRow(ticket);
}

function createRow(ticket){
  var newRow = document.createElement("tr");

  //Coluna de placa
  var newItem = document.createElement("td");
  newItem.innerHTML = ticket.registry.toUpperCase();
  newRow.appendChild(newItem);
  
  //Coluna de hora de entrada
  newItem = document.createElement("td");
  newItem.innerHTML = formatDate(new Date(ticket.entryTime));
  newRow.appendChild(newItem);
  
  //Coluna de tarifa
  newItem = document.createElement("td");
  newItem.innerHTML = ticket.tariff.toFixed(2);
  newRow.appendChild(newItem);

  //Coluna de botão finalizar
  newItem = document.createElement("td");
  newItem.className = "finalize";
  var button = document.createElement("button");
  button.innerHTML = "Finalizar";
  button.className = "buttonFinalize w-100 btn btn-outline-dark";
  button.onclick = function() { finalizeTicket(ticket.registry); };
  newItem.appendChild(button);
  newRow.appendChild(newItem);

  table.appendChild(newRow);
}

function removeRow(ticket){
  var rows = table.getElementsByTagName("tr");
  for(let row of rows){
    let registry = row.getElementsByTagName("td")[0];
    if (registry && registry.innerHTML.toLowerCase() == ticket.registry.toLowerCase()){
      row.remove();
      return;
    }
  }
}

//Adicionando handlers aos elemntos HTML
document.getElementById('button-change-tariff').addEventListener('click', changeTariff);
document.getElementById('button-generate-report').addEventListener('click', generateReport);

//Novo Ticket
document.getElementById("button-add-car").addEventListener("click", newTicket);
document.getElementById("input-add-car").addEventListener("keypress", function(event){
  if(event.key == "Enter")
    newTicket();
});

//Buscar Ticket
document.getElementById("button-search-car").addEventListener("click", search);
document.getElementById("input-search-car").addEventListener("input", search);