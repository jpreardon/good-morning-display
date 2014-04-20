// Global variables, because everybody loves variables
var WEATHER_UPDATE_FREQ = 600000; // In milliseconds (every 10 minutes)
var TRANSIT_UPDATE_FREQ = 60000; // In milliseconds (every minute)

// A big fat function to call the weather API and update the page with data
var updateWeather = function() {
	if (dataStored()) {
		/** Set up a query string for weather underground **/
		var apiKey = localStorage.api;
		var zipCode = localStorage.zip;
		var queryString = "http://api.wunderground.com/api/" + apiKey + "/conditions/forecast/hourly/q/" + zipCode + ".json?callback=?";
		var date = new Date();
		var iconURL = "http://icons.wxug.com/i/c/j/";

		$.getJSON(queryString, function(data) {
			var forecasts = new Array();
			var forecastIndex = 0;

			// Get the hourly forecasts we want
			$.each(data.hourly_forecast, function(i, v) {
			    if (v.FCTTIME.hour == "9" || v.FCTTIME.hour == "13" || v.FCTTIME.hour == "17") {
					if (forecastIndex < 3) {
						forecasts[forecastIndex] = v;
						forecastIndex++;
					}
					else {
						return false;
					}
			    }
			});

			// Populate the data in the HTML page
			$("#temperature").html(data.current_observation.temp_f+'&deg;');
			$("#current-weather").html(data.current_observation.weather);
			$("#weather-icon").attr("src", iconURL + data.current_observation.icon + ".gif");
			$("#humidity-feel").html("Humidity " + data.current_observation.relative_humidity + ", feels like " + data.current_observation.feelslike_f + "&deg;");
			$("#first-forecast").html(forecasts[0].temp.english + "&deg; " + forecasts[0].condition);
			$("#first-forecast-short").html(forecasts[0].temp.english + "&deg;");
			$("#first-day-short").html(forecasts[0].FCTTIME.weekday_name_abbrev + " " + forecasts[0].FCTTIME.hour_padded + ":00");
			$("#first-icon").attr("src", iconURL + forecasts[0].icon + ".gif");
			$("#second-forecast").html(forecasts[1].temp.english + "&deg; " + forecasts[1].condition);
			$("#second-forecast-short").html(forecasts[1].temp.english + "&deg;");
			$("#second-day-short").html(forecasts[1].FCTTIME.weekday_name_abbrev + " " + forecasts[1].FCTTIME.hour_padded + ":00");
			$("#second-icon").attr("src", iconURL + forecasts[1].icon + ".gif");
			$("#third-forecast").html(forecasts[2].temp.english + "&deg; " + forecasts[2].condition);
			$("#third-forecast-short").html(forecasts[2].temp.english + "&deg;");
			$("#third-day-short").html(forecasts[2].FCTTIME.weekday_name_abbrev + " " + forecasts[2].FCTTIME.hour_padded + ":00");
			$("#third-icon").attr("src", iconURL + forecasts[2].icon + ".gif");
			$("#weather-update-time").html("as of " + date.toLocaleTimeString());
		});
	}
}

// Look at the transit lines stored in settings and create a table to hold them
// This should get called on initilization and every time the settings are updated
function createTransitContainers() {
	// Remove the existing information
	$("#transit-table tbody").html("");
	$("#transit-status-text").html("");

	// Create an array of the values we want and insert data
	if (localStorage["transitLines"]) {
		var transitLines = JSON.parse(localStorage["transitLines"]);
		var tableRowContent;
		$.each(transitLines, function (i, v) {
			// TODO: This is really bad design, but I just want it to work (famous last words)
			if (v != "NJT158") {
				tableRowContent = '<tr><td><img width="1" height="1" src="img/trans.gif" id="' + v + '-icon" class="subwayIcon' + v +'"></td>';
				tableRowContent = tableRowContent + '<td><a id="' + v + '-status" onClick="">N/A</a></td></tr>';
				// Add table row
				$("#transit-table tbody").append(tableRowContent);
				// Add status text
				$("#transit-status-text").append('<div id="' + v + '-text" class="reveal-modal"></div>');
			} else {
				// In this area, we are dealing with the bus, we need to display different information here
				tableRowContent = '<tr><td>158 New York</td>';
				tableRowContent = tableRowContent + '<td><a id="' + v + '-status" onClick="">N/A</a></td></tr>';
				// Add table row
				$("#transit-table tbody").append(tableRowContent);
			}
		});
	}
}

// The status JSON is kind of a mess in that it is an array of arrays, but not
// very well formed. This function returns the desired object for a given line.
function selectTransitStatus(line, data) {
	var returnValue;
	$.each(data, function(i, v) {
	    if (v.name[0] == line) {
			returnValue = v;
	        return;
	    }
	});
	return returnValue;
}

// A big fat function to call the transit API and update the page
var updateTransit = function() {
	// TODO NJT Should be happening in its own funtion, but adding here for now
	$.getJSON("cgi-bin/njt_service_status.py", function(data) {
		if (data.noPredictionMessage) {
			$("#NJT158-status").html("Take your time...");
		} else if (data.pre) {
			$("#NJT158-status").html(data.pre[0].pt[0] + " " + data.pre[0].pu[0]);
		} else {
			$("#NJT158-status").html("Unavailable");
		}

	});

	$.getJSON("cgi-bin/service_status.py", function(data) {
		var date = new Date();
		var statusObject;
		// Get the list of lines we are supposed to show
		if (localStorage["transitLines"]) {
			var transitLines = JSON.parse(localStorage["transitLines"]);
			// Loop through the list and update the row
			$.each(transitLines, function (i, v) {
				// Get the proper JSON object for the line in question
				if (v != "NJT158") {
					statusObject = selectTransitStatus(v, data);
					$("#" + v + "-icon").attr("alt", statusObject.name[0]);
					$("#" + v + "-status").html(statusObject.status[0].toLowerCase());
					$("#" + v + "-status").attr("class", statusObject.status[0].replace(' ','-').toLowerCase());
					$("#" + v + "-text").html("<a class='close-reveal-modal'>&#215;</a>" + statusObject.text[0]);
					if (statusObject.status[0] == "GOOD SERVICE") {
						$("#" + v + "-status").attr("onClick", "");
					} else {
						$("#" + v + "-status").attr("onClick", "showText('" + v + "');");
					}
				}
			});
		}

		$("#transit-update-time").html("as of " + date.toLocaleTimeString());
	});
}

// If settings exist in localStorage, get them and populate the form
function populateSettingsForm() {
	// Populate weather information
	$("#wuapikey").val(localStorage.api);
	$("#wuzip").val(localStorage.zip);

	// Populate transit information
	// Create an array of the values we want, fill it up then fill in the form
	if (localStorage["transitLines"]) {
		var transitLines = JSON.parse(localStorage["transitLines"]);
		$.each(transitLines, function (i, v) {
			$("#" + v).prop("checked", true);
		});
	}
}

// Check to see if there is data stored in localStorage, this is somewhat mislabeled in that it returns
// false if any of the datapoints are missing.
function dataStored() {
	if ((localStorage.getItem("api") === null) || (localStorage.getItem("zip") === null) || (localStorage.getItem("transitLines") === null)) {
		return false;
	} else {
		return true;
	}
}

// Check to see if settings have ever been set, if now, show an error and the settings form.
function checkSettings() {
	if (!dataStored()) {
		$("#no-settings-alert").show();
		showSettings();
		// ('#settings').foundation('reveal', 'open');
	} else {
		$("#no-settings-alert").attr("visibility", "hidden");
		$("#no-settings-alert").hide();
		return true;
	}
}

// Save the settings from the form to localStorage
function updateSettings() {
	// Save the weather settings
	if ($("#wuapikey").val() && $("#wuzip").val()) {
		localStorage.api = $("#wuapikey").val();
		localStorage.zip = $("#wuzip").val();
	}
	if (dataStored()) {
		$('#settings').foundation('reveal', 'close');
		$("#no-settings-alert").hide();
		updateWeather();
	}

	// Save the transit settings
	// Create an array of the values we want and store it
	var transitLines = new Array;
	$("input[name='transitLines[]']:checked").each(function () {
		transitLines.push($(this).val());
	});
	localStorage["transitLines"] = JSON.stringify(transitLines);

	// Refresh the transit info on the page
	createTransitContainers();

	// Update the transit info
	updateTransit();
}

// Show the settings form, this function makes sure it is populated before showing
function showSettings() {
	populateSettingsForm();
	$('#settings').foundation('reveal', 'open');
}

// Show the detailed status information for a particular line
function showText(line) {
	$('#' + line + '-text').foundation('reveal', 'open');
}

// This function is here so we can refresh quickly when a device wakes up, but without
// hitting the APIs every second (or less).
function refreshPage() {
	date = new Date();
	// Update the weather information, if needed
	if ((!localStorage.getItem("lastWeatherUpdate")) || (Number(localStorage.lastWeatherUpdate) + WEATHER_UPDATE_FREQ < date.getTime())) {
		// Update weather!
		updateWeather();
		// Set the last update time
		localStorage.lastWeatherUpdate = date.getTime();
	}

	// Update the transit information, if needed
	if ((!localStorage.getItem("lastTransitUpdate")) || (Number(localStorage.lastTransitUpdate) + TRANSIT_UPDATE_FREQ < date.getTime())) {
		// Update transit!
		updateTransit();
		// Set the last update time
		localStorage.lastTransitUpdate = date.getTime();
	}
}

// Iniitialize the page
checkSettings();
createTransitContainers();
updateWeather();
updateTransit();

// Refresh every second
setInterval(refreshPage, 1000);
