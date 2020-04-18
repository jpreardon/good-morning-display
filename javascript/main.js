// APIs
const CURRENT_CONDITION_URL = "https://api.weather.gov/stations/KNYC/observations/latest"
const FORECAST_URL = "https://api.weather.gov/gridpoints/OKX/34,33/forecast"

// User facing text
const ERR_CURRENT_CONDITIONS_NOT_AVAILABLE = "Current conditions not available ¯\\_(ツ)_/¯"
const ERR_FORECAST_NOT_AVAILABLE = "Forecast not available ¯\\_(ツ)_/¯"

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

const getCurrentConditions = new Promise(
    function (resolve) {
        var currentConditions = {}
        $.getJSON( CURRENT_CONDITION_URL ) 
        .done( function(json) {
            currentConditions.temperature = replaceNulls(cToF(json.properties.temperature.value))
            currentConditions.conditions = replaceNulls(json.properties.textDescription, "")
            currentConditions.windSpeed = replaceNulls(mpsToMph(json.properties.windSpeed.value))
            currentConditions.windDirection = json.properties.windDirection.value
            currentConditions.relativeHumidity = json.properties.relativeHumidity.value
            resolve(currentConditions)
        })
        .fail( function (jqxhr, textStatus, error) {
            currentConditions.error = error
            currentConditions.textStatus = textStatus
            resolve(currentConditions)
        })
    }
)

const getForecast = new Promise(
    function (resolve) {
        var forecast = []
        $.getJSON(FORECAST_URL)
        .done( function (json) {
            forecast.push({name:json.properties.periods[0].name, forecast:json.properties.periods[0].detailedForecast})
            forecast.push({name:json.properties.periods[1].name, forecast:json.properties.periods[1].detailedForecast})
            forecast.push({name:json.properties.periods[2].name, forecast:json.properties.periods[2].shortForecast})
            resolve(forecast)
        })
        .fail( function (jqxhr, textStatus, error) {
            forecast.error = error
            forecast.textStatus = textStatus
            resolve(forecast)
        })
    }
)

function updateWeather() {

    getCurrentConditions.then( function (conditions) { 
        if (conditions.error == undefined) {
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
        } else {
            $("#temperature > .inner").html(`<p class="error">${ERR_CURRENT_CONDITIONS_NOT_AVAILABLE}</p>`)
            $("#wind > .inner").html(`<p class="error">${ERR_CURRENT_CONDITIONS_NOT_AVAILABLE}</p>`)
            console.log("[Current Conditions Error]: " + conditions.textStatus + ": " + conditions.error)
        }       
    })

    getForecast.then( function (forecast) {
        if (forecast.error == undefined) {
            $("#forecast > #f1-title").html(forecast[0].name)
            $("#forecast > #f1").html(forecast[0].forecast)
            $("#forecast > #f2-title").html(forecast[1].name)
            $("#forecast > #f2").html(forecast[1].forecast)
            $("#forecast > #f3-title").html(forecast[2].name)
            $("#forecast > #f3").html(forecast[2].forecast)
        } else {
            $("#forecast").html(`<p class="error">${ERR_FORECAST_NOT_AVAILABLE}</p>`)
            console.log("[Forecast Error]: " + forecast.textStatus + ": " + forecast.error)
        }
    })
    
    var updateTime = new Date
    $("#update-time > p").html(`${updateTime.getHours()}:${updateTime.getMinutes()}`)
}

$( document ).ready(function() {
    updateWeather()
    window.setInterval(updateWeather, 60 * 30 * 1000)
})