
google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(()=>drawCharts('ALL'));

generateSpikeTable();

function drawCharts(state) {
	var data1 = google.visualization.arrayToDataTable(getChartData('Tests', state));
	var chart1 = new google.visualization.LineChart(document.getElementById('chart1'));
	chart1.draw(data1, {
		title: 'Total Tests ' + ('ALL' === state ? "in the US" : "in "+state),
		legend: {position: 'bottom'},
//		width: $("#chart3").width(),
//		chartArea: {width: $("#chart3").width()}
	});
	var data3 = google.visualization.arrayToDataTable(getChartData('Percent of Positives', state));
	var chart3 = new google.visualization.LineChart(document.getElementById('chart3'));
	chart3.draw(data3, {
		title: 'Percent of Positive Test Results ' + ('ALL' === state ? "in the US" : "in "+state),
		legend: {position: 'bottom'},
//		width: $("#chart3").width(),
//		chartArea: {width: $("#chart3").width()}
	});
}

var dd_drawn = false;
function getChartData(metric, s){
	var chart_data = [];
	if("Tests" === metric) chart_data.push(['Date', 'Tests', 'Positives']);
	else chart_data.push(['Date', metric]);
	const dates = Object.keys($data).sort();
	dates.forEach(date=>{
		let tested = 0;
		let cases = 0;
		Object.keys($data[date]).forEach(state=>{
			if('ALL' !== s && state !== s) return;
			if(['American Samoa', 'Recovered', 'Virgin Islands', 'Grand Princess', 'Diamond Princess'].includes(state) || !state.trim()) return;
			if(!dd_drawn) $("#state-select").append(`<option value='${state}'>${state}</option>`);
			if(!isNaN($data[date][state].People_Tested)) tested += +$data[date][state].People_Tested;
			if(!isNaN($data[date][state].Active)) cases += +$data[date][state].Active;
		});
		dd_drawn = true;
		var row = [date];
		if(metric === 'Tests') row.push(tested, cases);
		if(metric === 'Percent of Positives') row.push(Math.floor(cases / tested * 10000) / 100);
		chart_data.push(row);
	});
	return chart_data;
}

function generateSpikeTable(){
	var spike_data = {};
	const dates = Object.keys($data).sort();
	spike_data.ALL = {highest: 0, lowest: Infinity, current: 0};
	dates.forEach(date=>{
		
		let total_tested = 0;
		let total_cases = 0;
		
		Object.keys($data[date]).forEach(state=>{
			if(['American Samoa', 'Recovered', 'Virgin Islands', 'Grand Princess', 'Diamond Princess'].includes(state) || !state.trim()) return;
			if(!spike_data[state]) spike_data[state] = {highest: 0, lowest: Infinity, current: 0};
			
			if(!isNaN($data[date][state].People_Tested)) total_tested += +$data[date][state].People_Tested;
			if(!isNaN($data[date][state].Active)) total_cases += +$data[date][state].Active;
			
			let pct = Math.floor($data[date][state].Active / $data[date][state].People_Tested * 10000) / 100;
			if(pct > spike_data[state].highest) spike_data[state].highest = pct;
			if(pct < spike_data[state].lowest) spike_data[state].lowest = pct;
			spike_data[state].current = pct;
		});
		
		let pct = Math.floor(total_cases / total_tested * 10000) / 100;
		
		if(pct > spike_data.ALL.highest) spike_data.ALL.highest = pct;
		if(pct < spike_data.ALL.lowest) spike_data.ALL.lowest = pct;
		spike_data.ALL.current = pct;
	});
	
	var $tbody = $("#spike-tbl").find("tbody");
	Object.keys(spike_data).forEach(state=>{
		const {highest, lowest, current} = spike_data[state];
		const total_span = highest - lowest;
		const current_increase = current - lowest;
		spike_data[state].spike = current_increase === 0 ? 0 : Math.floor(current_increase / total_span * 10000) / 100;
		$tbody.append(`<tr><td>${state}</td><td>${highest}</td><td>${lowest}</td><td>${current}</td><td>${spike_data[state].spike}</td></tr>`);
	});
	
	$('#spike-tbl').DataTable({
		paging: false,
		order: [[4, 'asc']]
	});
}

$("#state-select").change(function(e){
	drawCharts($(this).val());
});