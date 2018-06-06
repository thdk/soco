export interface IIdea {
    title: string;
    description: string;
}

export interface IPeristedIdea extends IIdea {
    id: string;
    deleted: boolean;
}