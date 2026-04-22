import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const COMMAND_HTTP_LINK = new HttpLink({
  uri: 'http://localhost:4001/graphql'
});

const QUERY_HTTP_LINK = new HttpLink({
  uri: 'http://localhost:4002/graphql'
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4002/graphql'
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