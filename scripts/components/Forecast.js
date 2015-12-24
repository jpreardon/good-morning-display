import React from 'react'

class Forecast extends React.Component {
  constructor() {
    super()

  }

  render() {
    return (
      <div className="small-6 columns">
        <div className="row">
          <div className="small-3 columns short-day">
            <p id="first-day-short">N/A</p>
          </div>
          <div className="small-5 columns">
            <img id="first-icon" src="" />
          </div>
          <div className="small-4 columns forecast">
            <p id="first-forecast" className="hide-for-small">N/A</p>
            <p id="first-forecast-short" className="show-for-small">N/A</p>
          </div>
          <div className="row">
            <div className="small-3 columns short-day">
              <p id="second-day-short">N/A</p>
            </div>
            <div className="small-5 columns">
              <img id="second-icon" src="" />
            </div>
            <div className="small-4 columns forecast">
              <p id="second-forecast" className="hide-for-small">N/A</p>
              <p id="second-forecast-short" className="show-for-small">N/A</p>
            </div>
          </div>
          <div className="row">
            <div className="small-3 columns short-day">
              <p id="third-day-short">N/A</p>
            </div>
            <div className="small-5 columns">
              <img id="third-icon" src="" />
            </div>
            <div className="small-4 columns forecast">
              <p id="third-forecast" className="hide-for-small">N/A</p>
              <p id="third-forecast-short" className="show-for-small">N/A</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Forecast
