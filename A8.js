// API Key: 2snsTP9j_K_w_Y_7bNwy
// Example request link: "https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json?api_key=YOURAPIKEY"
// Exmaple request for data + metadata : "https://www.quandl.com/api/v3/datasets/WIKI/FB.json"
// Newest Data from json: this.response.dataset.data[0]

var fieldsToAppend = ["Open", "Close", "High", "Low", "Volume"];

function sendRequest(loadHandler, dsCode="FB", queryString="", dbCode="WIKI") {
	var xhr = new XMLHttpRequest();
	xhr.responseType = "json";
	xhr.addEventListener("error",function() {
		console.log("There is an error");
	});
	xhr.addEventListener("load", loadHandler);
	var requestLink = "https://www.quandl.com/api/v3/datasets/"+dbCode+"/"+dsCode+".json?api_key=2snsTP9j_K_w_Y_7bNwy";
	requestLink += queryString;
	xhr.open("GET",requestLink);
	xhr.send();
}

function printHandler(e) {
	console.log("printHandler ran");
	console.dir(this.response);
}

function clearFields() {
	codeInput.value = "";
	startDate.value = "";
	endDate.value = "";
	message.innerHTML = "";
}

function getCompanyName(fullString) {
	return /^[^(]+/.exec(fullString)[0];
}

function setColorMain(tr) {
	if (tr.children[3].innerHTML > tr.children[2].innerHTML) // good situation ^_^
	{
		tr.children[0].style.backgroundColor = "lightgreen";
	}
	else if (tr.children[3].innerHTML < tr.children[2].innerHTML) // bad situation -_-|||
	{
		tr.children[0].style.backgroundColor = "lightpink";
	}
	else
	{
		tr.children[0].style.backgroundColor = "white";
	}
}

function setColor(td, condition1, condition2) {
	if (condition1) { td.style.backgroundColor = "lightgreen"; }
	else if (condition2) { td.style.backgroundColor = "lightpink"; }
	else { td.style.backgroundColor = "white"; }
}


function appendFieldHandler(e) {
	if (this.response.dataset == undefined)
	{
		console.log("Code does not exist!");
		console.dir(this.response);
		if (this.response.quandl_error.message) {
			message.innerHTML = this.response.quandl_error.message;
		}
		return false;
	}

	var tableRow = document.createElement("tr");
	var codeDatum = document.createElement("td");
	codeDatum.innerHTML = this.response.dataset.dataset_code;
	tableRow.appendChild(codeDatum);
	var nameDatum = document.createElement("td");
	nameDatum.innerHTML = getCompanyName(this.response.dataset.name);
	tableRow.appendChild(nameDatum);

	for (var i=0; i<fieldsToAppend.length; i++)
	{
		var dataDatum = document.createElement("td");
		var positionJson = this.response.dataset.column_names.indexOf(fieldsToAppend[i]);
		if (positionJson == -1)
		{
			console.warn("index "+i+" in fieldsToAppend doesn't exist, skipping to next.");
			tableRow.appendChild(dataDatum);
			continue;
		}
		dataDatum.innerHTML = this.response.dataset.data[0][positionJson];
		tableRow.appendChild(dataDatum);
	}
	setColorMain(tableRow);

	// Chart button
	var chartThisDatum = document.createElement("td");
	var chartThisBtn = document.createElement("button");
	chartThisBtn.innerHTML = "Chart This";
	chartThisBtn.addEventListener("click", function() {
		var code = this.parentNode.parentNode.children[0].innerHTML;
		sendRequest(drawChartHandler, code, getDateQuery());
	});
	chartThisDatum.appendChild(chartThisBtn);
	tableRow.appendChild(chartThisDatum);

	// Portfolio elements
	var portfolioDatum = document.createElement("td");
	var portfolioDiv = document.createElement("div");
	var portfolioBtn = document.createElement("button"); // the button in the chart

	// portfolioButton
	portfolioBtn.innerHTML = "Add";
	portfolioBtn.classList.add("portfolioButton");

	// portfolioMenu
	var portfolioMenu = document.createElement("div");
	portfolioMenu.classList.add("portfolioMenu");

	var portfolioTitle = document.createElement("h4");
	portfolioTitle.innerHTML = "Amount To Add";
	portfolioMenu.appendChild(portfolioTitle);

	var portfolioInput = document.createElement("input");
	portfolioInput.type = "number";
	portfolioInput.classList.add("portfolioInput");
	portfolioInput.value = 100;
	portfolioMenu.appendChild(portfolioInput);

	var addPortBtn = document.createElement("button"); // the button inside the port menu
	addPortBtn.innerHTML = "OK";
	addPortBtn.addEventListener("click", function() {
		var code = this.parentNode.parentNode.parentNode.parentNode.children[0].innerHTML;
		var shares = this.parentNode.getElementsByClassName("portfolioInput")[0].value;
		
		sendRequest(function() {
			var data = this.response.dataset;
			addToPortfolio(data, shares);
			deactiveAll();
		}, code);
	});
	portfolioMenu.appendChild(addPortBtn);


	// portfolioDiv
	portfolioDiv.appendChild(portfolioBtn);
	portfolioDiv.appendChild(portfolioMenu);
	portfolioDiv.classList.add("portfolio");

	portfolioDatum.appendChild(portfolioDiv);
	tableRow.appendChild(portfolioDatum);

	document.getElementById("mainTable").appendChild(tableRow);

	// Remove button
	var removeButton = getRemoveButton();
	var removeDatum = document.createElement("td");
	removeDatum.appendChild(removeButton);
	tableRow.appendChild(removeDatum);

	// event listener
	portfolioDiv.addEventListener("click", function(e) {
		e.stopPropagation(); // prevent from disappearing when clicking on inside the div
	});
	portfolioBtn.addEventListener("click", function(e) {
		deactiveAll();
		var menu = this.parentNode.getElementsByClassName("portfolioMenu")[0];
		menu.classList.add("active");
	});
	
	clearFields();
}

function deactiveAll() {
	var actives = document.getElementsByClassName("active");
	while (actives.length>0)
	{
		actives[0].classList.remove("active");
	}
}

function getRemoveButton() {
	var removeButton = document.createElement("button");
	removeButton.addEventListener("click", removeButtonHandler);
	removeButton.innerHTML = "&#10006;";
	return removeButton;
}

function removeButtonHandler() {
	var row = this.parentNode.parentNode;
	console.log(row);
	row.parentNode.removeChild(row);
}


function getDateQuery() {
	var queryString = "";
	if (startDate.value != "") {
		queryString += "&start_date="+startDate.value; 
	}
	if (endDate.value != "") {
		queryString += "&end_date="+endDate.value; 
	}
	return queryString;
}

function grabFields() {
	if (codeInput.value == "") {
		message.innerHTML = "You must enter the company code!";
		return;
	}
	var queryString = getDateQuery();
	sendRequest(appendFieldHandler, codeInput.value, queryString);
	message.innerHTML = "Searching...";
}

function toDollars(d) {
	return "$ " + d.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); // from https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript
}


function drawChartHandler() {
	google.charts.load('current', {'packages':['line', 'corechart']});
	google.charts.setOnLoadCallback(drawChart);
	var dataArr = this.response.dataset.data;
	var companyName = getCompanyName(this.response.dataset.name);

	function drawChart() {
		// initializing data table
		var data = new google.visualization.DataTable();
		data.addColumn('date','Date');
		data.addColumn('number','Low');
		data.addColumn('number','High');
		data.addColumn('number','Close');
		data.addColumn('number','Volume');
		for (var i=0; i<dataArr.length; i++)
		{
			data.addRow([new Date(dataArr[i][0]),
								dataArr[i][3],
								dataArr[i][2],
								dataArr[i][4],
								dataArr[i][5]
			]);
		}
		// set attributes of chart
		var options = {
			chart: {
				title: 'Stock Data for '+companyName
			},
			width: 900,
			height: 500,
			series: {
				// Gives each series an axis name that matches the Y-axis below.
				0: {axis: 'value'},
				1: {axis: 'value'},
				2: {axis: 'value'},
				3: {axis: 'volume'}
			},
			axes: {
				y: {
					volume: { label: 'Volume' },
					value: { label: 'Stock Price Value ($)' }
				}
			} 
		};
		// draw the chart
		var materialChart = new google.charts.Line(chart);
		materialChart.draw(data,options);
	}
}



function addToPortfolio(data, sharesOwned = 100) { // data parameter: xhr.response.dataset from sendRequest()

	var tableRow = document.createElement("tr");

	var symbolDatum = document.createElement("td");
	symbolDatum.innerHTML = data.dataset_code;
	tableRow.appendChild(symbolDatum);

	var nameDatum = document.createElement("td");
	nameDatum.innerHTML = getCompanyName(data.name);
	tableRow.appendChild(nameDatum);

	var sharesDatum = document.createElement("td");
	sharesDatum.innerHTML = sharesOwned;
	tableRow.appendChild(sharesDatum);

	var prevDatum = document.createElement("td");
	var previousValue = data.data[1][4]; // closing price of 2nd recent per share
	previousValue *= sharesOwned;
	console.log("previous: "+previousValue);
	prevDatum.innerHTML = toDollars(previousValue);
	tableRow.appendChild(prevDatum);

	var currDatum = document.createElement("td");
	var currentValue = data.data[0][4]; 
	currentValue *= sharesOwned;
	console.log("current: "+currentValue);
	currDatum.innerHTML = toDollars(currentValue);
	tableRow.appendChild(currDatum);

	var changeDatum = document.createElement("td");
	var changeP = (currentValue - previousValue) / previousValue;
	changeDatum.innerHTML = (changeP*100).toFixed(2)+"%";
	setColor(changeDatum, changeP>0, changeP<0);
	tableRow.appendChild(changeDatum);

	var removeDatum = document.createElement("td");
	var removeBtn = getRemoveButton();
	removeDatum.appendChild(removeBtn);
	tableRow.appendChild(removeDatum);

	portfolioTable.appendChild(tableRow);

}




// Event listeners
searchButton.addEventListener("click", grabFields);
codeInput.addEventListener("keypress", function(e) {
	if (e.keyCode===13) { grabFields(); }
});
document.getElementsByTagName("body")[0].addEventListener("click",deactiveAll);

