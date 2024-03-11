import { Post as PostEntity } from "../entities/Post";
import { v4 as uuidv4 } from 'uuid';


export const Query = {
    posts: async (_, __, { persistence }) => {
        return await PostEntity.all(persistence);
    },
    post: async (_, {id}, { persistence }) => {
        return await PostEntity.firstWhere('id',id,persistence);
    },
};

export const Mutations = {
    newPost: async (_, { post: input }, { authUser, persistence }) => {
        const post = new PostEntity(persistence);
        post.id = uuidv4();
        post.body = input.body;
        post.poster = authUser?.id;
        return await post.save();
    },
};

export const Subscriptions = {
    //
};
