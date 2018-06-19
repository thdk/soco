import * as firebase from 'firebase/app';

export interface IIdea {
    title: string;
    description: string;
    author: string;
    votes: number;
}

export interface IPeristedIdea extends IIdea {
    id: string;
    deleted: boolean;
    created: firebase.firestore.FieldValue
}

export interface IIdeaCardModel extends IPeristedIdea{
    imageLoad?: Promise<string>;
    events?: {
        onDelete: (key: string) => void;
        onVoteUp: (key: string) => void;
    }
}