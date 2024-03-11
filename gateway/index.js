import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';

const mordor_PORT =  process.env.MORDOR_PORT ?? 4000;
const isengard_PORT =  process.env.ISENGARD_PORT ?? 8000;
const mordor_HOST =  process.env.MORDOR_HOST ?? "localhost";
const isengard_HOST =  process.env.ISENGARD_HOST ?? "localhost";

class PassthroughDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request, context }) {
        request.http.headers.set("mock-persistence", context.persistence ? 'true' : 'false');
        request.http.headers.set("clear-persistence", context.clearPersistence ? 'true' : 'false');
        if(context.authorization) {
            request.http.headers.set("authorization", context.authorization);
        }
    }
}

const server = new ApolloServer({
    gateway: new ApolloGateway({

        supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
                { name: 'mordor', url: `http://${mordor_HOST}:${mordor_PORT}/query` },
                // { name: 'isengard', url: `http://${isengard_HOST}:${isengard_PORT}/query` },
                // ...additional subgraphs...
            ],
        }),

        buildService({ name, url }) {
            return new PassthroughDataSource({ url });
        },
    }),
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 6473, path: '/query' },
    context: async ({ req, res }) => {
        return {
            persistence: req.headers['mock-persistence']?.toLowerCase() == 'true',
            clearPersistence: req.headers['clear-persistence']?.toLowerCase() == 'true',
            authorization: req.headers['authorization'],
        };
    },
});
console.log(`🚀 Server ready at ${url}`);
