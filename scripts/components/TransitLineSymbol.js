import React from 'react'

class TransitLineSymbol extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return(
      <span className={`mta-bullet mta-${this.props.line.toLowerCase()}`}>{this.props.line}</span>
    )
  }
}

export default TransitLineSymbol
