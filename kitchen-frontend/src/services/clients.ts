import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const queryApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4002';
const commandApiUrl = import.meta.env.VITE_COMMAND_API_URL || 'http://localhost:4001';

export const queryClient = new ApolloClient({
  link: new HttpLink({
    uri: `${queryApiUrl}/graphql`
  }),
  cache: new InMemoryCache()
});

export const commandClient = new ApolloClient({
  link: new HttpLink({
    uri: `${commandApiUrl}/graphql`
  }),
  cache: new InMemoryCache()
});
