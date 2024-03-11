import { BaseEntity } from "../persistence/BaseEntity";

export class Post extends BaseEntity {
    __typename = 'Post';

    id;
    body;
    poster; // user id
    likes = []; // user ids

    comments = []; // comment ids
}
