import * as React from "react";
import { connect } from "react-redux";
import { IPeristedIdea, IIdea } from "../interfaces/IIdea";
import { SFC } from "react";
import IAppState from "../interfaces/IAppState";
import { Dispatch } from "redux";
import { deleteIdea, updateIdea, voteOnIdea } from "../actions/idea";

export interface SFCIdeaCardProps {
    author: string;
    description: string;
    title: string;
    votes: number;
    key: string;
    imageLoad?: Promise<string>;
    delete: (key: string) => void;
    voteUp: (key: string) => void;
}

export const SFCIdeaCard: SFC<SFCIdeaCardProps> = props => {

    let author: JSX.Element = <></>;
    if (props.author)
        author = <p>Door: {props.author}</p>;

    const cardActions = <div className="mdl-card__actions mdl-card--border">
        <div className="action-wrapper">
            <span className="action-count">{props.votes ? props.votes : 1}</span>
            <i className="like-action material-icons" onClick={() => props.voteUp(props.key)}>favorite_border</i>
        </div>
    </div>;

    const titleStyle = {
        // backgroundImage: 'url(' + this.state.imageUrl + ')'
    };

    return <div key={props.key} className="demo-card-wide mdl-card mdl-shadow--2dp">
        <div className="mdl-card__title mdl-card--expand" style={titleStyle}>
            <h2 className="mdl-card__title-text ">{props.title}</h2>
        </div>
        <div className="mdl-card__supporting-text">
            <p>{props.description}</p>
            {author}
        </div>
        {cardActions}
        <div className="mdl-card__menu">
            <button onClick={() => props.delete(props.key)} className="mdl-button delete-icon mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                <i className="material-icons">clear</i>
            </button>
        </div>
    </div>;
}
export type MapStateToPropsType = { idea: Pick<SFCIdeaCardProps, "key" | "title" | "description" | "votes" | "author"> };
export type MapDispatchToPropsType = {delete: (id: string) => void, voteUp: (id:string) => void};

export const mapStateToProps = (state: SFCIdeaCardProps): MapStateToPropsType => {
    const { key, title, description, votes, author } = state;
    return { idea: {key, title, description, votes, author} };
};

export const mapDispatchToProps = (dispatch: Dispatch): MapDispatchToPropsType => {
    return {
        delete: (id: string) => {},
        voteUp: (id: string) => {}
    };
};
export const SFCIdeaCardConnected = connect(mapStateToProps, mapDispatchToProps)(SFCIdeaCard);

export const IdeaCardGrid: SFC<{ ideas: SFCIdeaCardProps[] }> = (props) => {
    const delete2 = (id: string) => { };
    const voteUp = (id: string, up = true) => { };
    const cards = Array.from(props.ideas.values()).map(idea => {
        return <SFCIdeaCardConnected {...idea}/>
    });
    return (
        <div id="idea-grid" data-columns>
            {cards}
        </div>
    );
}