import * as React from "react";
import { IPeristedIdea, IIdea } from "../interfaces/IIdea";

export class IdeaCard extends React.Component<IPeristedIdea & { imageLoad: Promise<string> }, { votes: number, imageUrl?: string }> {
    constructor(props: IPeristedIdea & { imageLoad: Promise<string> }) {
        super(props);
        this.state = { votes: props.votes };

        this.props.imageLoad.then(imageUrl => {
            this.setState({ imageUrl });
        });
    }

    increaseVote = () => {
        this.setState({ votes: this.state.votes + 1 })
    }

    render() {
        let author = <></>;
        if (this.props.author)
            author = <p>Door: {this.props.author}</p>;

        const cardActions = <div className="mdl-card__actions mdl-card--border">
            <div className="action-wrapper">
                <span className="action-count">{this.state.votes ? this.state.votes : 1}</span>
                <i className="like-action material-icons" onClick={this.increaseVote}>favorite_border</i>
            </div>
        </div>;

        const titleStyle = {
            backgroundImage: 'url(' + this.state.imageUrl + ')'
        };

        return <div ref="article" key={this.props.id} className="demo-card-wide mdl-card mdl-shadow--2dp" data-id={this.props.id}>
            <div className="mdl-card__title mdl-card--expand" style={titleStyle}>
                <h2 className="mdl-card__title-text ">{this.props.title}</h2>
            </div>
            <div className="mdl-card__supporting-text">
                <p>{this.props.description}</p>
                {author}
            </div>
            {cardActions}
            <div className="mdl-card__menu">
                <button className="mdl-button delete-icon mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                    <i className="material-icons">clear</i>
                </button>
            </div>
        </div>;
    }
}

export class IdeaCardGrid extends React.Component<{}, {}> {
    render() {
        return (
            <div ref="grid" id="idea-grid" data-columns>
                {this.props.children}
            </div>
        )
    }
}