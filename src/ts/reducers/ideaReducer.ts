import { IIdeaCardModel } from "../interfaces/IIdea";
import { IUpdateIdeaAction, IdeaActionType, Action, IVoteOnIdeaAction } from "../actions/idea";
import IAppState from "../interfaces/IAppState";

export const ideaReducer = (state: IIdeaCardModel, action: IUpdateIdeaAction | IVoteOnIdeaAction) => {
    if (action.payload.id !== state.key) {
        return state;
    }

    switch (action.type) {
        case IdeaActionType.UPDATE_IDEA:
            return Object.assign({}, state, action.payload);
        case IdeaActionType.VOTE_ON_IDEA: {
            const delta = action.payload.up ? 1 : -1;

            return Object.assign({}, state, { votes: state.votes + delta });
        }
        default:
            return state;
    }
}

export const ideas = (state: IAppState = { ideas: [] }, action: Action): IAppState => {
    switch (action.type) {
        case IdeaActionType.ADD_IDEAS:
            // add new ideas to the beginning of the results
            const newIdeas = [...action.payload, ...state.ideas];
            return {
                ideas: newIdeas
            }
        case IdeaActionType.DELETE_IDEA:
            return {
                ideas: [...state.ideas.filter(i => i.id !== action.payload.id)]
            }
        case IdeaActionType.UPDATE_IDEA:
            return {
                ideas: state.ideas.map(i => ideaReducer(i, { type: action.type, payload: action.payload }))
            }
        case IdeaActionType.VOTE_ON_IDEA:
            return {
                ideas: state.ideas.map(i => ideaReducer(i, { type: action.type, payload: action.payload }))
            }
        default:
            return {
                ideas: [...state.ideas]
            }
    }
}