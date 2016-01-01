import React from 'react'
import TransitLineSymbol from './TransitLineSymbol'

class TransitItem extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    var individualLines = []
    for (var i = 0; i < this.props.line.length; i++) {
      individualLines.push(<TransitLineSymbol key={this.props.line.charAt(i)} line={this.props.line.charAt(i)} />)
    }
    return(
      <tr>
        <td className="train-line">
          {individualLines}
        </td>
        <td className="service-status">{this.props.status}</td>
      </tr>
    )
  }
}

export default TransitItem
