import React from 'react'

class Forecast extends React.Component {
  constructor() {
    super()

  }

  render() {
    return (
      <div className="forecast-weather">
        <ul>
          <li><p>TUE<br />13:00</p> <img src="http://icons.wxug.com/i/c/j/cloudy.gif" /> <p>90º</p></li>
          <li><p>TUE<br />17:00</p> <img src="http://icons.wxug.com/i/c/j/cloudy.gif" /> 90º</li>
          <li><p>WED<br />09:00</p> <img src="http://icons.wxug.com/i/c/j/cloudy.gif" /> 90º</li>
        </ul>
      </div>
    )
  }
}

export default Forecast
