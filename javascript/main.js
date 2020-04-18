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

function updateWeather() {
    const current_condition_url = "https://api.weather.gov/stations/KNYC/observations/latest"
    const forecast_url = "https://api.weather.gov/gridpoints/OKX/34,33/forecast"

    $.getJSON( current_condition_url ) 
        .done(function( json ) {
            $("#temperature > div.inner > p.big-number").html(replaceNulls(cToF(json.properties.temperature.value)))
            $("#temperature > div.inner > p.big-label").html(replaceNulls(json.properties.textDescription, ""))
            $("#wind > div.inner > p.big-number").html(replaceNulls(mpsToMph(json.properties.windSpeed.value)))
            if (json.properties.windDirection.value == null) {
                $("#wind-arrow").addClass("hide")
            } else {
                $("#wind-arrow").css("transform", "rotate(" + json.properties.windDirection.value + "deg)").removeClass("hide")
            }
            if (json.properties.relativeHumidity.value == null) {
                $("#humidity").addClass("hide")
            } else {
                $("#humidity").css("stroke-dashoffset", mapRelativeHumidity(json.properties.relativeHumidity.value, 604)).removeClass("hide")
            }
        })
        .fail(function ( jqxhr, textStatus, error ) {
            $("#temperature > .inner").html('<p class="error">Current conditions not available ¯\\_(ツ)_/¯</p>')
            $("#wind > .inner").html('<p class="error">Current conditions not available ¯\\_(ツ)_/¯</p>')
            console.log("[Current Conditions] " + textStatus + ": " + error)
    })

    $.getJSON( forecast_url )
        .done(function( json ) {
            $("#forecast > #f1-title").html(json.properties.periods[0].name)
            $("#forecast > #f1").html(json.properties.periods[0].detailedForecast)
            $("#forecast > #f2-title").html(json.properties.periods[1].name)
            $("#forecast > #f2").html(json.properties.periods[1].detailedForecast)
            $("#forecast > #f3-title").html(json.properties.periods[2].name)
            $("#forecast > #f3").html(json.properties.periods[2].shortForecast)
        })
        .fail(function ( jqxhr, textStatus, error ) {
            $("#forecast").html('<p class="error">Forecast not available ¯\\_(ツ)_/¯</p>')
            console.log("[Forecast] " + textStatus + ": " + error)
    })
    
    $("#update-time > p").html(moment().format("HH:mm"))
}

$( document ).ready(function() {
    updateWeather()
    window.setInterval(updateWeather, 60 * 30 * 1000)
})