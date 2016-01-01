import React from 'react'
import TransitItem from './TransitItem'

class TransitStatus extends React.Component {
  constructor(props) {
    super(props)
  }

  getLineStatus(line, callback) {
    this.props.transitStatus.forEach( data => {
      if (data.name[0] === line) {
        return callback(this.prettyStatus(data.status[0]))
      }
    })
  }

  prettyStatus(uglyStatus) {
    switch (uglyStatus) {
      case 'SERVICE CHANGE':
        return 'Service change'
      case 'GOOD SERVICE':
        return 'Good service'
      case 'PLANNED WORK':
        return 'Planned work'
      case 'DELAYS':
        return 'Delays'
      default:
        return uglyStatus
    }
  }

  render() {
    // TODO We only want to render the lines that are indicated in settings

    // 1. Get the transitLines array from local storage
    var transitLines = JSON.parse(localStorage["transitLines"])

    // 2. Put these lines in another array with the statuses
    var transitLinesWithStatuses = []
    transitLines.forEach( line => {
      this.getLineStatus(line, function(status) {
        transitLinesWithStatuses.push([line, status])
      })
    })

    // 3. Loop through the array and render a row for each selected line
    //    don't forget to set the style for each
    return (
      <div>
        <table>
          <tbody>
              {transitLinesWithStatuses.map( function(line) {
                return <TransitItem key={line[0]} line={line[0]} status={line[1]} />
              }.bind(this))}
          </tbody>
        </table>
      </div>
    )

    {/*}
    var statusObject = new Object
    this.props.transitStatus.forEach( data => {
      statusObject[data.name[0]] = this.prettyStatus(data.status[0])
    })
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-1">1</span>
                <span className="mta-bullet mta-2">2</span>
                <span className="mta-bullet mta-3">3</span>
              </td>
              <td className="service-status">{statusObject['123']}</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-4">4</span>
                <span className="mta-bullet mta-5">5</span>
                <span className="mta-bullet mta-6">6</span>
              </td>
              <td className="service-status">{statusObject['456']}</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-7">7</span>
              </td>
              <td className="service-status">{statusObject['7']}</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-a">A</span>
                <span className="mta-bullet mta-c">C</span>
                <span className="mta-bullet mta-e">E</span>
              </td>
              <td className="service-status">{statusObject['ACE']}</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-b">B</span>
                <span className="mta-bullet mta-d">D</span>
                <span className="mta-bullet mta-f">F</span>
                <span className="mta-bullet mta-m">M</span>
              </td>
              <td className="service-status">{statusObject['BDFM']}</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-j">J</span>
                <span className="mta-bullet mta-z">Z</span>
              </td>
              <td className="service-status">{statusObject['JZ']}</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-l">L</span>
              </td>
              <td className="service-status">{statusObject['L']}</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-n">N</span>
                <span className="mta-bullet mta-q">Q</span>
                <span className="mta-bullet mta-r">R</span>
              </td>
              <td className="service-status">{statusObject['NQR']}</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-s">S</span>
              </td>
              <td className="service-status">{statusObject['S']}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
    {*/}
  }
}

export default TransitStatus
