
    // Load the Visualization API and the piechart package.
    google.load('visualization', '1.0', {'packages':['corechart','table']});

	// Set a callback to run when the Google Visualization API is loaded.
	google.setOnLoadCallback(drawChart);

    // Callback that creates and populates a data table,
    // instantiates the pie chart, passes in the data and
    // draws it.  
    function drawChart() {
    	var tags = new Array("2", "3", "4", "5", "6", "7", "U");
    	
    	var allData = new google.visualization.DataTable();
    	allData.addColumn("datetime", "Date");
    	allData.addColumn("number", "KWh");
    	var cols = [];
    	
		for (var i = 0; i < tags.length; i++) {	
			var tag = tags[i];
					
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

			cols[i] = i + 1;
			var tmp = google.visualization.data.join(allData, data, "full", [[0,0]], cols, [1]);
			allData = tmp;
			allData.setColumnLabel(i + 2, tags[i]);
		}
		
		allData.removeColumn(1);
		// Instantiate and draw our overall graph
		var options = {height: 600, vAxis: {title: "Watts"} };
		var chart = new google.visualization.AreaChart(document.getElementById('chart_div_all'));
		chart.draw(allData, options);
		
		
		// Instantiate and draw our table
		// var table = new google.visualization.Table(document.getElementById('table_div_all'));
		// table.draw(allData, {showRowNumber: false});

	}