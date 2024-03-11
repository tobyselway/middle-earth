import { expect, test, beforeAll, beforeEach } from 'bun:test';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';

const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:6473/query';
let client;

beforeAll(() => {
    client = new ApolloClient({
        uri: apiUrl,
        headers: {
            'mock-persistence': 'true',
        },
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: {
                fetchPolicy: 'no-cache',
                errorPolicy: 'all',
            },
            query: {
                fetchPolicy: 'no-cache',
                errorPolicy: 'all',
            },
        },
    });
});

beforeEach(() => {
    const resetClient = new ApolloClient({
        uri: apiUrl,
        headers: {
            'mock-persistence': 'true',
            'clear-persistence': 'true',
        },
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: {
                fetchPolicy: 'no-cache',
                errorPolicy: 'all',
            },
            query: {
                fetchPolicy: 'no-cache',
                errorPolicy: 'all',
            },
        },
    });
    return resetClient.query({
        query: gql`
            query {
                comments { __typename }
            }
        `,
    });
});

test('when there are no comments return empty array', async () => {
    const res = await client.query({
        query: gql`
            query {
                comments {
                    body
                }
            }
        `,
    });
    expect(res.data)
        .toBeDefined();
    expect(res.data.comments)
        .toBeArrayOfSize(0);
});

test('a comment can be created on a post', async () => {
    const res = await client.mutate({
        mutation: gql`
            mutation($post: PostInput!) {
                post: newPost(post: $post) {
                    id
                }
            }
        `,
        variables: {
            post: {
                body: 'very commentable post',
            },
        },
    });
    expect(res.data)
        .toBeDefined();
    const mutRes = await client.mutate({
        mutation: gql`
            mutation($post_id: ID!, $comment: CommentInput!) {
                newComment(post_id: $post_id, comment: $comment) {
                    body
                }
            }
        `,
        variables: {
            comment: {
                body: "👀",
            },
            post_id: res.data.post.id,
        },
    });
    
    expect(mutRes.data)
        .toBeDefined();
    expect(mutRes.data.newComment.body)
        .toBe('👀');
    
    const resComments = await client.query({
        query: gql`
            query {
                comments {
                    body
                }
            }
        `,
    });
    expect(resComments.data)
        .toBeDefined();
    expect(resComments.data.comments)
        .toBeArrayOfSize(1);
    expect(resComments.data.comments[0].body)
        .toBe('👀');
});
test('a comment can be get by id', async () => {
    const res = await client.mutate({
        mutation: gql`
            mutation($post: PostInput!) {
                post: newPost(post: $post) {
                    id
                }
            }
        `,
        variables: {
            post: {
                body: 'very commentable post',
            },
        },
    });
    expect(res.data)
        .toBeDefined();
    const mutRes = await client.mutate({
        mutation: gql`
            mutation($post_id: ID!, $comment: CommentInput!) {
                newComment(post_id: $post_id, comment: $comment) {
                    id
                }
            }
        `,
        variables: {
            comment: {
                body: "👀",
            },
            post_id: res.data.post.id,
        },
    });
    
    expect(mutRes.data)
        .toBeDefined();
    expect(mutRes.data.newComment.id)
        .toBeDefined();

    const id =  mutRes.data.newComment.id

    const resComment = await client.query({
        query: gql`
           query($id: ID!) {
                comment(id: $id) {
                    id
                    body
                }
            }
        `,
        variables:{
            id
        }
    });
    expect(resComment.data)
        .toBeDefined();
    expect(resComment.data.comment.body)
        .toBe('👀');
});

test('comments are returned with body after creating 2 comments', async () => {
    const post = await client.mutate({
        mutation: gql`
            mutation($post: PostInput!) {
                post: newPost(post: $post) {
                    id
                }
            }
        `,
        variables: {
            post: {
                body: 'very commentable post',
            },
        },
    });
    ['Foo', 'Bar'].forEach(async (body) => {
        const mutRes = await client.mutate({
            mutation: gql`
                mutation($post_id: ID!, $comment: CommentInput!) {
                    newComment(post_id: $post_id, comment: $comment) {
                        body
                    }
                }
            `,
            variables: {
                comment: {
                    body,
                },
                post_id: post.data.post.id,
            },
        });
        
        expect(mutRes.data)
            .toBeDefined();
        expect(mutRes.data.newComment.body)
            .toBe(body);
    });

    const res = await client.query({
        query: gql`
            query {
                comments {
                    body
                }
            }
        `,
    });
    expect(res.data)
        .toBeDefined();
    expect(res.data.comments)
        .toBeArrayOfSize(2);
    expect(res.data.comments[0].body)
        .toBeString();
    expect(res.data.comments[1].body)
        .toBeString();
});
