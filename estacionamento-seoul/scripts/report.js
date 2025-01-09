// ariáveis globais
var closedTickets = [];
var lastResearch = [];

var table = document.getElementById("tickets-table").getElementsByTagName("tbody")[0];

window.onload = function(){
  let xmlhttp = new XMLHttpRequest();
  let url = "./json/tickets.json";

  xmlhttp.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200) {
        let data = JSON.parse(this.responseText);
        tariff = data.tariff;
        loadReport(data.tickets);
    }
  };

  //carrega aqruivo
  xmlhttp.open("GET", url, true);
  xmlhttp.send();

}

//Carregar Tickets
function loadReport(tickets){
  for(let ticket of tickets)
    if(ticket.payed)
      closedTickets.push(ticket); 

  var currTime = new Date();
  search(currTime);
}

function searchInput(){
  let searchDate = document.getElementById('input-search-date').value;
  if(searchDate)
    search(new Date(searchDate + "T12:00:00.000Z"));
}

//Buscar Tickets
function search(data){
  console.log("Data Pesquisada");
  console.log(data);

  let searchResult = [];
  for(let ticket of closedTickets)
  {
    let ticketDate = new Date(ticket.leaveTime);
    if(ticketDate.getFullYear() == data.getFullYear() && ticketDate.getMonth() == data.getMonth() && ticketDate.getDate() == data.getDate())
      searchResult.push(ticket); 
  }
  updateTimeDisplay(data);
  updateCarTable(searchResult);
  lastResearch = searchResult;
  logTickets();
}

function downoadXML(){
  //converter para XML
  let dataXML = "<root>";
  let index = 0;
  for(let ticket of lastResearch){
    dataXML += "<item" + index + ">";
    for (let key in ticket){
      if (ticket.hasOwnProperty(key)){
        dataXML += "<" + key + ">" + ticket[key] + "</"+ key +">";
      }
    }
    dataXML += "</item" + index + ">";
    index++;
  }
  dataXML += "</root>";
  // Gerar XML para download
  const blob = new Blob([dataXML], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'relatorio_estacionamento.xml';
  link.click();
}
 
function downoadJSON(){
  //Converter para JSON
  const dataJSON = JSON.stringify(lastResearch, null, 2);
  // Gerar JSON para download
  const blob = new Blob([dataJSON], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'relatorio_estacionamento.json';
  link.click();
}

//Misc
function formatDate(date){
  var datetime = date.toLocaleString('pt-BR', {
    year: "numeric", 
    month: "long", 
    day: "numeric", 
  });

  return datetime;
}

function logTickets(){
  console.log("Tickets Encontrados:")
  console.log(lastResearch);
  console.log("Tickets Registrados:")
  console.log(closedTickets);
}

function goBack(){
  window.location.href = "../parking.html";
}

//HTML DOM functions
function updateTimeDisplay(datetime){
  datetime = formatDate(datetime);

  document.getElementById("time-display").innerHTML = datetime;
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
    
  //Coluna de tarifa
  newItem = document.createElement("td");
  newItem.innerHTML = ticket.tariff.toFixed(2);
  newRow.appendChild(newItem);

  //Coluna de total
  newItem = document.createElement("td");
  newItem.innerHTML = ticket.payed.toFixed(2);
  newRow.appendChild(newItem);

  table.appendChild(newRow);
}

//Adicionando handlers aos elemntos HTML
document.getElementById('button-download-xml').addEventListener('click', downoadXML);
document.getElementById('button-download-json').addEventListener('click', downoadJSON);
document.getElementById('button-go-back').addEventListener('click', goBack);

//Buscar Ticket
document.getElementById("button-search-date").addEventListener("click", searchInput);
document.getElementById("input-search-date").addEventListener("keypress", function(event){
  if(event.key == "Enter")
    searchInput();
});