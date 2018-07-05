import * as React from "react";
import { connect } from "react-redux";
import { IPeristedIdea, IIdea } from "../interfaces/IIdea";
import { SFC } from "react";
import IAppState from "../interfaces/IAppState";
import { Dispatch } from "redux";
import { deleteIdea, updateIdea, voteOnIdea } from "../actions/idea";
import { SFCIdeaCardProps, SFCIdeaCardConnected as IdeaCard } from "./IdeaCard";


export const IdeaCardGrid = (props: { ideaIds: string[] }) => {
    const cards = props.ideaIds.map(id => {        
        return <IdeaCard id={id} key={id}/>
    });
    return (
        <div id="idea-grid">
            {cards}
        </div>
    );
}




