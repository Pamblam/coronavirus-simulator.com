
class Simulation{
	
	constructor(canvas, person_count=5, speed_ms=50, time_to_recovery_ms=15000, mortality_rate=50, immunity_time=15000, quarantined_pct=35){
		
		this.start_time = (new Date()).getTime();
		this.stop_time = 0;
		
		this.canvas = canvas;
		this.speed_ms = speed_ms;
		this.person_count = person_count;
		
		this.running = false;
		this.ctx = canvas.getContext("2d");
		this.width = canvas.width;
		this.height = canvas.height;
		this.people = [];
		
		this.time_to_recovery_ms = time_to_recovery_ms;
		this.mortality_rate = mortality_rate;
		this.immunity_time = immunity_time;
		this.quarantined_pct = quarantined_pct;
		
		for (let i = 0, person; i < this.person_count; i++) {
			person = new Person(i, 6, 4, this.width, this.height, time_to_recovery_ms, mortality_rate, immunity_time, quarantined_pct);
			this.people.push(person);
		}
		
		this.people[0].infect();
		this.onUpdateBuffer = [];
		this.frame = 0;
	}
	
	onUpdate(f){
		if(typeof f === 'function') this.onUpdateBuffer.push(f);
	}
	
	getStats(){
		var stats = {
			settings: {
				"sample-size": this.person_count,
				"time-to-recovery": this.time_to_recovery_ms,
				"mortality": this.mortality_rate,
				"immnuity-length": this.immunity_time,
				"quarantined": this.quarantined_pct
			},
			time: {
				frame: this.frame,
				elapsed: (this.stop_time || (new Date()).getTime()) - this.start_time
			},
			actions: {
				moving: 0,
				quarantined: 0
			},
			states: {
				healthy:0,
				infected: 0,
				dead: 0,
				healed: 0
			},
			risk: {
				immune: 0,
				"at-risk": 0
			},
			result: {
				"mortality-rate": 0,
				"elapsed-time": this.stop_time ? this.stop_time - this.start_time : 0
			}
		};
		
		for(let n = 0; n < this.people.length; n++){
			if(this.people[n].action === 'quarantined') stats.actions.quarantined++;
			if(this.people[n].action === 'walking' || this.people[n].action === 'turning') stats.actions.moving++;
			if(this.people[n].is_immune){ 
				stats.risk.immune++; 
			}else{ 
				stats.risk["at-risk"]++; 
			}
			stats.states[this.people[n].state]++;
		}
		var mortality_rate = ((stats.states.dead / (stats.states.healed+stats.states.dead))*100);
		stats.result['mortality-rate'] = isNaN(mortality_rate) ? 0 : +mortality_rate.toFixed(3);
		
		
		return stats;
	}
	
	update(){
		this.frame++;
		for (let i = 0; i < this.people.length; i++) {
			this.people[i].update();
		}
		for (let i = 0; i < this.people.length; i++) {
			for(let n = 0, a, b, c, max_dist; n < this.people.length; n++){
				a = this.people[i].x - this.people[n].x;
				b = this.people[i].y - this.people[n].y;
				c = Math.sqrt(a*a + b*b);
				max_dist = (this.people[i].size + this.people[n].size) / 2;
				if(c <= max_dist && (this.people[i].state === 'infected' || this.people[n].state === 'infected')){
					if(this.people[i].state !== 'infected') this.people[i].infect();
					if(this.people[n].state !== 'infected') this.people[n].infect();
				}
			}
		}
		this.onUpdateBuffer.forEach(f=>f.call(this));
	}
	
	start(force=true){
		if(force) this.running = true;
		requestAnimationFrame(()=>{
			if(!this.running) return;
			this.update();
			this.draw();
			setTimeout(()=>this.start(false), this.speed_ms);
		});
	}
	
	stop(){
		this.stop_time = (new Date()).getTime();
		this.running = false;
	}
	
	draw() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		for (let i = 0; i < this.people.length; i++) {
			this.people[i].draw(this.ctx);
		}
	}
	
}

Simulation.getRandomInt = function(min, max){
	return Math.floor(Math.random() * (max - min)) + min;
};

Simulation.coinFlip = function() {
    return (Math.floor(Math.random() * 2) == 0);
};