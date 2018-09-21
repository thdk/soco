import * as firebase from 'firebase/app';

export interface IIdea {
    title: string;
    description: string;
    author: string;
    votes: number;
}

export interface IPeristedIdea extends IIdea {
    id: string;
    deleted?: boolean;
    created?: firebase.firestore.FieldValue
}

export interface IIdeaCardModel extends IPeristedIdea{
    key: string;
    imageLoad?: Promise<string>;
    delete: (key: string) => void;
    voteUp: (key: string) => void;
}

export enum IdeasFilter {
    All = '',
    Completed = 'completed',
    Active = 'active',
  }