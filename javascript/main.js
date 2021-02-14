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

// Runtime Globals
var WEATHER_STATION = ""
var WEATHER_GRID_COORDINATES = ""
var WEATHER_LAST_UPDATE_TIME = 0
var BIKE_STATION_LIST = []
var BIKE_SELECTED_STATIONS = []
var BIKE_STATIONS_LOADED = false
var BIKE_LAST_UPDATE_TIME = 0
var LAST_PAGE_RELOAD = ""

// User facing text
const ERR_CURRENT_CONDITIONS_NOT_AVAILABLE = "Current conditions not available ¯\\_(ツ)_/¯"
const ERR_FORECAST_NOT_AVAILABLE = "Forecast not available ¯\\_(ツ)_/¯"
const ERR_NO_LOCAL_STORAGE = "It appears that this browser doesn't support local storage, or it isn't enabled."
const ERR_NO_BIKE_STATIONS_SET = "No bike stations setup. Choose at least one station to see status."

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
        milesPerHour = KilometersPerHour * 0.6213712
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
    // TODO: Remove JQuery dependency 
    return new Promise( (resolve, reject) => {
        var currentConditions = {}
        $.getJSON( getApiEndpoint("current_conditions") ) 
        .done( (json) => {
            currentConditions.temperature = replaceNulls(cToF(json.properties.temperature.value))
            currentConditions.conditions = replaceNulls(json.properties.textDescription, "")
            currentConditions.windSpeed = replaceNulls(KphToMph(json.properties.windSpeed.value))
            currentConditions.windDirection = json.properties.windDirection.value
            currentConditions.relativeHumidity = json.properties.relativeHumidity.value
            resolve(currentConditions)
        })
        .fail( (jqxhr, textStatus, error) => {
            currentConditions.error = error
            currentConditions.textStatus = textStatus
            reject(currentConditions)
        })
    })
}

/**
 * Fetches current weather forecast from server
 */
function getForecast() {
    // TODO: Remove JQuery dependency 
    return new Promise( (resolve, reject) => {
        var forecast = []
        $.getJSON( getApiEndpoint("forecast")  )
        .done( (json) => {
            forecast.push({name:json.properties.periods[0].name, forecast:json.properties.periods[0].detailedForecast})
            forecast.push({name:json.properties.periods[1].name, forecast:json.properties.periods[1].detailedForecast})
            forecast.push({name:json.properties.periods[2].name, forecast:json.properties.periods[2].shortForecast})
            resolve(forecast)
        })
        .fail( (jqxhr, textStatus, error) => {
            forecast.error = error
            forecast.textStatus = textStatus
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
    // TODO: Remove JQuery dependency
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
    // TODO: Remove JQuery dependency
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

        $.getJSON(endPoint)
        .done( (json) => {
            resolve("Valid Endpoint")
        })
        .fail( (jqxhr, textStatus, error) => {
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

    // TODO: Remove JQuery dependency
    $.getJSON(`https://api.weather.gov/points/${latitude},${longitude}`)
        .done( (points) => {
            forecastURL = points.properties.forecast
            observationStationsURL = points.properties.observationStations
            office = points.properties.cwa
            gridX = points.properties.gridX
            gridY = points.properties.gridY
            stationIdentifier = $("input[name='stationId']:checked").val()

            Promise.all([
                setUserLocationData("stationName", stationIdentifier),
                setUserLocationData("coordinates", `${office}/${gridX},${gridY}`),
                setUserLocationData("lat", latitude),
                setUserLocationData("lon", longitude)
            ]).then(() => {window.location = "index.html"})
        })
    
}

/** 
 * Create a list of stations for a given lat/lon in the settings form
 * @param {Number} latitude - Latitude to lookup
 * @param {Number} longitude - Longitude to lookup
 * @param {Number} selectedStationId - Optional station to select in the form
 */
function generateStationList(latitude, longitude, selectedStationId = null) {
    // TODO: Remove JQuery dependency
    $.getJSON(`https://api.weather.gov/points/${latitude},${longitude}`)
        .done( (points) => {
            $.getJSON(points.properties.observationStations)
                .done( (stations) => {
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
            $("#temperature > div.inner > p.big-number").html(conditions.temperature)
            $("#temperature > div.inner > p.big-label").html(conditions.conditions)
            $("#wind > div.inner > p.big-number").html(conditions.windSpeed)
    
            if (conditions.windDirection == null) {
                $("#wind-arrow").addClass("hide")
            } else {
                $("#wind-arrow").css("transform", "rotate(" + conditions.windDirection + "deg)").removeClass("hide")
            }
    
            if (conditions.relativeHumidity == null) {
                $("#humidity").addClass("hide")
            } else {
                $("#humidity").css("stroke-dashoffset", mapRelativeHumidity(conditions.relativeHumidity, 314)).removeClass("hide")
            }  
    
        }).catch( (error) => {
            $("#temperature > .inner").html(`<p class="error">${ERR_CURRENT_CONDITIONS_NOT_AVAILABLE}</p>`)
            $("#wind > .inner").html(`<p class="error">${ERR_CURRENT_CONDITIONS_NOT_AVAILABLE}</p>`)
            console.log("[Current Conditions Error]: " + error.textStatus + ": " + error.error)
        })
    
        getForecast().then( (forecast) => {
            $("#forecast > #f1-title").html(forecast[0].name)
            $("#forecast > #f1").html(forecast[0].forecast)
            $("#forecast > #f2-title").html(forecast[1].name)
            $("#forecast > #f2").html(forecast[1].forecast)
            $("#forecast > #f3-title").html(forecast[2].name)
            $("#forecast > #f3").html(forecast[2].forecast)
        }).catch( (error) => {
            $("#forecast").html(`<p class="error">${ERR_FORECAST_NOT_AVAILABLE}</p>`)
            console.log("[Forecast Error]: " + error.textStatus + ": " + error.error)
        })
        
        var updateTime = new Date
        $("#update-time").html(`${updateTime.getHours().toString().padStart(2, 0)}:${updateTime.getMinutes().toString().padStart(2, 0)}`)

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
        // TODO: Remove JQuery Dependency
        $.getJSON( BIKE_STATION_INFO_URL ) 
        .done( (json) => {
            
            json.data.stations.forEach(station => {
                BIKE_STATION_LIST.push( {name: station.name, id: station.station_id} )
            });

            BIKE_STATIONS_LOADED = true
            resolve("success") 
            
        })
        .fail( (jqxhr, textStatus, error) => {
            console.log(textStatus)
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
        $.getJSON( BIKE_STATION_STATUS_URL ) 
        .done( (json) => {
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
        .fail( (jqxhr, textStatus, error) => {
            console.log(textStatus)
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
        updateBikes()
    }
    
}


/** 
 * Kicks off everything
 */
// TODO: Remove JQuery dependency
$(document).ready( () => {
    var path = window.location.pathname

    if (path.substring(path.length - 13) == "settings.html") {
        loadFormFromLocalStorage()
    } else {
        LAST_PAGE_RELOAD = Date.now()
        updateWeather()
        getBikeStationList()
        window.setInterval(updateDisplay, 1000)
    }
})