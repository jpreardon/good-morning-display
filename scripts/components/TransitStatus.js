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
    // TODO We only want to render the lines that are indicated in settings,
    // this seems messy and over complicated, refactor!

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
  }
}

export default TransitStatus
