import * as React from "react";
import { IPeristedIdea, IIdea } from "../interfaces/IIdea";



// 'HelloProps' describes the shape of props.
// State is never set so we use the '{}' type.
export class IdeaCard extends React.Component<IPeristedIdea, {}> {
    constructor(props: IPeristedIdea) {
        super(props);
    }

    getRef() {
        return this.refs.article;
    }

    render() {
        return <div ref="article" key={this.props.id} className="demo-card-wide mdl-card mdl-shadow--2dp" data-id={this.props.id}>
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

    componentdidMount() {
        console.log("mount child");
       //salvattore.prependElements(this.refs.grid, (this.refs.grid as HTMLElement).querySelectorAll('article'));
    }
}

export class IdeaCardGrid extends React.Component<{}, {}> {
    render() {
        return (
            <>
                <span ref="grid" id="idea-grid" data-columns>
                    {this.props.children}
                </span>
                <div className="clear"></div>
            </>
        )
    }

    componentdidMount() {
        console.log("mount");
        salvattore.prependElements(this.refs.grid, (this.refs.grid as HTMLElement).querySelectorAll('article'));
    }
}