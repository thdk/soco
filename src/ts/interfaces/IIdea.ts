export interface IIdea {
    title: string;
    description: string;
    author: string;
}

export interface IPeristedIdea extends IIdea {
    id: string;
    deleted: boolean;
}