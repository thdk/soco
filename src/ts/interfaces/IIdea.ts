import * as firebase from 'firebase/app';

export interface IIdea {
    title: string;
    description: string;
    author: string;
}

export interface IPeristedIdea extends IIdea {
    id: string;
    deleted: boolean;
    created: firebase.firestore.FieldValue
}