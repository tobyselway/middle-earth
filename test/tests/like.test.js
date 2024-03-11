import { expect, test, beforeAll, beforeEach } from 'bun:test';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';

const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:6473/query';
let client;
let authClient;

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

beforeEach(async () => {
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
    await resetClient.query({
        query: gql`
            query {
                posts { __typename }
            }
        `,
    });

    const login = await client.mutate({
       
        mutation: gql`
            mutation($user: UserInput!, $login: LoginInput!) {
                user: newUser(user: $user) {
                    ...on User {
                        id
                    }
                }
                login(login: $login) {
                    ...on LoginSuccess {
                        token
                    }
                }
            }
        `,
        variables: {
            user: {
                name: 'Frodo Baggins',
                email: 'frodo@shire.net',
                password: 'secondbreakfast',
            },
            login: {
                email: 'frodo@shire.net',
                password: 'secondbreakfast',
            },
        },
    });

    authClient = new ApolloClient({
        uri: apiUrl,
        headers: {
            'mock-persistence': 'true',
            'authorization': `Bearer ${login.data.login.token}`,
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

test('a post can be liked', async () => {
    const res = await authClient.mutate({
        mutation: gql`
            mutation($post: PostInput!) {
                post: newPost(post: $post) {
                    id
                }
            }
        `,
        variables: {
            post: {
                body: 'likable post',
            },
        },
    });

    const post_id = res.data.post.id;
 
    expect(post_id)
        .toBeDefined();

    const resLike = await authClient.mutate({
        mutation: gql`
            mutation($post_id: ID!) {
                likePost(post_id: $post_id)
            }
        `,
        variables: {
            post_id,
        },
    });

    expect(resLike.data.likePost)
        .toBe('Success');
});
test('a comment can be liked', async () => {
    const resPost = await authClient.mutate({
        mutation: gql`
            mutation($post: PostInput!) {
                post: newPost(post: $post) {
                    id
                }
            }
        `,
        variables: {
            post: {
                body: 'commentable post',
            },
        },
    });
    const post_id = resPost.data.post.id;

    const resComment = await authClient.mutate({
        mutation: gql`
            mutation($post_id: ID!, $comment: CommentInput!) {
                comment: newComment(post_id: $post_id, comment: $comment) {
                    id
                }
            }
        `,
        variables: {
            comment: {
                body: 'likeable comment',
            },
            post_id,
        },
    });
    expect(post_id)
        .toBeDefined();
  
    const comment_id = resComment.data.comment.id;

    const resLike = await authClient.mutate({
        mutation: gql`
            mutation($comment_id: ID!) {
                likeComment(comment_id: $comment_id)
            }
        `,
        variables: {
            comment_id,
        },
    });

    expect(resLike.data.likeComment)
        .toBe('Success');
});

test('like count is incremented', async () => {
    const res = await authClient.mutate({
        mutation: gql`
            mutation($post: PostInput!) {
                post: newPost(post: $post) {
                    id
                    likes {
                        count
                    }
                }
            }
        `,
        variables: {
            post: {
                body: 'likable post',
            },
        },
    });

    expect(res.data.post.likes.count)
        .toBe(0);

    const post_id = res.data.post.id;
 
    expect(post_id)
        .toBeDefined();

    const resLike = await authClient.mutate({
        mutation: gql`
            mutation($post_id: ID!) {
                likePost(post_id: $post_id)
            }
        `,
        variables: {
            post_id,
        },
    });

    expect(resLike.data.likePost)
        .toBe('Success');

    const resQuery = await authClient.query({
        query: gql`
            query {
                posts: posts {
                    id
                    likes {
                        count
                    }
                }
            }
        `,
    });

    expect(resQuery.data.posts[0].likes.count)
        .toBe(1);
});
