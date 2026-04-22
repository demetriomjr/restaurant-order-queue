import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4002';
const commandApiUrl = import.meta.env.VITE_COMMAND_API_URL || 'http://localhost:4001';

const COMMAND_HTTP_LINK = new HttpLink({
  uri: `${commandApiUrl}/graphql`
});

const QUERY_HTTP_LINK = new HttpLink({
  uri: `${apiUrl}/graphql`
});

const wsLink = new GraphQLWsLink(createClient({
  url: `ws://${apiUrl.replace('http', 'ws')}/graphql`
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  QUERY_HTTP_LINK
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});

export const commandClient = new ApolloClient({
  link: COMMAND_HTTP_LINK,
  cache: new InMemoryCache()
});