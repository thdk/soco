import { connect } from "react-redux";
import IAppState from "../interfaces/IAppState";
import { IdeaCardGrid } from "../components/IdeaCardCollection";
import { Dispatch } from "redux";
import { fetchIdeas as fetchIdeasAction } from "../actions/ideas";

const mapStateToProps = (state:IAppState) => {
    return {
        ideaIds: state.ideas.map(idea => idea.id)
    }
}

const mapDispatchToprops = (dispatch: Dispatch) => {
    return {
        fetchIdeas: () => fetchIdeasAction()(dispatch)
    }
}

export const IdeaCardCollection = connect(mapStateToProps, mapDispatchToprops)(IdeaCardGrid);