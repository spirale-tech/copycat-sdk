export enum UserState { Pending, Activated};


export class User {
    userID : string;
    username: string;
    password: string;
    email: string;
    firstname: string;
    lastname: string;
    state : UserState;
}