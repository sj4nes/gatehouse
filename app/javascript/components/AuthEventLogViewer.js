import React from "react"
import PropTypes from "prop-types"
const csrfToken = document.querySelector('meta[name=csrf-token]').getAttribute('content');

import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { Query } from "react-apollo";
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
const GET_AUTHEVENT1 = gql`
{
  authevent(id: 1) {
    id
    createdAt
    ipaddress
  }
}
`;

const GET_AUTHEVENTS = gql`
{
  authevents {
    id
    createdAt
    ipaddress
  }
}
`;
// client
//   .query({
//     query: gql`
//       {
//         authevent(id: 1) {
//           id
//           createdAt
//           ipaddress
//         }
//       }
//     `
//   })
//   .then(result => console.log(result))
//   .catch(result => console.log(result))

function AuthEventView(props) {
  return (<tr>
    <td>{props.event.id}</td>
    <td>{props.event.ipaddress}</td>
    <td>{props.event.createdAt}</td>
  </tr>);
}
class AuthEventLogViewer extends React.Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <React.Fragment>
          <table style={{ backgroundColor: 'white', opacity: 0.99, color: 'black' }}>
            <thead>
              <tr>
                <th>Event#</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <Query query={GET_AUTHEVENTS}>
                {({ loading, error, data }) => {
                  if (error) {
                    return <tr><td>Error</td></tr>;
                  }
                  if (loading || !data) {
                    return <tr><td>Fetching...</td></tr>;
                  }
                  return data.authevents.map((authevent) => <AuthEventView key={authevent.id} event={authevent} />);
                  //return data.authevents.map(AuthEventView); // 
                }}
              </Query>
            </tbody>
            <tfoot>
              <tr>
                <th>Event#</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>

            </tfoot>
          </table>
        </React.Fragment>
      </ApolloProvider>
    );
  }
}

export default AuthEventLogViewer
