import { IPeristedIdea } from "../interfaces/IIdea";

export enum IdeaActionType {
    UPDATE_IDEA,
    ADD_IDEA,
    ADD_IDEAS,
    DELETE_IDEA
}

export interface IUpdateIdeaAction {
    type: IdeaActionType.UPDATE_IDEA;
    payload: IPeristedIdea;
}

export interface IAddIdeasAction {
    type: IdeaActionType.ADD_IDEAS;
    payload: IPeristedIdea[];
}

export interface IAddIdeaAction {
    type: IdeaActionType.ADD_IDEA;
    payload: IPeristedIdea;
}

export interface IDeleteIdeaAction {
    type: IdeaActionType.DELETE_IDEA;
    payload: Pick<IPeristedIdea, "id">;
}

export type Action = IDeleteIdeaAction | IUpdateIdeaAction | IAddIdeasAction | IAddIdeaAction;

export const updateIdea = (idea: IPeristedIdea): IUpdateIdeaAction => {
    return {
        type: IdeaActionType.UPDATE_IDEA,
        payload: idea
    };
}

export const addIdeas = (ideas: IPeristedIdea[]): IAddIdeasAction => {
    return {
        type: IdeaActionType.ADD_IDEAS,
        payload: ideas
    };
}

export const deleteIdea = (id: string): IDeleteIdeaAction => {
    return {
        type: IdeaActionType.DELETE_IDEA,
        payload: {id}
    }
}