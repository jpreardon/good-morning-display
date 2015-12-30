import React from 'react'

class TransitStatus extends React.Component {
  constructor() {
    super()
  }

  render() {
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
              <td className="service-status">Good Service</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-4">4</span>
                <span className="mta-bullet mta-5">5</span>
                <span className="mta-bullet mta-6">6</span>
              </td>
              <td className="service-status">Good Service</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-7">7</span>
              </td>
              <td className="service-status">Good Service</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-a">A</span>
                <span className="mta-bullet mta-c">C</span>
                <span className="mta-bullet mta-e">E</span>
              </td>
              <td className="service-status">Good Service</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-b">B</span>
                <span className="mta-bullet mta-d">D</span>
                <span className="mta-bullet mta-f">F</span>
                <span className="mta-bullet mta-m">M</span>
              </td>
              <td className="service-status">Delays</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-j">J</span>
                <span className="mta-bullet mta-z">Z</span>
              </td>
              <td className="service-status">Delays</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-l">L</span>
              </td>
              <td className="service-status">Delays</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-n">N</span>
                <span className="mta-bullet mta-r">R</span>
                <span className="mta-bullet mta-q">Q</span>
              </td>
              <td className="service-status">Delays</td>
            </tr>
            <tr>
              <td className="train-line">
                <span className="mta-bullet mta-s">S</span>
              </td>
              <td className="service-status">Delays</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default TransitStatus
