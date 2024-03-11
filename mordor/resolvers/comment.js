import { Post as PostEntity } from "../entities/Post";
import { Comment as CommentEntity } from "../entities/Comment";
import { v4 as uuidv4 } from 'uuid';

export const Post = {
    comments: async (parent, _, { persistence }) => {
        return parent.comments.map(comment_id => CommentEntity.firstWhere('id', comment_id, persistence));
    },
};

export const Query = {
    comments: async (_, __, { persistence }) => {
        return await CommentEntity.all(persistence);
    },
    comment: async (_, {id}, { persistence }) => {
        return await CommentEntity.firstWhere("id", id, persistence);
    }
};

export const Mutations = {
    newComment: async (_, { post_id: id, comment: input }, { authUser, persistence }) => {
        const post = await PostEntity.firstWhere("id", id, persistence);
        
        const comment = new CommentEntity(persistence);
        comment.id = uuidv4();
        comment.body = input.body;
        comment.commenter = authUser?.id;
        await comment.save();
        
        post.comments.push(comment.id);
        await post.save()

        return comment 
    },

};

export const Subscriptions = {
    //
};
