import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import './styles/index.css'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient, InMemoryCache, HttpLink, split } from 'apollo-client-preset'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities';

const serviceId = 'cj9stxa4j8qpz0164o8a9yssi';
const httpLink = new HttpLink({uri: `https://api.graph.cool/simple/v1/${serviceId}`})

const wsLink = new WebSocketLink({
  uri: `wss://subscriptions.graph.cool/v1/${serviceId}`,
  options: {
    reconnect: true
  }
})

const isSubscription = qqlOperation => {
  const { kind, operation } = getMainDefinition(qqlOperation.query)
  return kind === 'OperationDefinition' && operation === 'subscription'
}

const link = split(
  isSubscription,
  wsLink,
  httpLink
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
)
