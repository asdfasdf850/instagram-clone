import ApolloClient from 'apollo-client'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'


const client = new ApolloClient({
  link: new WebSocketLink({
    uri: 'wss://cool-caribou-92.hasura.app/v1/graphql',
    options: {
      reconnect: true,
      connectionParams: {
        headers: {
          'x-hasura-admin-secret': process.env.REACT_APP_X_HASURA_ADMIN_SECRET
        }
      }
    }
  }),
  cache: new InMemoryCache()
})

export default client
