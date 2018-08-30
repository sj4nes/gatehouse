import React from "react"
import PropTypes from "prop-types"
class AuthEventLogViewer extends React.Component {
  render() {
    return (
      <React.Fragment>
        <table class="striped">
          <thead>
            <tr>
              <th>Account</th>
              <th>IP Address</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Test</td>
              <td>Test</td>
              <td>Test</td>
            </tr>
          </tbody>
          <tfoot>
            <th>Account</th>
            <th>IP Address</th>
            <th>Timestamp</th>
          </tfoot>
        </table>
      </React.Fragment>
    );
  }
}

export default AuthEventLogViewer
