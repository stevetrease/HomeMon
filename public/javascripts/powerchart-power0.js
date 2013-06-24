$(document).ready(function(){
    $('.myCarousel').carousel();
});


    // Load the Visualization API and the piechart package.
    google.load('visualization', '1.0', {'packages':['corechart','table']});

	// Set a callback to run when the Google Visualization API is loaded.
	google.setOnLoadCallback(drawChart);

    // Callback that creates and populates a data table,
    // instantiates the pie chart, passes in the data and
    // draws it.  
    function drawChart() {
		var tag = "0";
		var jsonData = $.ajax({
      			url: "/data/chartdata2?node=" + tag,
	  				dataType:"json",
	  				async: false
	  	}).responseText;	

	  	var data = new google.visualization.DataTable();	           

		data.addColumn('datetime', 'Time');
		data.addColumn('number', 'KWh');

	  	var receivedData = JSON.parse(jsonData);
	  	for (var j = 0; j < receivedData.length; j++) {	
	  		var x = JSON.parse(receivedData[j]);
	  		data.addRow([ new Date(x.time), x.value]);
	  	}

		// Instantiate and draw our chart	 
		var options = {height: 300, legend: {position: 'none'}};
		var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
		chart.draw(data, options);

		// Instantiate and draw our table
		var table = new google.visualization.Table(document.getElementById('table_div'));
		table.draw(data, {showRowNumber: false});
	}