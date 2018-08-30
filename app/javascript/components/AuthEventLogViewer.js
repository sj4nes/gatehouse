import React from "react"
import PropTypes from "prop-types"
const csrfToken = document.querySelector('meta[name=csrf-token]').getAttribute('content');

import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import gql from "graphql-tag";

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://127.0.0.1:3000/graphql',
    credentials: 'same-origin',
    headers: {
      'X-CSRF-Token': csrfToken
    }
  }),
  cache: new InMemoryCache()
});
client
  .query({
    query: gql`
      {
        authevent(id: 1) {
          id
          createdAt
          ipaddress
        }
      }
    `
  })
  .then(result => console.log(result))
  .catch(result => console.log(result))
class AuthEventLogViewer extends React.Component {
  render() {
    return (
      <React.Fragment>
        <table className="striped">
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
            <tr>
              <th>Account</th>
              <th>IP Address</th>
              <th>Timestamp</th>
            </tr>

          </tfoot>
        </table>
      </React.Fragment>
    );
  }
}

export default AuthEventLogViewer
