import * as React from "react";
import { SFCIdeaCardConnected as IdeaCard } from "./IdeaCard";

export class IdeaCardGrid extends React.Component<{ ideaIds: string[], fetchIdeas: any }> {
    public componentDidMount() {
        this.props.fetchIdeas();
    }

    public render() {
        const cards = this.props.ideaIds.map(id => {
            return <IdeaCard id={id} key={id} />
        });
        return (
            <div id="idea-grid">
                {cards}
            </div>
        );
    }
}




