import * as React from "react";
import { IPeristedIdea, IIdea, IIdeaCardModel } from "../interfaces/IIdea";

export class IdeaCard extends React.Component<IIdeaCardModel, { imageUrl?: string }> {
    constructor(props: IIdeaCardModel) {
        super(props);
        this.state = {};

        if (this.props.imageLoad) {
            this.props.imageLoad.then(imageUrl => {
                this.setState({ imageUrl });
            });
        }
    }

    increaseVote = () => {
        console.log(this);
        console.log(this.props);
        if(this.props.action && this.props.action.onVoteUp)
            this.props.action.onVoteUp(this.props.id);
    }

    deleteIdea = () => {
        console.log("request to delete idea with id: " + this.props.id);
        if(this.props.action && this.props.action.onDelete){
            this.props.action.onDelete(this.props.id);
        }
        else {
            console.log("No delete event attached");
            console.log(this.props.action);
        }
    }

    render() {
        let author: JSX.Element = <></>;
        if (this.props.author)
            author = <p>Door: {this.props.author}</p>;

        const cardActions = <div className="mdl-card__actions mdl-card--border">
            <div className="action-wrapper">
                <span className="action-count">{this.props.votes ? this.props.votes : 1}</span>
                <i className="like-action material-icons" onClick={this.increaseVote}>favorite_border</i>
            </div>
        </div>;

        const titleStyle = {
            backgroundImage: 'url(' + this.state.imageUrl + ')'
        };

        return <div ref="article" key={this.props.id} className="demo-card-wide mdl-card mdl-shadow--2dp">
            <div className="mdl-card__title mdl-card--expand" style={titleStyle}>
                <h2 className="mdl-card__title-text ">{this.props.title}</h2>
            </div>
            <div className="mdl-card__supporting-text">
                <p>{this.props.description}</p>
                {author}
            </div>
            {cardActions}
            <div className="mdl-card__menu">
                <button onClick={this.deleteIdea} className="mdl-button delete-icon mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                    <i className="material-icons">clear</i>
                </button>
            </div>
        </div>;
    }
}

export class IdeaCardGrid extends React.Component<{ideas: IIdeaCardModel[]}, {}> {
    render() {
        const cards = Array.from(this.props.ideas.values()).map(idea => React.createElement(IdeaCard, idea));
        return (
            <div ref="grid" id="idea-grid" data-columns>
                {cards}
            </div>
        )
    }
}