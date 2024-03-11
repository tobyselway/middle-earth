import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { startStandaloneServer } from '@apollo/server/standalone';
import { gql } from 'graphql-tag';
import { promises } from 'fs';
import { handleAuthHeaders } from './persistence/HandleAuthHeaders';
import { handlePersistenceHeaders } from './persistence/HandlePersistenceHeaders';

import { Query as PostQuery, Mutations as PostMutation } from './resolvers/post';
import { Query as CommentQuery, Mutations as CommentMutation, Post as PostComments } from './resolvers/comment';
import { Query as UserQuery, Mutations as UserMutation, Comment as Commenter, Post as Poster } from './resolvers/user';
import { Query as AuthQuery, Mutations as AuthMutation } from './resolvers/auth';
import { Query as LikeQuery, Mutations as LikeMutation, Post as PostLikes, Comment as CommentLikes } from './resolvers/like';

const typeDefs = gql(await promises.readFile('schema.gql', 'utf8'));

const resolvers = {
    Query: {
        ...PostQuery,
        ...CommentQuery,
        ...UserQuery,
        ...AuthQuery,
        ...LikeQuery,
    },
    Mutation: {
        ...PostMutation,
        ...CommentMutation,
        ...UserMutation,
        ...AuthMutation,
        ...LikeMutation,
    },
    Post:{
        ...PostComments,
        ...Poster,
        ...PostLikes,
    },
    Comment: {
        ...Commenter,
        ...CommentLikes,
    },
};

const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

const { url } = await startStandaloneServer(server, {
    context: async ({ req, res }) => ({
        ...await handleAuthHeaders({ req, res }),
        ...await handlePersistenceHeaders({ req, res }),
    }),
    listen: { port: 4000, path: '/query' },
});

console.log(`🚀 Server ready at: ${url}`);
