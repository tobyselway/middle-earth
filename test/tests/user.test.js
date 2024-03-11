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
                users { __typename }
            }
        `,
    });
});

test('when there are no users return empty array', async () => {
    const res = await client.query({
        query: gql`
            query {
                users {
                    name
                }
            }
        `,
    });
    expect(res.data)
        .toBeDefined();
    expect(res.data.users)
        .toBeArrayOfSize(0);
});

test('an attempt to create a user with an empty name should return a validation error', async () => {
    const res = await client.mutate({
        mutation: gql`
            mutation($user: UserInput!) {
                newUser(user: $user) {
                    ...on User {
                        name
                    }
                    ...on ValidationError {
                        field
                        rule
                    }
                }
            }
        `,
        variables: {
            user: {
                name: '',
                email: 'foo@bar.net',
                password: 'secondbreakfast',
            },
        },
    });
    expect(res.data)
        .toBeDefined();
    expect(res.data.newUser.name)
        .toBeUndefined();
    expect(res.data.newUser.field)
        .toBe('name');
    expect(res.data.newUser.rule)
        .toBe('notEmpty');
});

test('a user can be created with a name, email, password, and avatar', async () => {
    const mutRes = await client.mutate({
        mutation: gql`
            mutation($user: UserInput!) {
                newUser(user: $user) {
                    ...on User {
                        name
                        email
                        avatar
                    }
                }
            }
        `,
        variables: {
            user: {
                name: 'Frodo Baggins',
                email: 'frodo@shire.net',
                password: 'secondbreakfast',
                avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/Elijah_Wood_as_Frodo_Baggins.png/170px-Elijah_Wood_as_Frodo_Baggins.png',
            },
        },
    });
    
    expect(mutRes.data)
        .toBeDefined();
    expect(mutRes.data.newUser.name)
        .toBe('Frodo Baggins');
    expect(mutRes.data.newUser.email)
        .toBe('frodo@shire.net');
    expect(mutRes.data.newUser.password)
        .toBeUndefined();
    expect(mutRes.data.newUser.avatar)
        .toBe('https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/Elijah_Wood_as_Frodo_Baggins.png/170px-Elijah_Wood_as_Frodo_Baggins.png');
    
    const res = await client.query({
        query: gql`
            query {
                users {
                    name
                    email
                    avatar
                }
            }
        `,
    });
    expect(res.data)
        .toBeDefined();
    expect(res.data.users)
        .toBeArrayOfSize(1);
    expect(res.data.users[0].name)
        .toBe('Frodo Baggins');
    expect(res.data.users[0].email)
        .toBe('frodo@shire.net');
    expect(res.data.users[0].password)
        .toBeUndefined();
    expect(res.data.users[0].avatar)
        .toBe('https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/Elijah_Wood_as_Frodo_Baggins.png/170px-Elijah_Wood_as_Frodo_Baggins.png');
});

test('a user can be created without an avatar', async () => {
    const mutRes = await client.mutate({
        mutation: gql`
            mutation($user: UserInput!) {
                newUser(user: $user) {
                    ...on User {
                        name
                        email
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
        },
    });
    
    expect(mutRes.data)
        .toBeDefined();
    
    const res = await client.query({
        query: gql`
            query {
                users {
                    name
                    email
                    avatar
                }
            }
        `,
    });
    expect(res.data)
        .toBeDefined();
    expect(res.data.users)
        .toBeArrayOfSize(1);
    expect(res.data.users[0].name)
        .toBe('Frodo Baggins');
    expect(res.data.users[0].email)
        .toBe('frodo@shire.net');
    expect(res.data.users[0].avatar)
        .toBe(null);
});

test('a user can be fetched by ID', async () => {
    const mutRes = await client.mutate({
        mutation: gql`
            mutation($user: UserInput!) {
                newUser(user: $user) {
                    ...on User {
                        id
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
        },
    });
    
    expect(mutRes.data)
        .toBeDefined();
    expect(mutRes.data.newUser.id)
        .toBeDefined();
    
    const res = await client.query({
        query: gql`
            query($id: ID!) {
                user(id: $id) {
                    id
                    name
                }
            }
        `,
        variables: {
            id: mutRes.data.newUser.id,
        },
    });
    expect(res.data)
        .toBeDefined();
    expect(res.data.user.id)
        .toBe(mutRes.data.newUser.id);
    expect(res.data.user.name)
        .toBe('Frodo Baggins');
});

test('fetching a user with an non-existing ID returns null', async () => {
    const res = await client.query({
        query: gql`
            query($id: ID!) {
                user(id: $id) {
                    id
                }
            }
        `,
        variables: {
            id: "this_id_does_not_exist",
        },
    });
    expect(res.data)
        .toBeDefined();
    expect(res.data.user)
        .toBeNull();
});
