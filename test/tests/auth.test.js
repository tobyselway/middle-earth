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

test('a user can login', async () => {
    const mutRes = await client.mutate({
        mutation: gql`
            mutation($user: UserInput!, $login: LoginInput!) {
                newUser(user: $user) {
                    ...on User {
                        id
                    }
                }
                login(login: $login) {
                    ...on LoginSuccess {
                        token
                    }
                }
            }`,
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
    
    expect(mutRes.data)
        .toBeDefined();
    expect(mutRes.data.newUser.id)
        .toBeDefined();
    expect(mutRes.data.login.__typename)
        .toBe('LoginSuccess');
    expect(mutRes.data.login.token)
        .toBeDefined();
});

test('login with empty email returns validation error', async () => {
    const mutRes = await client.mutate({
        mutation: gql`
            mutation($user: UserInput!, $login: LoginInput!) {
                newUser(user: $user) {
                    ...on User {
                        id
                    }
                }
                
                login(login: $login) {
                    ...on ValidationError {
                        field
                        rule
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
                email: '',
                password: 'secondbreakfast',
            },
        },
    });
    
    expect(mutRes.data)
        .toBeDefined();
    expect(mutRes.data.newUser.id)
        .toBeDefined();
    expect(mutRes.data.login.__typename)
        .toBe('ValidationError');
    expect(mutRes.data.login.field)
        .toBe('email');
    expect(mutRes.data.login.rule)
        .toBe('notEmpty');
});

test('login with empty password returns validation error', async () => {
    const mutRes = await client.mutate({
        mutation: gql`
            mutation($user: UserInput!, $login: LoginInput!) {
                newUser(user: $user) {
                    ...on User {
                        id
                    }
                }
                
                login(login: $login) {
                    ...on ValidationError {
                        field
                        rule
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
                password: '',
            },
        },
    });
    
    expect(mutRes.data)
        .toBeDefined();
    expect(mutRes.data.newUser.id)
        .toBeDefined();
    expect(mutRes.data.login.__typename)
        .toBe('ValidationError');
    expect(mutRes.data.login.field)
        .toBe('password');
    expect(mutRes.data.login.rule)
        .toBe('notEmpty');
});

test('login with non-existing user returns user not found error', async () => {
    const mutRes = await client.mutate({
        mutation: gql`
            mutation($login: LoginInput!) {
                login(login: $login) {
                    ...on UserNotFoundError {
                        email
                    }
                }
            }
        `,
        variables: {
            login: {
                email: 'sauron@mordor.me',
                password: 'secondbreakfast',
            },
        },
    });
    
    expect(mutRes.data)
        .toBeDefined();
    expect(mutRes.data.login.__typename)
        .toBe('UserNotFoundError');
    expect(mutRes.data.login.email)
        .toBe('sauron@mordor.me');
});

test('login with incorrect password returns bad credentials error', async () => {
    const mutRes = await client.mutate({
        mutation: gql`
            mutation($user: UserInput!, $login: LoginInput!) {
                newUser(user: $user) {
                    ...on User {
                        id
                    }
                }
                
                login(login: $login) {
                    ...on BadCredentialsError {
                        message
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
                password: 'firstbreakfast',
            },
        },
    });
    
    expect(mutRes.data)
        .toBeDefined();
    expect(mutRes.data.newUser.id)
        .toBeDefined();
    expect(mutRes.data.login.__typename)
        .toBe('BadCredentialsError');
    expect(mutRes.data.login.message)
        .toBeDefined();
});
