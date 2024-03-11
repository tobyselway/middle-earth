import md5 from "md5";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import { jwtPrivateKey } from "../config/keys";

export const Query = {
    //
};

const validationError = (field, rule) => ({ field, rule, __typename: 'ValidationError' });
const userNotFoundError = (email) => ({ email, __typename: 'UserNotFoundError' });
const badCredentialsError = (message) => ({ message, __typename: 'BadCredentialsError' });

export const Mutations = {
    login: async (_, { login: input }, { persistence }) => {
        if(input.email.length === 0) {
            return validationError('email', 'notEmpty');
        }
        if(input.password.length === 0) {
            return validationError('password', 'notEmpty');
        }

        const user = await User.firstWhere('email', input.email, persistence);
        if(user === null) {
            return userNotFoundError(input.email);
        }

        if(user.password !== md5(input.password)) {
            return badCredentialsError('Incorrect credentials');
        }

        const token = jwt.sign({
            id: user.id,
            name: user.name,
            email: user.email,
        }, jwtPrivateKey, { algorithm: 'RS256' });

        return {
            __typename: 'LoginSuccess',
            token,
        };
    },
};

export const Subscriptions = {
    //
};
