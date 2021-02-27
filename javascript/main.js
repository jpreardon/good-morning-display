"use strict"
// Overall Setup
const PAGE_RELOAD_INTERVAL_MINUTES = 720 // 12 hours

// Weather data API Setup
const WEATHER_CURRENT_CONDITION_ENDPOINT = "https://api.weather.gov/stations/<stationName>/observations/latest"
const WEATHER_FORECAST_ENDPOINT = "https://api.weather.gov/gridpoints/<coordinates>/forecast"
const WEATHER_UPDATE_INTERVAL_SECONDS = 30

// Citibike data API Setup
const BIKE_STATION_INFO_URL = "https://gbfs.citibikenyc.com/gbfs/en/station_information.json"
const BIKE_STATION_STATUS_URL = "https://gbfs.citibikenyc.com/gbfs/en/station_status.json"
const BIKE_UPDATE_INTERVAL_SECONDS = 60

// Subway stuff, not sure if it should be here
const STATION_ID = localStorage.getItem("subwayStation") ? localStorage.getItem("subwayStation") : ""
const MTA_API_KEY = localStorage.getItem("subwayApiKey") ? localStorage.getItem("subwayApiKey") : ""
const STATION_JSON_PATH = "javascript/stations.json"
const protoBufDef = "javascript/nyct-subway.proto.txt"
const SUBWAY_UPDATE_INTERVAL_SECONDS = 30

// Runtime Globals
var WEATHER_STATION = ""
var WEATHER_GRID_COORDINATES = ""
var WEATHER_LAST_UPDATE_TIME = 0
var BIKE_STATION_LIST = []
var BIKE_SELECTED_STATIONS = []
var BIKE_STATIONS_LOADED = false
var BIKE_LAST_UPDATE_TIME = 0
var SUBWAY_LAST_UPDATE_TIME = 0
var LAST_PAGE_RELOAD = ""

// User facing text
const ERR_CURRENT_CONDITIONS_NOT_AVAILABLE = "Current conditions not available ¯\\_(ツ)_/¯"
const ERR_FORECAST_NOT_AVAILABLE = "Forecast not available ¯\\_(ツ)_/¯"
const ERR_NO_LOCAL_STORAGE = "It appears that this browser doesn't support local storage, or it isn't enabled."
const ERR_NO_BIKE_STATIONS_SET = "No bike stations setup. Choose at least one station to see status."
const ERR_NO_SUBWAY_INFO_SET = "No subway information setup. Enter an API key and station information in settings."

/** 
 * Converts Celsius to Fahrenheit 
 * @param {number} celsius - Reading in celsius.
 */
function cToF(celsius) {
    if (celsius == null) {
        return null
    } else {
        celsius = celsius * 9 /5 + 32
        return celsius.toFixed(0) + "º"
    }
}

/** 
 * Converts Kilometers per hour to Miles per hour 
 * @param {number} KilometersPerHour - Speed in KPH.
 */
function KphToMph(KilometersPerHour) {
    if (KilometersPerHour == null) {
        return null
    } else {
        var milesPerHour = KilometersPerHour * 0.6213712
        return milesPerHour.toFixed(1)
    }
}

/** 
 * Replaces null values with another value 
 * @param {string} value - The value that might contain a null.
 * @param {string} [replacement] - What will replace a null in value. The default is "--".
 */
function replaceNulls(value, replacement = "--") {
    if (value == null) {
        return replacement
    } else {
        return value
    } 
}

/**
 * Returns the dash-offset needed to render the relative humidity border
 * @param {Number} relativeHumidity
 * @param {Number} maxLength - Circumference of the circle, or length of arc
 */
function mapRelativeHumidity(relativeHumidity, maxLength) {
    const step = maxLength / 100 
    var mappedValue = 0

    if (relativeHumidity.toFixed(0) < 0) {
        mappedValue = maxLength
    } else if (relativeHumidity.toFixed(0) > 100) {
        mappedValue = 0
    } else {
        mappedValue = maxLength - (relativeHumidity * step)
    }
    return mappedValue.toFixed(0)
}

/**
 * Fetches current weather conditions from server
 */
function getCurrentConditions() {
    return new Promise( (resolve, reject) => {
        var currentConditions = {}
        fetch( getApiEndpoint("current_conditions") ) 
        .then(handleFetchErrors)
        .then(response => {
            return response.json()
        })
        .then( (json) => {
            currentConditions.temperature = replaceNulls(cToF(json.properties.temperature.value))
            currentConditions.conditions = replaceNulls(json.properties.textDescription, "")
            currentConditions.windSpeed = replaceNulls(KphToMph(json.properties.windSpeed.value))
            currentConditions.windDirection = json.properties.windDirection.value
            currentConditions.relativeHumidity = json.properties.relativeHumidity.value
            resolve(currentConditions)
        })
        .catch( (error) => {
            currentConditions.error = error
            currentConditions.textStatus = error.message
            reject(currentConditions)
        })
    })
}

/**
 * Fetches current weather forecast from server
 */
function getForecast() {
    return new Promise( (resolve, reject) => {
        var forecast = []
        fetch( getApiEndpoint("forecast")  )
        .then(handleFetchErrors)
        .then(response => {
            return response.json()
        })
        .then(json => {
            forecast.push({name:json.properties.periods[0].name, forecast:json.properties.periods[0].detailedForecast})
            forecast.push({name:json.properties.periods[1].name, forecast:json.properties.periods[1].detailedForecast})
            forecast.push({name:json.properties.periods[2].name, forecast:json.properties.periods[2].shortForecast})
            resolve(forecast)
        })
        .catch( (error) => {
            forecast.error = error
            forecast.textStatus = error.message
            reject(forecast)
        })
    })
}

/**
 * Saves location data to local storage. If coordinates or a station name are being set, it validates the URL
 * @param {String} dataPoint - The user setting name to store
 * @param {String} value - The value of the user setting to store
 */
function setUserLocationData(dataPoint, value) {
    // TODO: This function is kind of funky, refactor
    return new Promise( (resolve, reject) => {
        var name = ""
        
        switch (dataPoint) {
            case "stationName":
                name =  "current_conditions"
                break
            case "coordinates":
                name = "forecast"
                break
            case "lat":
                name = "lat"
                break
            case "lon":
                name = "lon"
                break
            default:
                return reject("Invalid Data Point")
        }

        if (name == "lat" || name == "lon") {
            localStorage.setItem(dataPoint, value)
            resolve("Success")
        } else {
            validateApiEndpoint(name, value)
            .then( () => localStorage.setItem(dataPoint, value) )
            .then( () => resolve("Success"))
            .catch( (error) => reject(error) )
        }
    })   
}

/**
 * Retrieves location data from local storage
 * @param {String} dataPoint - The user setting name to get
 */
function getUserLocationData(dataPoint) {
    var returnData = localStorage.getItem(dataPoint)
    if (returnData == null) {
        return false
    } else {
        return returnData
    }
}

/**
 * Validates an endpoint to ensure that it works
 * @param {String} name - The name of the endpoint
 * @param {String} variable - The user value to validate
 */
function validateApiEndpoint(name, variable) {
    return new Promise( (resolve, reject) => {
        var endPoint = ""
        
        switch (name) {
            case "current_conditions":
                endPoint = WEATHER_CURRENT_CONDITION_ENDPOINT.replace("<stationName>", variable)
                break
            case "forecast":
                endPoint = WEATHER_FORECAST_ENDPOINT.replace("<coordinates>", variable)
                break
            default:
                endPoint = "fail"
        }

        fetch(endPoint)
        .then(handleFetchErrors)
        .then( () => {
            resolve("Valid Endpoint")
        })
        .catch( () => {
            reject("Invalid Endpoint")
        })
    })
} 

/**
 * Returns a full endpoint URL given the name
 * @param {String} name - The name of the endpoint
 */
function getApiEndpoint(name) {
    switch (name) {
        case "current_conditions":
            return WEATHER_CURRENT_CONDITION_ENDPOINT.replace("<stationName>", getUserLocationData("stationName"))
        case "forecast":
            return WEATHER_FORECAST_ENDPOINT.replace("<coordinates>", getUserLocationData("coordinates"))
        default:
            return null
    }
}

/** 
 * Check if local storage is available 
 * @param {string} type - Can be localStorage or sessionStorage.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API} for source
 */
function storageAvailable(type) {
    var storage;
    try {
        storage = window[type]
        var x = '__storage_test__';
        storage.setItem(x, x)
        storage.removeItem(x)
        return true
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0)
    }
}

/** 
 * Sets all location data based on the lat/lon in the settings form
 */
function saveLatLon() {
    const latitude = document.getElementById("lat").value
    const longitude = document.getElementById("lon").value

    var forecastURL = ""
    var observationStationsURL = ""
    var office = ""
    var gridX = ""
    var gridY = ""
    var stationIdentifier = ""

    fetch(`https://api.weather.gov/points/${latitude},${longitude}`)
    .then(handleFetchErrors)
    .then(response => {
        return response.json()
    })
    .then( (points) => {
        forecastURL = points.properties.forecast
        observationStationsURL = points.properties.observationStations
        office = points.properties.cwa
        gridX = points.properties.gridX
        gridY = points.properties.gridY
        var checkedStation = document.querySelector("input[name='stationId']:checked")
        stationIdentifier = checkedStation ? checkedStation.value : ''

        Promise.all([
            setUserLocationData("stationName", stationIdentifier),
            setUserLocationData("coordinates", `${office}/${gridX},${gridY}`),
            setUserLocationData("lat", latitude),
            setUserLocationData("lon", longitude)
        ]).then(() => {window.location = "index.html"})
    })
    
    // TODO: This is such a hack, clean this mess up!
    saveStations()
    saveSubwayStation()
}

/** 
 * Create a list of stations for a given lat/lon in the settings form
 * @param {Number} latitude - Latitude to lookup
 * @param {Number} longitude - Longitude to lookup
 * @param {Number} selectedStationId - Optional station to select in the form
 */
function generateStationList(latitude, longitude, selectedStationId = null) {
    fetch(`https://api.weather.gov/points/${latitude},${longitude}`)
    .then(handleFetchErrors)
    .then(response => {
        return response.json()
    })
    .then( (points) => {
        fetch(points.properties.observationStations)
        .then(handleFetchErrors)
        .then(response => {
            return response.json()
        })
        .then( (stations) => {
            document.getElementById("station-radio-group").innerHTML = "<p>Choose a local weather station:</p>"
            for (let i = 0; i < 5; i++) {
                var stationId = stations.features[i].properties.stationIdentifier
                var stationName = stations.features[i].properties.name
                var checked = ""
                
                if (!selectedStationId == null) {
                    if (i == 0 ) {
                        checked = "checked"
                    }
                } else {
                    if (selectedStationId == stationId) {
                        checked = "checked"
                    } 
                }

                

                var radioButton = "<div>"
                radioButton += `<input type="radio" id="${stationId}" name="stationId" value="${stationId}" ${checked} >`
                radioButton += `<label for="${stationId}">${stationName}</label>`
                radioButton += "</div>"
                document.getElementById("station-radio-group").innerHTML += radioButton
            }
        })
    })
}

/** 
 * Return lat/lon based on user's location
 */
function getLatLon() {
    return new Promise( (resolve, reject) => {
        navigator.geolocation.getCurrentPosition( (pos) => {
            resolve([pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4)])
        }, (error) => { reject(error)} )
    })
}

/** 
 * Kicks off the population of the settings form with user location data
 */
function getLocation() {
    getLatLon()
        .then((latLon) => populateSettingsForm(latLon[0], latLon[1]))
        .then((latLon) => generateStationList(latLon[0], latLon[1]))
        .catch((error) => console.log(error.message))
}

/** 
 * Populates the settings form with location data
 * @param {Number} latitude - Latitude to populate
 * @param {Number} longitude - Longitude to populate
 */
function populateSettingsForm(lat, lon) {
    document.getElementById("lat").value = lat
    document.getElementById("lon").value = lon
    return [lat,lon]
}

/** 
 * Populates the settings form
 */
function loadFormFromLocalStorage() {
    if (getUserLocationData("lat") && getUserLocationData("lon")) {
        populateSettingsForm(
            getUserLocationData("lat"),
            getUserLocationData("lon")
        )
        generateStationList(
            getUserLocationData("lat"),
            getUserLocationData("lon"),
            getUserLocationData("stationName")
        )
    }

    // Load the bike form
    loadBikeSettingsForm()

    // Load the subway form
    loadSubwaySettingsForm()
}

/** 
 * Populates the bike part of the settings form
 */
// TODO: This needs to be cleaned up and made part of the main settings form loader
function loadBikeSettingsForm() {
    var time = Date.now()
    BIKE_STATION_LIST = []
    return new Promise( (resolve, reject) => {
        fetch( BIKE_STATION_INFO_URL ) 
        .then(handleFetchErrors)
        .then(response => {
            return response.json()
        })
        .then(json => {
            
            json.data.stations.forEach(station => {
                BIKE_STATION_LIST.push( {name: station.name, id: station.station_id} )
            });

            // Sort here
            // TODO: Need this on the settings page, was removed on main.js
            BIKE_STATION_LIST.sort(function (a, b) {
                var nameA = a.name.toUpperCase()
                var nameB = b.name.toUpperCase()
                if ( nameA < nameB ) {
                    return -1
                }
                if ( nameA > nameB ) {
                    return 1
                }

                return 0
            })

            // Add an option to the selected stations list for each of the stations
            BIKE_STATION_LIST.forEach(station => {
                var opt = document.createElement("option")
                opt.value = station.id
                opt.text = station.name
                document.getElementById("station-list").add(opt)
            })



            // Load the selected stations
            getStations()

            BIKE_SELECTED_STATIONS.forEach(station => {
                var opt = document.createElement("option")
                opt.value = station[0]
                opt.text = station[1]
                document.getElementById("selected-stations").add(opt)
            })

            

            // Remove those options from the station list
            for (let station of document.getElementById("station-list").options) {
                if (BIKE_SELECTED_STATIONS.flat().includes(station.value)) {
                    document.getElementById("station-list").removeChild(station)
                }
            }

            // Set the show bikes checkbox
            if (localStorage.getItem("showBikes") == "true") {
                document.getElementById("show-bikes").checked = true
            } else {
                document.getElementById("show-bikes").checked = false
            }
            

        })
        .catch( (error) => {
            console.log(error)
        })
    })
}

/** 
 * Populates the subway part of the settings form
 */
// TODO: This needs to be cleaned up and made part of the main settings form loader
function loadSubwaySettingsForm() {
    document.getElementById("subway-api-key").value = localStorage.getItem("subwayApiKey")
    document.getElementById("subway-boroughs").value = localStorage.getItem("subwayBorough")
    populateLinesForBorough(localStorage.getItem("subwayBorough"))
    document.getElementById("subway-lines").value = localStorage.getItem("subwayLine")
    populateStationsForBoroughLine(localStorage.getItem("subwayBorough"), localStorage.getItem("subwayLine"))
    document.getElementById("subway-stations").value = localStorage.getItem("subwayStation")
}

/** 
 * Adds stations to selected stations form and removes them from the main list
 */
function addStations() {
    var station_list = document.getElementById("station-list") 
    var selected_stations =  document.getElementById("selected-stations")
    var myItems = []

    // Collect items to move
    for (let item of station_list.selectedOptions) {
        myItems.push(item)
    }

    // Move items
    myItems.forEach(item => {
        selected_stations.options[selected_stations.options.length] = station_list.removeChild(station_list.options[item.index])
    })
}

/** 
 * Removes stations from the selected stations form and adds them to the main list
 */
// TODO: This just adds them back to the bottom of the list, maybe a resort is in order
function removeStations() {
    var station_list = document.getElementById("station-list") 
    var selected_stations =  document.getElementById("selected-stations")
    var myItems = []

    // Collect items to move
    for (let item of selected_stations.selectedOptions) {
        myItems.push(item)
    }

    // Move items
    myItems.forEach(item => {
        station_list.options[station_list.options.length] = selected_stations.removeChild(selected_stations.options[item.index])
    })
}

/** 
 * Saves selected stations to local storage
 */
function saveStations() {
    var stationIds = []
    var stationIdsJSON = ""

    // Put each of the list's values in an array
    for (let station of document.getElementById("selected-stations").options) {
        stationIds.push(station.value)
    }
    
    // Create a JSON string of the array
    stationIdsJSON = JSON.stringify(stationIds)

    // Save the JSON to local storage
    localStorage.setItem("bikeStations", stationIdsJSON)

    // Save the show bikes option
    if (document.getElementById("show-bikes").checked) {
        localStorage.setItem("showBikes", "true")
    } else {
        localStorage.setItem("showBikes", "false")
    }
}

/** 
 * Saves selected subway station to local storage
 */
function saveSubwayStation() {
    // Saving everything so we can repopulate the form
    localStorage.setItem("subwayBorough", document.getElementById("subway-boroughs").value)
    localStorage.setItem("subwayLine", document.getElementById("subway-lines").value)
    localStorage.setItem("subwayStation", document.getElementById("subway-stations").value)
    localStorage.setItem("subwayApiKey", document.getElementById("subway-api-key").value)
}

/** 
 * Where the magic happens, for the weather. Updates the display.
 */
function updateWeather() {
    // If the refresh time has lapsed, refresh the data
    if ( (Date.now() - WEATHER_LAST_UPDATE_TIME) > (WEATHER_UPDATE_INTERVAL_SECONDS * 60 * 1000)) {

        // Check to see if local storage is available at all
        if (storageAvailable("localStorage") == false) {
            alert(ERR_NO_LOCAL_STORAGE)
            return false
        }

        // Redirect to the settings page if station and coordinates don't exist
        if (!getUserLocationData("stationName") || !getUserLocationData("coordinates")) {
            window.location = "settings.html"
        }

        getCurrentConditions().then( (conditions) => { 
            document.querySelector("#temperature > div.inner > p.big-number").innerHTML = conditions.temperature
            document.querySelector("#temperature > div.inner > p.big-label").innerHTML = conditions.conditions
            document.querySelector("#wind > div.inner > p.big-number").innerHTML = conditions.windSpeed
    
            if (conditions.windDirection == null) {
                document.querySelector("#wind-arrow").classList.add("hide")
            } else {
                document.querySelector("#wind-arrow").style.transform = "rotate(" + conditions.windDirection + "deg)"
                document.querySelector("#wind-arrow").classList.remove("hide")
            }
    
            if (conditions.relativeHumidity == null) {
                document.querySelector("#humidity").classList.add("hide")
            } else {
                document.querySelector("#humidity").style.strokeDashoffset = mapRelativeHumidity(conditions.relativeHumidity, 314)
                document.querySelector("#humidity").classList.remove("hide")
            }  
    
        }).catch( (error) => {
            document.querySelector("#temperature > .inner").innerHTML = `<p class="error">${ERR_CURRENT_CONDITIONS_NOT_AVAILABLE}</p>`
            document.querySelector("#wind > .inner").innerHTML = `<p class="error">${ERR_CURRENT_CONDITIONS_NOT_AVAILABLE}</p>`
            console.log("[Current Conditions Error]: " + error.textStatus + ": " + error.error)
        })
    
        getForecast().then( (forecast) => {
            document.querySelector("#forecast > #f1-title").innerHTML = forecast[0].name
            document.querySelector("#forecast > #f1").innerHTML = forecast[0].forecast
            document.querySelector("#forecast > #f2-title").innerHTML = forecast[1].name
            document.querySelector("#forecast > #f2").innerHTML = forecast[1].forecast
            document.querySelector("#forecast > #f3-title").innerHTML = forecast[2].name
            document.querySelector("#forecast > #f3").innerHTML = forecast[2].forecast
        }).catch( (error) => {
            document.querySelector("#forecast").innerHTML = `<p class="error">${ERR_FORECAST_NOT_AVAILABLE}</p>`
            console.log("[Forecast Error]: " + error.textStatus + ": " + error.error)
        })
        
        var updateTime = new Date
        document.querySelector("#update-time").innerHTML = `${updateTime.getHours().toString().padStart(2, 0)}:${updateTime.getMinutes().toString().padStart(2, 0)}`

        WEATHER_LAST_UPDATE_TIME = Date.now()
    }
}

// BIKE CODE BELOW

/** 
 * Gets the full list of Bike Stations (IDs and Names)
 */
function getBikeStationList() {
    var time = Date.now()
    BIKE_STATION_LIST = []
    return new Promise( (resolve, reject) => {
        fetch( BIKE_STATION_INFO_URL )
        .then(handleFetchErrors)
        .then(response => {
            return response.json()
        }) 
        .then(json => {
            
            json.data.stations.forEach(station => {
                BIKE_STATION_LIST.push( {name: station.name, id: station.station_id} )
            });

            BIKE_STATIONS_LOADED = true
            resolve("success") 
            
        })
        .catch( (error) => {
            console.log(error)
        })
    })
}

/** 
 * Gets the selected list of Bike Stations
 */
function getStations() {
    var stationIds = []
    var stationIdsJSON = ""
    BIKE_SELECTED_STATIONS = []

    // Get JSON from local storage
    stationIdsJSON = localStorage.getItem("bikeStations")

    // Convert to an array
    stationIds = JSON.parse(stationIdsJSON)

    // Get the name for each of the IDs
    stationIds.forEach(id => {
        BIKE_SELECTED_STATIONS.push([id, BIKE_STATION_LIST.find(station => station.id == id).name]) 
    })

}

/** 
 * Where the magic happens for the bike information. Updates the display
 */
function getStationInformation() {
    return new Promise( (resolve, reject) => {
        fetch( BIKE_STATION_STATUS_URL ) 
        .then(handleFetchErrors)
        .then(response => {
            return response.json()
        })
        .then(json => {
            BIKE_SELECTED_STATIONS.forEach(selectedStation => {
                // For each station, we're going to create a div if it doesn't exist. If it does, we'll update it
                var returnVal = ""
                var station = json.data.stations.find(station => station.station_id == selectedStation[0])

                returnVal += `<p class="bike-station-name">${selectedStation[1]}</p>`
                returnVal += '<div class="bike-number">'
                returnVal += `<p class="available-bikes">${station.num_bikes_available - station.num_ebikes_available}</p>`
                returnVal += '</div>'
                returnVal += '<div class="bike-number">'
                returnVal += `<p class="available-ebikes">${station.num_ebikes_available}</p>`
                returnVal += '</div>'
                returnVal += '<div class="bike-number">'
                returnVal += `<p class="available-docks">${station.num_docks_available}</p>`
                returnVal += '</div>'
                
                if ( document.getElementById(station.station_id) ) {
                    document.getElementById(station.station_id).innerHTML = returnVal
                } else {
                    var stationBlock = document.createElement("div")
                    stationBlock.setAttribute("id", station.station_id)
                    stationBlock.setAttribute("class", "bike-station")
                    stationBlock.innerHTML = returnVal
                    document.getElementById("bikestatus").appendChild(stationBlock)
                }
            })                                     
        })
        .catch( (error) => {
            console.log(error)
        })
    })
}

/** 
 * Kicks off the display update for bikes
 */
function updateBikes() {

    // Updates the display, if conditions are met
    if (BIKE_STATIONS_LOADED && (Date.now() - BIKE_LAST_UPDATE_TIME) > (BIKE_UPDATE_INTERVAL_SECONDS * 1000)) {
        getStations()
        getStationInformation()
        BIKE_LAST_UPDATE_TIME = Date.now()
    }

}


// OVERALL UPDATE CODE BELOW -- It's all about the timing

/** 
 * Kicks off the display update for everything. Will reload from server once in a while
 */
function updateDisplay() {
    // If the page reload interval has lapsed, reload the page from server
    if ( (Date.now() - LAST_PAGE_RELOAD) > (PAGE_RELOAD_INTERVAL_MINUTES * 60 * 1000) ) {
        window.location.reload()
        LAST_PAGE_RELOAD = Date.now()
    } else {
        updateWeather()
        updateArrivals(STATION_ID)

        // Only get bike info if we need to
        if (localStorage.getItem("showBikes") == "true") {
            updateBikes()
        }
    }
    
}

function updateArrivals(gtfsStopId) {
    if ( (Date.now() - SUBWAY_LAST_UPDATE_TIME) > (SUBWAY_UPDATE_INTERVAL_SECONDS * 1000)) {
        if (STATION_ID.trim() == "" || MTA_API_KEY.trim() == "" ) {
            document.getElementById("arrivals").innerHTML=  ERR_NO_SUBWAY_INFO_SET
        } else {
            getArrivalsForGtfsStopId(gtfsStopId)
            .then(arrivals => {
                // Fill it up the HTML
                var html = ""
                Object.keys(arrivals).forEach(direction => {
                    if (arrivals[direction].label !== "") {
                        html += arrivals[direction].label
                        arrivals[direction].trains.forEach(arrival => { 
                            html += '<div class="train">'
                            html += `<p class="line _${arrival.line.toLowerCase()}">${arrival.line}</p>`
                            html += `<p class="destination">${arrival.destination}</p>`
                                if (arrival.seconds <= 30) {
                                    html += '<p class="time arriving">ARRIVING</p>'
                                } else {
                                    html += `<p class="time">${Number(arrival.seconds / 60).toFixed()} min</p>`
                                }  
                            html += '</div>'
                        })
                    }
                })
                
                document.getElementById("stop-name").innerHTML = getStationName(STATION_ID)
                document.getElementById("arrivals").innerHTML = html
                SUBWAY_LAST_UPDATE_TIME = Date.now()
            })
        }
    }
}

/** 
 * Replacement for JQuery's ready function
 */
function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}


/** 
 * Kicks off everything
 */
ready( () => {
    var path = window.location.pathname

    if (path.substring(path.length - 13) == "settings.html") {
        initMtaArrivals() 
        .then( () => {
            loadFormFromLocalStorage()
        })
    } else {

        // Get station information and load display
        initMtaArrivals()
        .then(x => {

            if (localStorage.getItem("showBikes") == "true") {
                document.getElementById("bikestatus").classList.remove("hide")
                // Only get bike info if we need to
                getBikeStationList()
            } else {
                document.getElementById("forecast").classList.remove("hide")
            }
    
            LAST_PAGE_RELOAD = Date.now()
            updateArrivals(STATION_ID)
            updateWeather()
            window.setInterval(updateDisplay, 1000)


        })
        .catch(error => {
            console.error(error)
        })
    }
})