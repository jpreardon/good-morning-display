import React from 'react'

class TransitItem extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return(
      <tr>
        <td className="train-line">
          {this.props.line}
        </td>
        <td className="service-status">{this.props.status}</td>
      </tr>
    )
  }

}

export default TransitItem

/*
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

*/
