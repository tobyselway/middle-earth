import { BaseEntity } from "../persistence/BaseEntity";

export class User extends BaseEntity {
    __typename = 'User';

    id;
    name;
    email;
    avatar;
    password;
}
