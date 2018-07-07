import { Store, Dispatch } from "redux";
import { Action, IdeaActionType } from "../actions/idea";

import { config } from '../../../config';

import * as firebase from 'firebase/app';
import 'firebase/firestore';

import { IPeristedIdea } from "../interfaces/IIdea";
import { showSnackbarMessage } from "..";

export const firebaseApp = firebase.initializeApp({
    apiKey: config.firebase.apiKey,
    authDomain: config.firebase.authDomain,
    projectId: config.firebase.projectId,
    storageBucket: config.firebase.storageBucket
});

// Initialize Cloud Firestore through Firebase
const db = firebase.firestore();
const storage = firebase.storage();
const storageRef = storage.ref();

const settings = { timestampsInSnapshots: true };
db.settings(settings);

export const dbIdeasRef = db.collection("ideas");

export const logger = (store: any) => (next: any) => (action: any) => {
    console.log('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())
    return result
}

export const firestoreSync = (store: any) => (next: any) => (action: any) => {
    switch (action.type) {
        case IdeaActionType.VOTE_ON_IDEA:
            return voteOnIdeaAsync(action.payload.id).then(() => next(action), msg => {
                showSnackbarMessage(msg);
            });
        case IdeaActionType.DELETE_IDEA:
            deleteIdeaAsync(action.payload.id);
            return next(action);
        default:
            return next(action);
    }
}

function canVoteOnIdeaAsync(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const u = firebaseApp.auth().onAuthStateChanged((user: firebase.User | null) => {
            u(); // unsubscribe the auth changed listener
            if (user) resolve();
            else reject("U moet ingelogd zijn om te kunnen stemmen.");
        })
    });
}

function voteOnIdeaAsync(id: string): Promise<void> {
    return canVoteOnIdeaAsync()
        .then(() => {
            // firebaseApp.auth().currentUser!.uid:
            const ideaRef = db.collection("ideas").doc(id);
            return db.runTransaction(transaction => {
                // This code may get re-run multiple times if there are conflicts.
                return transaction.get(ideaRef).then(doc => {
                    if (!doc.exists) {
                        throw "Document does not exist!";
                    }

                    const newVoteCount = (doc.data()! as IPeristedIdea).votes + 1;
                    transaction.update(ideaRef, { votes: newVoteCount });
                });
            }).then(function () {
                console.log("Transaction successfully committed!");
            }).catch(function (error) {
                console.log("Transaction failed: ", error);
            });
        });
}

export const deleteIdeaAsync = (id: string): Promise<void> => {
    return dbIdeasRef.doc(id).update({ deleted: true })
        .then(() => {
            // TODO: move to action DELETE_IDEA_SUCCESS
            showSnackbarMessage("Uw idee werd verwijderd.");
        });
}