/*******************************************************************************
 * Flexible function to format elapsed time as a string or object
 *******************************************************************************
 *******************************************************************************
 * Options passed in as an object. Possible Options are as follows:
 * 
 *	- elapsed_time
 *		The elapsed time to be formatted. The unit of time this represents is
 *		determined by the base_units option, which defaults to seconds. You may 
 *		use the end_time and/or start_time option instead.
 *		
 *	- start_time
 *		Used to calculate the elased time by subtracting this number from the 
 *		end_time option. If the end_time option is not given, the current time 
 *		is used as the end time. You may use the elapsed_time option instead. 
 *		The unit of time this represents is determined by the base_units option, 
 *		which defaults to seconds.
 *		
 *	- end_time
 *		Used to calculate the elased time by subtracting start_time from this
 *		number. If this number is not provided, it defaults to the current time. 
 *		You may use the elapsed_time option instead. The unit of time this 
 *		represents is determined by the base_units option, which defaults to 
 *		seconds.
 * 
 *	- base_units
 *		Specifys the units of measurment provided by the elapsed_time option or
 *		the end_time and/or start_time options. Valid values are: 
 *			milliseconds:	"ms", "milliseconds", "millisecond"
 *			seconds:		"s", "sec", "secs", "seconds", "second"
 *			minutes:		"m", "min", "mins", "minute", "minutes"
 *			hours:			"h", "hr", "hrs", "hour", "hours"
 *			days:			"d", "day", "days"
 *			years:			"y", "yr", "year", "years":
 *			
 *	- show_units
 *		An array containing each of the units that should be included in the 
 *		return value. If not specified, hours, minutes and seconds are assumed.
 *		Valid values to be included in this are are the same as specified for
 *		the base_units option.
 *		
 *	- verbose
 *		If true will return a string naming each unit, e.g. "3 Hours, 4 Minutes 
 *		and 1 second." If false it will return a string containing each of the
 *		values separated only by a colon, e.g. "3:4:1." If the return_as_object
 *		option is passed as true, this option is ignored.
 *	
 *	- return_as_object
 *		If true, returns an object instead of a string. The keys of the object
 *		are determined by the show_units option and the lang option.
 *		
 *	- lang
 *		An object that specifies the verbiage used in a verbose string, or the 
 *		keys of the object returned if return_as_object is true. The lang option 
 *		object has 12 possible options: year, years, day, days, hour, hours, 
 *		minute, minutes, second, seconds, millisecond, and milliseconds. If a 
 *		singluar value is specified and a plural value is not, the plural value 
 *		is the singlular value followed by an 's.' 
 *		
 *******************************************************************************
 *	Example:
 *	
 *		console.log(formatElapsedTime({
 *			base_units: 'sec',
 *			elapsed_time: 15431233224,
 *			show_units: ['Days', 'hours', 'min'],
 *			verbose: true,
 *			return_as_object: false,
 *			lang: {
 *				day: "Day",
 *				days: "Daze"
 *			}
 *		}));	
 *			
 *******************************************************************************
 * @author pamblam - github.com/pamblam
 * @param {Object} options
 * @returns {String|Object}
 ******************************************************************************/
function formatElapsedTime(options) {

	var base_unit, elapsed_time, verbose, show_units = [],
		year, years, day, days, hour, hours, minute,
		minutes, second, seconds, millisecond, milliseconds,
		str = [], s, return_as_object;

	const normalize_unit = unit => {
		unit = unit.toLowerCase().trim();
		switch (unit) {
			case "ms": case "milliseconds": case "millisecond": return 'ms';
			case "s": case "sec": case "secs": case "seconds": case "second": return 's';
			case "m": case "min": case "mins": case "minute": case "minutes": return 'm';
			case "h": case "hr": case "hrs": case "hour": case "hours": return 'h';
			case "d": case "day": case "days": return 'd';
			case "y": case "yr": case "year": case "years": return 'y';
		}
		return '';
	};

	const convert_time_to_ms = (time, current_units) => {
		switch (normalize_unit(current_units)) {
			case "ms": return time;
			case "s": return time * 1000;
			case "m": return time * 60000;
			case "h": return time * 3600000;
			case "d": return time * 86400000;
			case "y": return time * 31536000000;
		}
		return 0;
	};

	const convert_ms_to_units = (ms, units) => {
		switch (normalize_unit(units)) {
			case "ms": return ms;
			case "s": return ms / 1000;
			case "m": return ms / 60000;
			case "h": return ms / 3600000;
			case "d": return ms / 86400000;
			case "y": return ms / 31536000000;
		}
		return 0;
	};

	const convert_time_to_units = (time, current_units, new_units) => {
		var ms = convert_time_to_ms(time, current_units);
		return convert_ms_to_units(ms, new_units);
	};

	const parseValue = (unit, noun, nouns) => {
		if (~show_units.indexOf(unit)) {
			var u = Math.floor(convert_ms_to_units(s, unit));
			if (u || !verbose) str.push(!verbose ? (""+u).padStart(2,'0') + ':' : u + ' ' + (u == 1 ? noun : nouns) + ',');
			s -= Math.floor(convert_time_to_ms(u, unit));
		}
	}

	base_unit = options.base_units || 'seconds';

	if (options.elapsed_time) elapsed_time = parseInt(options.elapsed_time);
	else {
		if (!options.start_time) options.start_time = convert_time_to_units(Date.now(), 'ms', base_unit);
		if (!options.end_time) options.end_time = convert_time_to_units(Date.now(), 'ms', base_unit);
		elapsed_time = parseInt(options.end_time - options.start_time);
	}

	s = convert_time_to_ms(elapsed_time, base_unit);

	verbose = options.verbose || false;

	options.show_units = options.show_units || ['h', 'm', 's'];
	for (let i = 0; i < options.show_units.length; i++) show_units.push(normalize_unit(options.show_units[i]));

	return_as_object = options.return_as_object || false;
	if(return_as_object) verbose = false;

	options.lang = options.lang || {};
	year = options.lang.year || 'year';
	years = options.lang.years || year + 's';
	day = options.lang.day || 'day';
	days = options.lang.days || day + 's';
	hour = options.lang.hour || 'hour';
	hours = options.lang.hour || hour + 's';
	minute = options.lang.minute || 'minute';
	minutes = options.lang.minutes || minute + 's';
	second = options.lang.second || 'second';
	seconds = options.lang.seconds || second + 's';
	millisecond = options.lang.millisecond || 'millisecond';
	milliseconds = options.lang.milliseconds || millisecond + 's';

	parseValue('y', year, years);
	parseValue('d', day, days);
	parseValue('h', hour, hours);
	parseValue('m', minute, minutes);
	parseValue('s', second, seconds);
	parseValue('ms', millisecond, milliseconds);

	if(str.length > 1){
		if (verbose) {
			str[str.length - 2] = str[str.length - 2].substr(0, str[str.length - 2].length - 1);
			str[str.length - 1] = "and " + str[str.length - 1];
		}
		str[str.length - 1] = str[str.length - 1].substr(0, str[str.length - 1].length - 1);
	}
	
	str = str.join(verbose ? ' ' : '');
	
	if(return_as_object){
		str = str.split(':');
		return_as_object = {};
		[	['y', years], 
			['d', days], 
			['h', hours], 
			['m', minutes], 
			['s', seconds], 
			['ms', milliseconds] 
		].forEach(unit=>{
			if (!~show_units.indexOf(unit[0])) return;
			return_as_object[unit[1]] = str.shift();
		});
	}
	
	return return_as_object || str;
}