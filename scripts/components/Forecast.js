import React from 'react'
import ForecastItem from './ForecastItem'

// TODO This, right here, is such a hack, but I don't seem to be doing things
// the "react way" and probably not the "javascript way" either. But, I've been
// looking at this stupid thing for hours and I can't get it to work. Now it's
// time to go and I want something to work, so I'm going to totally hack this
// up. Take that!
//
// One day, I'll refactor all of this mess down to the three lines of code I
// actually need...

var weekday_1 = ""
var time_1 = ""
var imageUrl_1 = ""
var temp_1 = ""
var weekday_2 = ""
var time_2 = ""
var imageUrl_2 = ""
var temp_2 = ""
var weekday_3 = ""
var time_3 = ""
var imageUrl_3 = ""
var temp_3 = ""

class Forecast extends React.Component {
  constructor(props) {
    super(props)
  }

  getThreeForecasts() {
    var forecastCount = 1
    var ourForecasts = []
    this.props.forecasts.forEach( function(forecast) {
      if (forecast.FCTTIME.hour == "9" || forecast.FCTTIME.hour == "13" || forecast.FCTTIME.hour == "17") {
        if (forecastCount < 4) {
          // TODO Oh, such a bloody hack
          switch (forecastCount) {
            case 1:
              weekday_1 = forecast.FCTTIME.weekday_name_abbrev.toUpperCase()
              time_1 = `${forecast.FCTTIME.hour_padded}:00`
              imageUrl_1 = `http://icons.wxug.com/i/c/j/${forecast.icon}`
              temp_1 = forecast.temp.english
            case 2:
              weekday_2 = forecast.FCTTIME.weekday_name_abbrev.toUpperCase()
              time_2 = `${forecast.FCTTIME.hour_padded}:00`
              imageUrl_2 = `http://icons.wxug.com/i/c/j/${forecast.icon}`
              temp_2 = forecast.temp.english
            case 3:
              weekday_3 = forecast.FCTTIME.weekday_name_abbrev.toUpperCase()
              time_3 = `${forecast.FCTTIME.hour_padded}:00`
              imageUrl_3 = `http://icons.wxug.com/i/c/j/${forecast.icon}`
              temp_3 = forecast.temp.english
          }
          forecastCount++
        }
      }
    })
  }

  render() {
    this.getThreeForecasts()
    return (
      <div className="forecast-weather">
        <ul>
          {/* TODO The hacking continues, such an embarassment */}
          <ForecastItem day={weekday_1} time={time_1} image_url={imageUrl_1} temp={temp_1} />
          <ForecastItem day={weekday_2} time={time_2} image_url={imageUrl_2} temp={temp_2} />
          <ForecastItem day={weekday_3} time={time_3} image_url={imageUrl_3} temp={temp_3} />
        </ul>
      </div>
    )
  }
}

export default Forecast
