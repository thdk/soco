import { IIdeaCardModel } from "../interfaces/IIdea";
import { IUpdateIdeaAction, IdeaActionType, Action, IVoteOnIdeaAction, IDeleteIdeaAction, IAddIdeasAction } from "../actions/idea";
import IAppState from "../interfaces/IAppState";
import { AnyAction } from "redux";

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
        case IdeaActionType.FETCH_IDEAS_BEGIN:
            return {
                ...state,
                // loading: true,
                // error: null
            };

        case IdeaActionType.FETCH_IDEAS_SUCCESS:
            return {
                ...state,
                // loading: false,
                ideas: action.payload as IIdeaCardModel[]
            };

        case IdeaActionType.FETCH_IDEAS_FAILURE:
            return {
                ...state,
                //loading: false,
                //  error: action.payload.error,
                ideas: []
            };

        case IdeaActionType.ADD_IDEAS:
            if (isAddIdeasAction(action)) {
                // add new ideas to the beginning of the results
                const newIdeas = [...action.payload, ...state.ideas];
                return {
                    ideas: newIdeas
                }
            }
            break;
        case IdeaActionType.DELETE_IDEA:
            if (isDeleteIdeaAction(action))
                return {
                    ideas: [...state.ideas.filter(i => i.id !== action.payload.id)]
                }
            break;
        case IdeaActionType.UPDATE_IDEA:
            if (isUpdateIdeaAction(action))
                return {
                    ideas: state.ideas.map(i => ideaReducer(i, { type: action.type, payload: action.payload }))
                }
            break;
        case IdeaActionType.VOTE_ON_IDEA:
            if (isVoteOnIdeaAction(action))
                return {
                    ideas: state.ideas.map(i => ideaReducer(i, { type: action.type, payload: action.payload }))
                }
            break;

        default:
            return {
                ideas: [...state.ideas]
            }
    }

    return {
        ideas: [...state.ideas]
    }
}

function isVoteOnIdeaAction(action: AnyAction): action is IVoteOnIdeaAction {
    return action.type && action.type === IdeaActionType.VOTE_ON_IDEA;
}

function isUpdateIdeaAction(action: AnyAction): action is IUpdateIdeaAction {
    return action.type && action.type === IdeaActionType.UPDATE_IDEA;
}

function isDeleteIdeaAction(action: AnyAction): action is IDeleteIdeaAction {
    return action.type && action.type === IdeaActionType.DELETE_IDEA;
}

function isAddIdeasAction(action: AnyAction): action is IAddIdeasAction {
    return action.type && action.type === IdeaActionType.ADD_IDEAS;
}