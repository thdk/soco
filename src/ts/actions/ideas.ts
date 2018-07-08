import { Dispatch } from "redux";
import { IPeristedIdea, IIdeaCardModel } from "../interfaces/IIdea";
import { dbIdeasRef } from "../middleware/firestore";
import { addIdeas, IdeaActionType } from "./idea";

// let imageMapTemp: string[] = [];
// let imageMap = [
//     "bbq",
//     "bikerepair",
//     "brokenbike",
//     "buren",
//     "cat",
//     "communicatie",
//     "drink",
//     "games",
//     "herfstbladeren",
//     "kubb",
//     "speeltuin",
//     "renovatie",
//     "tuinieren",
//     "yoga"
// ];

const fetchIdeasBegin = () => {
    return {
        type: IdeaActionType.FETCH_IDEAS_BEGIN
    }
}

const fetchIdeasSuccess = (ideas: IPeristedIdea[]) => {
    return {
        type: IdeaActionType.FETCH_IDEAS_SUCCESS,
        payload: ideas
    }
}

export const fetchIdeasError = (error: any) => ({
    type: IdeaActionType.FETCH_IDEAS_FAILURE,
    payload: { error }
});

const fetchIdeasAsync = () => {
    return new Promise<IIdeaCardModel[]>((resolve, reject) => {
        dbIdeasRef.where("deleted", '==', false)
            .orderBy("created", "desc")
            .limit(10).onSnapshot({ includeMetadataChanges: true }, querySnapshot => {
                console.log(querySnapshot);
                const changes = querySnapshot.docChanges();

                // const updatedIdeas = changes.filter(c => c.type === "modified")
                //     .map(c => Object.assign({ key: c.doc.id }, c.doc.data()));
                const newIdeas = changes.filter(c => c.type === "added")
                    .map(c => Object.assign({ key: c.doc.id }, c.doc.data()));
                // .map(c => {
                //     // select a random dummy image
                //     const image = null;
                //     if (imageMap.length == 0) {
                //         imageMap = imageMapTemp.slice();
                //         imageMapTemp = [];
                //     }

                //     imageMapTemp.push(imageMap.pop()!);

                //     const imageLoadPromise = storageRef.child('demo/' + imageMapTemp[imageMapTemp.length - 1] + '.jpg').getDownloadURL();
                //     // end select random dummy image

                //     const idea = c.doc.data() as IPeristedIdea;
                //     const ideaEvents = {
                //         onVoteUp: (key: string) => onVoteUpIdea(key),
                //         onDelete: (key: string) => onDeleteIdea(key)
                //     }
                //     return Object.assign(idea, { key: idea.id, imageLoad: imageLoadPromise, events: ideaEvents }) as IIdeaCardModel;
                // });

                resolve(newIdeas as IIdeaCardModel[]);

                // if (updatedIdeas.length) {
                //     for (let idea of updatedIdeas) {
                //         store.dispatch(updateIdea(idea as IIdeaCardModel));
                //     }
                // }
            });
    });
}

export function fetchIdeas() {
    return (dispatch: Dispatch) => {
        dispatch(fetchIdeasBegin());
        return fetchIdeasAsync()
            .then(handleErrors)
            .then(ideas => {
                dispatch(fetchIdeasSuccess(ideas));
                return ideas;
            })
            .catch(error => dispatch(fetchIdeasError(error)));
    };
}

// Handle HTTP errors since fetch won't.
function handleErrors(response: any) {
    // TODO
    return response;
}