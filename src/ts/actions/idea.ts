import { IIdeaCardModel } from "../interfaces/IIdea";

export enum IdeaActionType {
    UPDATE_IDEA = 0,
    ADD_IDEA,
    ADD_IDEAS,
    DELETE_IDEA,
    VOTE_ON_IDEA,
    FETCH_IDEAS_BEGIN,
    FETCH_IDEAS_SUCCESS,
    FETCH_IDEAS_FAILURE
}

export interface IIdeaActionType {
    type: IdeaActionType,
    payload?: IIdeaCardModel | IIdeaCardModel[];
}

export interface IUpdateIdeaAction {
    type: IdeaActionType.UPDATE_IDEA;
    payload: IIdeaCardModel;
}

export interface IAddIdeasAction {
    type: IdeaActionType.ADD_IDEAS;
    payload: IIdeaCardModel[];
}

export interface IAddIdeaAction {
    type: IdeaActionType.ADD_IDEA;
    payload: IIdeaCardModel;
}

export interface IDeleteIdeaAction {
    type: IdeaActionType.DELETE_IDEA;
    payload: Pick<IIdeaCardModel, "id">;
}

export interface IVoteOnIdeaAction {
    type: IdeaActionType.VOTE_ON_IDEA;
    payload: { id: string, up: boolean };
}

export type Action = IIdeaActionType | IDeleteIdeaAction | IUpdateIdeaAction | IAddIdeasAction | IAddIdeaAction | IVoteOnIdeaAction;

export const updateIdea = (idea: IIdeaCardModel): IUpdateIdeaAction => {
    return {
        type: IdeaActionType.UPDATE_IDEA,
        payload: idea
    };
}

export const voteOnIdea = (id: string, up = true): IVoteOnIdeaAction => {
    return {
        type: IdeaActionType.VOTE_ON_IDEA,
        payload: { id, up }
    };
}

export const addIdeas = (ideas: IIdeaCardModel[]): IAddIdeasAction => {
    return {
        type: IdeaActionType.ADD_IDEAS,
        payload: ideas
    };
}

export const deleteIdea = (id: string): IDeleteIdeaAction => {
    return {
        type: IdeaActionType.DELETE_IDEA,
        payload: { id }
    }
}