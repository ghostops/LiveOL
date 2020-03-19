import ApolloClient from 'apollo-boost';

export const client = new ApolloClient({
    // uri: 'http://localhost:4000',
    uri: 'https://api.liveol.larsendahl.se',
});
