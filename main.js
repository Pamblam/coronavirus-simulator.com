
var sim;
window.onload = function () {
	
	document.getElementById('people-slider').addEventListener('input', function(){
		document.getElementById('people-display').value = this.value;
	});
	document.getElementById('people-display').addEventListener('change', function(){
		if(isNaN(+this.value)) this.value = 50;
		if(+this.value < 1) this.value = 1;
		if(+this.value > 300) this.value = 300;
		document.getElementById('people-slider').value = +this.value;
	});
	
	document.getElementById('duration-slider').addEventListener('input', function(){
		document.getElementById('duration-display').value = (this.value/1000).toFixed(3);
	});
	document.getElementById('duration-display').addEventListener('change', function(){
		if(isNaN(+this.value)) this.value = 15;
		if(+this.value < 0.001) this.value = 0.001;
		if(+this.value > 30) this.value = 30.000;
		this.value = (+this.value).toFixed(3);
		document.getElementById('duration-slider').value = (+this.value)*1000;
	});
	
	
	document.getElementById('mr-slider').addEventListener('input', function(){
		document.getElementById('mr-display').value = (this.value/1000).toFixed(3);
	});
	document.getElementById('mr-display').addEventListener('change', function(){
		if(isNaN(+this.value)) this.value = 15;
		if(+this.value < 0.001) this.value = 0.001;
		if(+this.value > 99.999) this.value = 99.999;
		this.value = (+this.value).toFixed(3);
		document.getElementById('mr-slider').value = (+this.value)*1000;
	});
	
	document.getElementById('immunity-slider').addEventListener('input', function(){
		document.getElementById('immunity-display').value = (this.value/1000).toFixed(3);
	});
	document.getElementById('immunity-display').addEventListener('change', function(){
		if(isNaN(+this.value)) this.value = 15;
		if(+this.value < 0) this.value = 0.000;
		if(+this.value > 365) this.value = 365.000;
		this.value = (+this.value).toFixed(3);
		document.getElementById('immunity-slider').value = (+this.value)*1000;
	});
	
	document.getElementById('q-slider').addEventListener('input', function(){
		document.getElementById('q-display').value = (this.value/1000).toFixed(3);
	});
	document.getElementById('q-display').addEventListener('change', function(){
		if(isNaN(+this.value)) this.value = 35;
		if(+this.value < 0) this.value = 0.000;
		if(+this.value > 100) this.value = 100.000;
		this.value = (+this.value).toFixed(3);
		document.getElementById('q-slider').value = (+this.value)*1000;
	});
	
	document.getElementById('start-sim-btn').addEventListener('click', function(e){
		e.preventDefault();
		document.getElementById('input-row').style.display = 'none';
		document.getElementById('sim-row').style.display = 'block';
		
		runSim();
	});
	
	function runSim(){
		if(sim) sim.stop();
		
		var person_count = +document.getElementById('people-slider').value;
		var speed_ms = 50;
		var time_to_recovery_ms = +document.getElementById('duration-slider').value;
		var mortality_rate = +document.getElementById('mr-display').value;
		var immunity_time = +document.getElementById('immunity-slider').value;
		var quarantined_pct = +document.getElementById('q-display').value;
		
		var canvas = document.getElementById('canvas');
		canvas.width = 500;
		canvas.height = 500;

		var data_points = {}, frame = 0;

		sim = new Simulation(canvas, person_count, speed_ms, time_to_recovery_ms, mortality_rate, immunity_time, quarantined_pct);
		sim.onUpdate(function(){
			frame++;
			var stats = this.getStats();
			
			if(stats.states.infected === 0){
				sim.stop();
				stats = this.getStats();

				$('.nav-tabs a[href="#result"]').tab('show');
				
				var labels = data_points.healthy.map((i,n)=>"Frame "+n);
				
				var config = {
					type: 'line',
					data: {
						labels: labels,
						datasets: []
					},
					options: {
						responsive: true,
						title: {
							display: false,
							text: 'Simulation Curve'
						},elements: {
							point:{
								radius: 0
							}
						},
						scales: {
							xAxes: [{
								scaleLabel: {
									display: false,
									labelString: 'Frame'
								},
								ticks: {
									display: false
								}
							}],
							yAxes: [{
								stacked: true,
								scaleLabel: {
									display: false,
									labelString: 'People'
								},
								ticks: {
									display: false
								}
							}]
						}
					}
				};
				
				Object.keys(data_points).forEach(k=>{
					var key = k.toUpperCase();
					var color = key === 'HEALTHY' ? '#00FF00' :
								key === 'INFECTED' ? '#FF0000' : 
								key === 'HEALED' ? '#0000FF' :
								'#000000';
					config.data.datasets.push({
						label: k.toUpperCase(),
						backgroundColor: color,
						fill: 'origin',
						data: data_points[k]
					});
				});
				
				var ctx = document.getElementById('chart-canvas').getContext('2d');
				var chart = new Chart(ctx, config);
			}
			
			
			Object.keys(stats).forEach(k=>{
				Object.keys(stats[k]).forEach(kk=>{
					if(k === 'states'){
						if(!data_points[kk]) data_points[kk] = [];
						data_points[kk].push(stats[k][kk]);
						stats[k][kk] = stats[k][kk]+(stats[k][kk] === 1 ? " person" : " people");
					}
					if(k === 'settings'){
						if(kk === 'sample-size') stats[k][kk] = stats[k][kk]+ (stats[k][kk] === 1 ? " person" : " people");
						if(kk === 'time-to-recovery') stats[k][kk] = (stats[k][kk]/1000).toFixed(3)+" days";
						if(kk === 'mortality') stats[k][kk] = stats[k][kk]+"%";
						if(kk === 'immnuity-length') stats[k][kk] = (stats[k][kk]/1000).toFixed(3)+" days";
						if(kk === 'quarantined') stats[k][kk] = stats[k][kk].toFixed(3)+"%";
					}
					if(k === 'time'){
						if(kk === 'frames') stats[k][kk] = stats[k][kk].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
						if(kk === 'elapsed') stats[k][kk] = formatElapsedTime({
							base_units: 'day',
							elapsed_time: stats[k][kk]/1000,
							show_units: ['Days'],
							return_as_object: true
						}).days +" days";
					}
					if(k === 'actions'){
						if(kk === 'moving') stats[k][kk] = stats[k][kk]+(stats[k][kk] === 1 ? " person" : " people");
						if(kk === 'quarantined') stats[k][kk] = stats[k][kk]+(stats[k][kk] === 1 ? " person" : " people");
					}
					if(k === 'risk'){
						if(kk === 'immune') stats[k][kk] = stats[k][kk]+(stats[k][kk] === 1 ? " person" : " people");
						if(kk === 'at-risk') stats[k][kk] = stats[k][kk]+(stats[k][kk] === 1 ? " person" : " people");
					}
					if(k === 'result'){
						if(kk === 'mortality-rate') stats[k][kk] = stats[k][kk]+"%";
						if(kk === 'elapsed-time') stats[k][kk] = stats[k][kk] === 0 ? 'incomplete' : formatElapsedTime({
							base_units: 'ms',
							elapsed_time: stats[k][kk]
						});
					}
					document.getElementById(`${kk}-${k}`).innerHTML = stats[k][kk];
				});
			});

		});
		sim.start();
	}
	
	
}