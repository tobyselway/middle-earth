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
                posts { __typename }
            }
        `,
    });
});

test('when there are no posts return empty array', async () => {
    const res = await client.query({
        query: gql`
            query {
                posts {
                    body
                }
            }
        `,
    });
    expect(res.data)
        .toBeDefined();
    expect(res.data.posts)
        .toBeArrayOfSize(0);
});

test('a post can be created', async () => {
    const mutRes = await client.mutate({
        mutation: gql`
            mutation($post: PostInput!) {
                newPost(post: $post) {
                    body
                }
            }
        `,
        variables: {
            post: {
                body: 'Foo',
            },
        },
    });
    
    expect(mutRes.data)
        .toBeDefined();
    expect(mutRes.data.newPost.body)
        .toBe('Foo');
    
    const res = await client.query({
        query: gql`
            query {
                posts {
                    body
                }
            }
        `,
    });
    expect(res.data)
        .toBeDefined();
    expect(res.data.posts)
        .toBeArrayOfSize(1);
    expect(res.data.posts[0].body)
        .toBe('Foo');
});

test('posts are returned with body after creating 2 posts', async () => {
    ['Foo', 'Bar'].forEach(async (body) => {
        const mutRes = await client.mutate({
            mutation: gql`
                mutation($post: PostInput!) {
                    newPost(post: $post) {
                        body
                    }
                }
            `,
            variables: {
                post: {
                    body,
                },
            },
        });
        
        expect(mutRes.data)
            .toBeDefined();
        expect(mutRes.data.newPost.body)
            .toBe(body);
    });

    const res = await client.query({
        query: gql`
            query {
                posts {
                    body
                }
            }
        `,
    });
    expect(res.data)
        .toBeDefined();
    expect(res.data.posts)
        .toBeArrayOfSize(2);
    expect(res.data.posts[0].body)
        .toBeString();
    expect(res.data.posts[1].body)
        .toBeString();
});

test('posts can be fetched by id', async () => {
    const mutRes = await client.mutate({
        mutation: gql`
            mutation($post: PostInput!) {
                newPost(post: $post) {
                    id
                }
            }
        `,
        variables: {
            post: {
                body: "nice body",
            },
        },
    });
    expect(mutRes.data)
        .toBeDefined();
    expect(mutRes.data.newPost.id)
        .toBeDefined();

    const id = mutRes.data.newPost.id
    
    const res = await client.query({
        query: gql`
            query($id: ID!) {
                post(id: $id) {
                    id
                    body
                }
            }
        `,
        variables: {
            id
        }
    });
    expect(res.data)
        .toBeDefined();
    expect(res.data.post.body)
        .toBe("nice body");
});