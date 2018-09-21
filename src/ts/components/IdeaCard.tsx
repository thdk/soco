import * as React from "react";

import { connect } from "react-redux";
import { SFC } from "react";
import IAppState from "../interfaces/IAppState";
import { Dispatch } from "redux";
import { deleteIdea, voteOnIdea, Action } from "../actions/idea";

export interface SFCIdeaCardProps {
    author: string;
    description: string;
    title: string;
    votes: number;
    id: string;
    delete: (id: string) => void;
    voteUp: (id: string) => void;
}

export const SFCIdeaCard: SFC<SFCIdeaCardProps> = props => {

    let author: JSX.Element = <></>;
    if (props.author)
        author = <p>Door: {props.author}</p>;

    const cardActions = <div className="mdl-card__actions mdl-card--border">
        <div className="action-wrapper">
            <span className="action-count">{props.votes ? props.votes : 1}</span>
            <i className="like-action material-icons" onClick={() => props.voteUp(props.id)}>favorite_border</i>
        </div>
    </div>;

    const titleStyle = {
        // backgroundImage: 'url(' + this.state.imageUrl + ')'
    };

    return <div className="demo-card-wide mdl-card mdl-shadow--2dp">
        <div className="mdl-card__title mdl-card--expand" style={titleStyle}>
            <h2 className="mdl-card__title-text ">{props.title}</h2>
        </div>
        <div className="mdl-card__supporting-text">
            <p>{props.description}</p>
            {author}
        </div>
        {cardActions}
        <div className="mdl-card__menu">
            <button onClick={() => props.delete(props.id)} className="mdl-button delete-icon mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                <i className="material-icons">clear</i>
            </button>
        </div>
    </div>;
}
export type MapStateToPropsType = Pick<SFCIdeaCardProps, "id" | "title" | "description" | "votes" | "author">;
export type MapDispatchToPropsType = { delete: (id: string) => void, voteUp: (id: string) => void };

export const mapStateToProps = (state: IAppState, ownProps: { id: string }): MapStateToPropsType => {
    const idea= state.ideas.filter(i => i.id === ownProps.id)[0];
    return idea;
};

export const mapDispatchToProps = (dispatch: Dispatch<Action>): MapDispatchToPropsType => {
    return {
        delete: (id: string) => dispatch(deleteIdea(id)),
        voteUp: (id: string) => dispatch(voteOnIdea(id))
    };
};
export const SFCIdeaCardConnected = connect<MapStateToPropsType, MapDispatchToPropsType, { id: string }, IAppState>(mapStateToProps, mapDispatchToProps)(SFCIdeaCard);

