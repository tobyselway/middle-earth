import { Post as PostEntity } from "../entities/Post";
import { Comment as CommentEntity } from "../entities/Comment";

export const Query = {
    //
};

export const Post = {
    likes: async (parent) => {
        return {
            count: parent.likes.length,
        };
    },
};
export const Comment = {
    likes: async (parent) => {
        return {
            count: parent.likes.length,
        };
    },
};

export const Mutations = {
    likePost: async (_, { post_id }, { authUser, persistence }) => {
        const post = await PostEntity.firstWhere('id', post_id, persistence);
        if(!post) {
            return 'Failure';
        }
        const likes = new Set(post.likes);
        likes.add(authUser.id);
        post.likes = Array.from(likes);
        await post.save();
        return 'Success';
    },
    likeComment: async (_, { comment_id }, { authUser, persistence }) => {
        const comment = await CommentEntity.firstWhere('id', comment_id, persistence);
        if(!comment) {
            return 'Failure';
        }
        const likes = new Set(comment.likes);
        likes.add(authUser.id);
        comment.likes = Array.from(likes);
        await comment.save();
        return 'Success';
    },
};

export const Subscriptions = {
    //
};
