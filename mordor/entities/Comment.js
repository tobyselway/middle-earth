import { BaseEntity } from "../persistence/BaseEntity";

export class Comment extends BaseEntity {
    __typename = 'Comment';

    id;
    body;
    commenter; // user id

    likes = []; // user ids
}
