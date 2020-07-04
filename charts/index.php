<?php
$here = realpath(dirname(__FILE__));
$files = scandir("$here/data");

$data = [];
foreach($files as $file){
	if($file === "." || $file === "..") continue;
	$date = substr($file, 0, -4);
	list($mo, $dt, $yr) = explode("-", $date);
	$date_key = "$yr-$mo-$dt";
	$csv = file_get_contents("$here/data/$file");
	$rows = explode("\n", $csv);
	$headers = explode(",", trim(array_shift($rows)));
	array_shift($headers);
	$data[$date_key] = [];
	foreach($rows as $row){
		$row_data = explode(",", trim($row));
		$state_province = array_shift($row_data);
		$data[$date_key][$state_province] = [];
		foreach($row_data as $k=>$v){
			$data[$date_key][$state_province][$headers[$k]] = is_numeric($v) ? floatval($v) : $v;
		}
	}
}
?><!doctype html>
<html lang="en">
	<head>
		<!-- Required meta tags -->
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
		
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.css">
		<link rel="stylesheet" href="https://cdn.datatables.net/1.10.21/css/dataTables.bootstrap4.min.css">

		<title>Covid-19 Testing Charts</title>
	</head>
	<body>
		<div class='container'>
			
			<br><br>
			
			<h1>Covid-19 Testing Charts</h1>
			
			<p>
				You're sitting at your favorite bar enjoying a refreshing chocolate milk and contemplating your day when the guy next to you suddenly says,  <i>"I caught 100 fish!"</i> 
				Chances are, you're not going to be impressed. You'll probably think he's lying or exaggerating, but he isn't. 
				Without context or a time frame the claim that he caught 100 fish doesn't mean much. Did he catch 100 fish <i>today</i>? <i>This week</i>? In his entire life?
			</p>
			
			<p>
				Everyday on the news we hear, <i>"There have been 9888098123 new Covid-19 cases reported in Florida yesterday!"</i> The missing context in that statement isn't as glaring as 
				your barmate's claim of catching 100 fish, but the context is still lacking. You don't hear about the stark increase in testing that's taken place across the US.
				When a fisherman casts a wider net, they catch more fish. When you test more people, you get more positives. The goal of this page is to provide the missing context to the 
				coronavirus numbers we see on the news every day by comparing the number of covid-19 cases relative to the number of tests performed by state.
			</p>
			
			<div class='alert alert-info'>
				<p>You can see the charts by state, or look at the aggregated data for the entire country.</p>

				<div class="form-group">
					<label for="state-select" style='font-weight: bold;'>Select State:</label>
					<select class="form-control" id="state-select">
						<option value='ALL'>Entire US</option>
					</select>
				</div> 
			</div>
			
			<h3>Tests vs. Active Covid-19 Cases</h3>
			
			<p>
				This chart shows the total number of tests performed and the total number of active cases together for a side-by-side comparison. Note that in <b>every case</b>, the number of tests 
				is always exponentially larger than the number of positive results. A 150% increase in testing may only result in a %15 increase in cases over a month, for example. This is why the
				number of tests is such an important piece of context to consider when measuring the overall case numbers.
			</p>
			
			<div id='chart1' style='height:30em;'></div>
			
			<h3>Cases Relative to the Total Number of Tests Performed</h3>
			
			<p>
				This chart illustrates the percent of positive tests over time. If 50 people were tested last week and 5 of them were positive, but this week 100 people were tested and 6 of them were positive, 
				that may be in increase in positives, but it's actually a stark decrease in the percent of positive tests. This chart shows the percentages rather than the raw numbers.
			</p>
			
			<div id='chart3' style='height:30em;'></div>
			
			<h3>Where are the spikes</h3>
			
			<p>
				For each US state and province, this table lists the all-time lowest positive test rate (percent), the all-time highest positive test rate, and the most current test rate. 
				It then compares the current rate to the all time high and the all time low as a percentage. So for example, a <i>0% Spike</i> means that a state is currently at an all-time low'sfor positive covid cases.
				A <i>100% Spike</i> means that a state is currently at an all time high.
			</p>
			
			<table id='spike-tbl' class="table table-striped table-bordered">
				<thead>
					<tr>
						<th>State</th>
						<th>All time High</th>
						<th>All time Low</th>
						<th>Current</th>
						<th>Spike %</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>
		</div>		
		<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
		<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
		
		<script type="text/javascript" src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>
		<script type="text/javascript" src="https://cdn.datatables.net/1.10.21/js/dataTables.bootstrap4.min.js"></script>
 
		
		<script>const $data = <?php echo json_encode($data, JSON_PRETTY_PRINT); ?></script>
		<script src="main.js"></script>
		
		<!-- Global site tag (gtag.js) - Google Analytics -->
		<script async src="https://www.googletagmanager.com/gtag/js?id=UA-161712472-1"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			gtag('config', 'UA-161712472-1');
		</script>
	</body>
</html>