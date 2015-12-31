import React from 'react'

class Settings extends React.Component {
  constructor() {
    super()

    this.state = { weatherKey : '', zipcode : '', transitLines : [] }

    // If api key and zipcode exist in local storage, load them up
    if (localStorage.zipcode) {
      this.state.zipcode = localStorage.zipcode
    }

    if (localStorage.weatherKey) {
      this.state.weatherKey = localStorage.weatherKey
    }

    // TODO If transitlines exist in local storage, load them up
    if (localStorage['transitLines']) {
      // JSON.parse(localStorage["transitLines"])
    }
  }

  saveForm(event) {
    event.preventDefault()
    // Save zipcode and weatherkey to local storage
    localStorage.zipcode = event.target['zipcode'].value
    localStorage.weatherKey = event.target['weather-api-key'].value

    // TODO save transitlines to local storage
  }

  render() {
    return(
      <div className="settings-container">
        <h1>Settings</h1>
        <p>You need to set some stuff up.</p>
        <h2>Weather</h2>
        <form onSubmit={this.saveForm}>
          <label htmlFor="weather-api-key">Weather Underground API Key</label>
          <input type="text" id="weather-api-key" defaultValue={this.state.weatherKey} />
          <label htmlFor="zipcode">Zip Code</label>
          <input type="number" id="zipcode" defaultValue={this.state.zipcode}/>
          <h2>Transit</h2>
          <p>Select which lines you want</p>
          <label><input type="checkbox" name="transitLines[]" value="123"/>
            <span className="mta-bullet mta-1">1</span>
            <span className="mta-bullet mta-2">2</span>
            <span className="mta-bullet mta-3">3</span>
          </label>
          <label><input type="checkbox" name="transitLines[]" value="456"/>
            <span className="mta-bullet mta-4">4</span>
            <span className="mta-bullet mta-5">5</span>
            <span className="mta-bullet mta-6">6</span>
          </label>
          <label><input type="checkbox" name="transitLines[]" value="7"/>
            <span className="mta-bullet mta-7">7</span>
          </label>
          <label><input type="checkbox" name="transitLines[]" value="ACE"/>
            <span className="mta-bullet mta-a">A</span>
            <span className="mta-bullet mta-c">C</span>
            <span className="mta-bullet mta-e">E</span>
          </label>
          <label><input type="checkbox" name="transitLines[]" value="BDFM"/>
            <span className="mta-bullet mta-b">B</span>
            <span className="mta-bullet mta-d">D</span>
            <span className="mta-bullet mta-f">F</span>
            <span className="mta-bullet mta-m">M</span>
          </label>
          <label><input type="checkbox" name="transitLines[]" value="JZ"/>
            <span className="mta-bullet mta-j">J</span>
            <span className="mta-bullet mta-z">Z</span>
          </label>
          <label><input type="checkbox" name="transitLines[]" value="L"/>
            <span className="mta-bullet mta-l">L</span>
          </label>
          <label><input type="checkbox" name="transitLines[]" value="NQR"/>
            <span className="mta-bullet mta-n">N</span>
            <span className="mta-bullet mta-q">Q</span>
            <span className="mta-bullet mta-r">R</span>
          </label>
          <label><input type="checkbox" name="transitLines[]" value="NQR"/>
            <span className="mta-bullet mta-s">S</span>
          </label>
          <input type="Submit" />
        </form>
      </div>
    )
  }

}

export default Settings
