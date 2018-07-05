import { connect } from "react-redux";
import IAppState from "../interfaces/IAppState";
import { IdeaCardGrid } from "../components/IdeaCardCollection";

const mapStateToProps = (state:IAppState) => {
    return {
        ideaIds: state.ideas.map(idea => idea.id)
    }
}

export const IdeaCardCollection = connect(mapStateToProps)(IdeaCardGrid);