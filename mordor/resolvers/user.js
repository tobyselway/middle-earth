import md5 from "md5";
import { User } from "../entities/User";
import { v4 as uuidv4 } from 'uuid';

export const Comment = {
    commenter: async (parent,_, {persistence}) => {
        return User.firstWhere("id", parent.commenter, persistence);
    },
};
export const Post = {
    poster: async (parent,_, {persistence}) => {
        return User.firstWhere("id", parent.poster, persistence);
    },
};
export const Query = {
    users: async (_, __, { persistence }) => await User.all(persistence),
    user: async (_, { id }, { persistence }) => await User.firstWhere('id', id, persistence),
};

const validationError = (field, rule) => ({ field, rule, __typename: 'ValidationError' });

export const Mutations = {
    newUser: async (_, { user: input }, { persistence }) => {
        if(input.name.length === 0) {
            return validationError('name', 'notEmpty');
        }
        if(input.email.length === 0) {
            return validationError('email', 'notEmpty');
        }
        const user = new User(persistence);
        user.fill(input);
        user.password = md5(input.password); // Very secure indeed
        user.id = uuidv4();
        return await user.save();
    },
};

export const Subscriptions = {
    //
};
