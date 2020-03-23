
class Person {

	constructor(id, size, speed, right_border, bottom_border, time_to_recovery_ms, mortality_rate, immunity_time, quarantined_pct){
		
		this.x = Simulation.getRandomInt(0, right_border);
		this.y = Simulation.getRandomInt(0, bottom_border);
		
		this.state = "healthy"; // recovered, infected, dead, immune
		
		this.direction = Simulation.getRandomInt(0, 360) % 360; // angle in degrees
		this.size = size; // width in pixels
		this.speed = speed; // pixels to move per loop
		this.right_border = right_border;
		this.bottom_border = bottom_border;
		this.color = "#00FF00";
		
		this.time_to_recovery_ms = time_to_recovery_ms; 
		this.mortality_rate = mortality_rate;
		this.immunity_time = immunity_time;
		this.quarantined_pct = quarantined_pct;
		
		this.action = 'walking'; // turning, quarantined
		this.distance_to_turn = 0;
		this.remaining_turns = 0;
		this.turn_speed = 0;
		this.turn_direction = 1;
		
		this.quarantine_expires = 0;
		
		this.walk();
		this.infected_time = 0;
		
		this.immunity_start_time = 0;
		this.quarantine_start_time = 0;
		this.is_immune = false;
		
		this.action_start_time = null;
		this.elapsed = {
			walking: 0,
			turning: 0,
			quarantined: 0
		};
		
		this.id = id;
	}
	
	infect(){
		if(this.state === "dead") return;
		if(this.action === 'quarantined') return;
		this.infected_time = (new Date()).getTime();
		this.state = "infected";
		this.color = "#FF0000";
	}
	
	update(){
		if(this.state === "dead") return;
		
		if(this.state === "infected" && (new Date()).getTime() > (this.infected_time + this.time_to_recovery_ms)){
			var survived = Simulation.getRandomInt(0,10000) >= this.mortality_rate*100;
			if(survived){
				this.infected_time = 0;
				this.state = "healed";
				this.color = "#0000FF";
				this.immunity_start_time = (new Date()).getTime();
				this.is_immune = true;
			}else{
				this.infected_time = 0;
				this.state = "dead";
				this.color = "#000000";
				this.immunity_start_time = 0;
				this.is_immune = false;
			}
		}
		
		if(this.is_immune && (new Date()).getTime() > (this.immunity_start_time + this.immunity_time)){
			this.immunity_start_time = 0;
			this.is_immune = false;
		}
		
		if(this.action === 'quarantined' && (new Date()).getTime() > (this.quarantine_start_time + this.quarantine_time)){
			this.walk();
			
		}
		
		if(this.action === 'turning' && !this.remaining_turns) this.quarantine();
		if(this.action === 'walking' && this.distance_to_turn <= 0) this.turn();
		
		if(this.action !== 'quarantined'){
			if(this.action === 'walking'){
				this.distance_to_turn -= this.speed;
			}else{
				if(this.target_direction === null) this.turn();
				this.direction += (this.turn_speed * this.turn_direction);
				this.remaining_turns--;
			}
		
			var radians = this.direction * Math.PI / 180;
			this.x += (this.speed * Math.cos(radians));
			this.y += (this.speed * Math.sin(radians));

			this.checkBorder();

			if(this.x < this.size/2) this.x = this.size/2;
			if(this.x > this.right_border - (this.size/2)) this.x = this.right_border - (this.size/2);
			if(this.y < this.size/2) this.y = this.size/2;
			if(this.y > this.bottom_border - (this.size/2)) this.y = this.bottom_border - (this.size/2);
		}
	}
	
	updateActionElapsedTime(){
		var now = (new Date()).getTime();
		if(this.action_start_time){
			if(!this.elapsed[this.action]) this.elapsed[this.action] = 0;
			this.elapsed[this.action] += now - this.action_start_time;
		}
		this.action_start_time = now;
	}
	
	quarantine(){
		
		this.updateActionElapsedTime();
		this.action = 'quarantined';
		this.turn_speed = 0;
		this.remaining_turns = 0;
		this.distance_to_turn = 0;
		this.quarantine_start_time = (new Date()).getTime();
		
		var moving_time = this.elapsed.walking + this.elapsed.turning;
		var quarantine_time = this.elapsed.quarantined;
		var moving_target_pct = 100 - this.quarantined_pct;
		var total_time = (moving_time / moving_target_pct) * 100;
		var total_rest_time = total_time - moving_time;
		var available_rest_time = total_rest_time - quarantine_time;
		if(available_rest_time < 1000) available_rest_time = 1000;
		
		this.quarantine_time = available_rest_time;
		
	}
	
	turn(){
		
		this.updateActionElapsedTime();
		this.action = 'turning';
		this.distance_to_turn = 0;
		this.remaining_turns = Simulation.getRandomInt(1, 50);
		this.turn_speed = Simulation.getRandomInt(1, 9);
		this.turn_direction = Simulation.coinFlip() ? 1 : -1;
		this.quarantine_start_time = 0;
	}
	
	walk(){
		this.updateActionElapsedTime();
		this.action = 'walking';
		this.turn_speed = 0;
		this.remaining_turns = 0;
		var dist_to_edge = Math.max(
			this.x,
			this.right_border - this.x,
			this.y,
			this.bottom_border - this.y
		);
		this.distance_to_turn = Simulation.getRandomInt(0, dist_to_edge);
		this.quarantine_start_time = 0;
	}
	
	checkBorder(){
		if(this.x <= 0 + (this.size/2)){
			//this.direction = (180 - this.direction) % 360;
			this.x = this.right_border - (this.size/2) - 1;
			this.walk();
		}
		if(this.x >= this.right_border - (this.size/2)){
			//this.direction = (180 - this.direction) % 360;
			this.x = 0 + (this.size/2) + 1;
			this.walk();
		}
		if(this.y <= 0 + (this.size/2)){
			//this.direction = (360 - this.direction) % 360;
			this.y = this.bottom_border - (this.size/2) - 1;
			this.walk();
		}
		if(this.y >= this.bottom_border - (this.size/2)){
			//this.direction = (360 - this.direction) % 360;
			this.y = 0 + (this.size/2) +1;
			this.walk();
		}
	}
	
	draw(ctx){
		ctx.fillStyle =  this.is_immune ? '#fcba03' : this.action === 'quarantined' ? "#9e9e9e" : this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size/2, 0, Math.PI*2, true); 
		ctx.closePath();
		ctx.fill();
	}
	
}