// Weather data API setup
const CURRENT_CONDITION_ENDPOINT = "https://api.weather.gov/stations/<stationName>/observations/latest"
const FORECAST_ENDPOINT = "https://api.weather.gov/gridpoints/<coordinates>/forecast"
// These are set dynamically at runtime
var WEATHER_STATION = ""
var WEATHER_GRID_COORDINATES = ""

// User facing text
const ERR_CURRENT_CONDITIONS_NOT_AVAILABLE = "Current conditions not available ¯\\_(ツ)_/¯"
const ERR_FORECAST_NOT_AVAILABLE = "Forecast not available ¯\\_(ツ)_/¯"
const ERR_NO_LOCAL_STORAGE = "It appears that this browser doesn't support local storage, or it isn't enabled."
// This is a temporary message, remove ASAP
const ERR_NO_LOCATION_DATA = "No location data is set. Open console and set it!!! :P"

function cToF(celsius) {
    if (celsius == null) {
        return null
    } else {
        celsius = celsius * 9 /5 + 32
        return celsius.toFixed(0) + "º"
    }
}

function mpsToMph(metersPerSecond) {
    if (metersPerSecond == null) {
        return null
    } else {
        milesPerHour = metersPerSecond * 2.236936
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

function mapRelativeHumidity(relativeHumidity, maxLength) {
    // TODO: This seems so hacky, I'm going to open an issue for it #techdebt
    
    const step = maxLength / 100 

    if (relativeHumidity.toFixed(0) == 100 || relativeHumidity.toFixed(0) < 0 || relativeHumidity.toFixed(0) > 100) {
        return 0
    } else {
        values=[]
        for (let x = maxLength; x > 0; x = x - step) {
            values.push(x.toFixed(0))
        }
        return values[relativeHumidity.toFixed(0)]
    }
}

function getCurrentConditions() {
    return new Promise( (resolve, reject) => {
        var currentConditions = {}
        $.getJSON( getApiEndpoint("current_conditions") ) 
        .done( (json) => {
            currentConditions.temperature = replaceNulls(cToF(json.properties.temperature.value))
            currentConditions.conditions = replaceNulls(json.properties.textDescription, "")
            currentConditions.windSpeed = replaceNulls(mpsToMph(json.properties.windSpeed.value))
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

function getForecast() {
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

function setUserLocationData(dataPoint, value) {
    return new Promise( (resolve, reject) => {
        var name = ""
        
        switch (dataPoint) {
            case "stationName":
                name =  "current_conditions"
                break
            case "coordinates":
                name = "forecast"
                break
            default:
                return reject("Invalid Data Point")
        }

        validateApiEndpoint(name, value)
        .then( () => localStorage.setItem(dataPoint, value) )
        .then( () => resolve("Success"))
        .catch( (error) => reject(error) )
    })   
}

function getUserLocationData(dataPoint) {
    var returnData = localStorage.getItem(dataPoint)
    if (returnData == null) {
        return false
    } else {
        return returnData
    }
}

function validateApiEndpoint(name, variable) {
    return new Promise( (resolve, reject) => {
        var endPoint = ""
        
        switch (name) {
            case "current_conditions":
                endPoint = CURRENT_CONDITION_ENDPOINT.replace("<stationName>", variable)
                break
            case "forecast":
                endPoint = FORECAST_ENDPOINT.replace("<coordinates>", variable)
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

function getApiEndpoint(name) {
    switch (name) {
        case "current_conditions":
            return CURRENT_CONDITION_ENDPOINT.replace("<stationName>", getUserLocationData("stationName"))
        case "forecast":
            return FORECAST_ENDPOINT.replace("<coordinates>", getUserLocationData("coordinates"))
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

function updateWeather() {

    // Check to see if local storage is available at all
    if (storageAvailable("localStorage") == false) {
        alert(ERR_NO_LOCAL_STORAGE)
        return false
    }

    // TODO: This is temporary, it should redirect to the settings page once that exists
    if (!getUserLocationData("stationName") || !getUserLocationData("coordinates")) {
        alert(ERR_NO_LOCATION_DATA)
        return false
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
            $("#humidity").css("stroke-dashoffset", mapRelativeHumidity(conditions.relativeHumidity, 604)).removeClass("hide")
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
    $("#update-time > p").html(`${updateTime.getHours().toString().padStart(2, 0)}:${updateTime.getMinutes().toString().padStart(2, 0)}`)
}

$(document).ready( () => {
    updateWeather()
    window.setInterval(updateWeather, 60 * 30 * 1000)
})