import * as React from "react";
import { IPeristedIdea } from "../interfaces/IIdea";



// 'HelloProps' describes the shape of props.
// State is never set so we use the '{}' type.
export class IdeaCard extends React.Component<IPeristedIdea, {}> {
    render() {
        return <div className="demo-card-wide mdl-card mdl-shadow--2dp" data-id={this.props.id}>
        <div className="mdl-card__title">
            <h2 className="mdl-card__title-text">{this.props.title}</h2>
        </div>
        <div className="mdl-card__supporting-text">
            <p>{this.props.description}</p>
        </div>
        <div className="mdl-card__menu">
            <button className="mdl-button delete-icon mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                <i className="material-icons">clear</i>
            </button>
        </div>
        </div>;
    }
}

export class IdeaCardGrid extends React.Component<{ data: IPeristedIdea[]}, {}> {
    render() {
        const ideagrid = this.props.data.map(idea => {
            return React.createElement(IdeaCard, idea);
        });

        return ideagrid;
    }
}