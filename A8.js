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
	globalResponse = this.response;
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

function setColor(tr) {
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
	setColor(tableRow);

	// Chart button
	var chartThisDatum = document.createElement("td");
	var chartThisBtn = document.createElement("button");
	chartThisBtn.innerHTML = "Chart This";
	chartThisBtn.addEventListener("click", function() {
		console.log("chart this button clicked!");
		var code = this.parentNode.parentNode.children[0].innerHTML;
		sendRequest(drawChartHandler, code, getDateQuery());
	});
	chartThisDatum.appendChild(chartThisBtn);
	tableRow.appendChild(chartThisDatum);

	// Portfolio button
	var portfolioDatum = document.createElement("td");
	var portfolioDiv = document.createElement("div");
	var portfolioBtn = document.createElement("button");

	//portfolioButton
	portfolioBtn.innerHTML = "Add";
	portfolioBtn.classList.add("portfolioButton");

	// portfolioMenu
	var portfolioMenu = document.createElement("div");
	portfolioMenu.classList.add("portfolioMenu");
	portfolioMenu.innerHTML = "<h4>Title</h4><input type=range></input>";


	// portfolioDiv
	portfolioDiv.appendChild(portfolioBtn);
	portfolioDiv.appendChild(portfolioMenu);
	portfolioDiv.classList.add("portfolio");

	portfolioDatum.appendChild(portfolioDiv);
	tableRow.appendChild(portfolioDatum);

	document.getElementById("main").appendChild(tableRow);

	// event listener
	portfolioBtn.addEventListener("click", function() {
		var menu = this.parentNode.getElementsByClassName("portfolioMenu")[0];
		menu.classList.add("active");
	});
	
	clearFields();
}

function deactiveAll() {
	var actives = document.getElementsByClassName("active");
	for (var i=0; i<actives.length; i++)
	{
		actives[i].classList.remove("active");
	}
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

searchButton.addEventListener("click", grabFields);


