import { config } from '../../config';

import * as firebase from 'firebase/app';
import 'firebaseui';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import utils from './framework/utils'
import { IIdea, IPeristedIdea, IIdeaCardModel } from './interfaces/IIdea'
import IPanel from './interfaces/IPanel';
import { Panel, LoginPanel, SubmitIdeaPanel } from './framework/panel';

import { IdeaCard, IdeaCardGrid } from './components/IdeaCard'

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { createStore } from "redux";

import IAppState from './interfaces/IAppState';

// 'HelloProps' describes the shape of props.
// State is never set so we use the '{}' type.

let imageMapTemp: string[] = [];
let imageMap = [
    "bbq",
    "bikerepair",
    "brokenbike",
    "buren",
    "cat",
    "communicatie",
    "drink",
    "games",
    "herfstbladeren",
    "kubb",
    "speeltuin",
    "renovatie",
    "tuinieren",
    "yoga"
];

const ideaReducer = (state: IIdeaCardModel, action: { type: string, payload: IIdeaCardModel }) => {
    switch (action.type) {
        case "IDEA_UPDATED":
            if (action.payload.id !== state.id) {
                return state;
            }

            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}

const rootReducer = (state: IAppState = { ideas: [] }, action: { type: string, payload: any }): IAppState => {
    console.log(action);
    switch (action.type) {
        case "IDEAS_ADDED":
            const newIdeas = [...state.ideas, ...action.payload.ideas];
            return {
                ideas: newIdeas
            }
        case "IDEA_REMOVED":
            return {
                ideas: [...state.ideas.filter(i => i.id !== action.payload.key)]
            }
        case "IDEA_UPDATED":
            return {
                ideas: state.ideas.map(i => ideaReducer(i, { type: action.type, payload: action.payload }))
            }
        default:
            return {
                ideas: [...state.ideas]
            }
    }
}

const appState: IAppState = {
    ideas: []
}

const store = createStore(rootReducer);

const firebaseApp = firebase.initializeApp({
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

const dbIdeasRef = db.collection("ideas");

const pagesize = 10;

let ideasPanel: IPanel<void>;
let newIdeaPanel: SubmitIdeaPanel;
let loginPanel: IPanel<firebase.User | null>;
let ideaGridEl: HTMLElement;

let snackbarContainer: HTMLElement | null;

declare const firebaseui: any;


window.onload = function (e) {
    ideaGridEl = document.getElementById("ideas") as HTMLElement;
    if (!ideaGridEl)
        return;

    db.collection("ideas")
        .where("deleted", '==', false)
        .orderBy("created", "desc")
        .limit(pagesize).onSnapshot({ includeMetadataChanges: true }, querySnapshot => {
            console.log(querySnapshot);
            const changes = querySnapshot.docChanges();

            const updatedIdeas = changes.filter(c => c.type === "modified");
            const newIdeas = changes.filter(c => c.type === "added")
                .map(c => {
                    // select a random dummy image
                    const image = null;
                    if (imageMap.length == 0) {
                        imageMap = imageMapTemp.slice();
                        imageMapTemp = [];
                    }

                    imageMapTemp.push(imageMap.pop()!);

                    const imageLoadPromise = storageRef.child('demo/' + imageMapTemp[imageMapTemp.length - 1] + '.jpg').getDownloadURL();
                    // end select random dummy image

                    const idea = c.doc.data() as IPeristedIdea;
                    const ideaEvents = {
                        onVoteUp: (key: string) => onVoteUpIdea(key),
                        onDelete: (key: string) => onDeleteIdea(key)
                    }
                    return Object.assign(idea, { key: idea.id, imageLoad: imageLoadPromise, events: ideaEvents }) as IIdeaCardModel;
                });

            if (newIdeas.length) {
                store.dispatch({
                    type: "IDEAS_ADDED", payload: {
                        ideas: newIdeas
                    }
                });
            }

            if (updatedIdeas.length) {
                for (let idea of updatedIdeas) {
                    store.dispatch({
                        type: "IDEA_UPDATED",
                        payload: idea
                    });
                }
            }
        });

    ideasPanel = new Panel<void>(document.getElementById("ideas") as HTMLElement, false);
    ideasPanel.openAsync();

    newIdeaPanel = new SubmitIdeaPanel(document.getElementById("newidea") as HTMLElement, firebaseApp);

    loginPanel = new LoginPanel(document.getElementById("authentication") as HTMLElement, new firebaseui.auth.AuthUI(firebase.auth()), firebaseApp);

    snackbarContainer = document.querySelector('#snackbar');

    const headerNavigationLogoutButton = document.querySelector("header .mdl-navigation .logout");
    if (headerNavigationLogoutButton) {
        headerNavigationLogoutButton.addEventListener("click", e => {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                document.body.classList.remove("logged-in");
                showSnackbarMessage(`Tot ziens!`);
            });
        });
    }

    const headerNavigationLoginButton = document.querySelector("header .mdl-navigation .login");
    if (headerNavigationLoginButton) {
        headerNavigationLoginButton.addEventListener("click", e => {
            e.preventDefault();
            ideasPanel.close(undefined);
            loginPanel.openAsync().then(user => {
                ideasPanel.openAsync();
                handleLoggedIn(user);
            })
        });
    }

    const newIdeaButtons = document.querySelectorAll('button.new-idea');
    for (let i = 0; i < newIdeaButtons.length; i++) {
        newIdeaButtons[i].addEventListener("click", e => {
            ideasPanel.close(undefined);
            newIdeaPanel.openAsync().then(newIdea => {
                ideasPanel.openAsync();
            });
        });
    }

    const addNewIdeaPanel = document.getElementById('newidea');
    if (addNewIdeaPanel) {
        const submitNewIdeaBtnEl = addNewIdeaPanel.querySelector('#submitNewIdea');
        const cancelNewIdeaBtn = addNewIdeaPanel.querySelector("#cancelNewIdeaBtn");
        const noIdeaBtnEl = addNewIdeaPanel.querySelector('#noIdeaBtn');

        const titleEl = addNewIdeaPanel.querySelector('input.title') as HTMLInputElement;
        const authorEl = addNewIdeaPanel.querySelector('input.author') as HTMLInputElement;
        const descriptionEl = addNewIdeaPanel.querySelector('textarea.description') as HTMLTextAreaElement;

        if (cancelNewIdeaBtn) {
            cancelNewIdeaBtn.addEventListener("click", e => {
                newIdeaPanel.close(undefined);
            });
        }

        if (submitNewIdeaBtnEl) {
            submitNewIdeaBtnEl.addEventListener("click", e => {

                e.preventDefault();
                const newIdea = {
                    title: titleEl.value,
                    description: descriptionEl.value,
                    author: authorEl.value,
                    votes: 1
                };

                newIdeaPanel.close(newIdea);
                submitIdeaAsync(newIdea).then(idea => {
                    // TODO: add error handling with retry
                });
            });
        }

        // code to generate dummy text to make my test life easier
        if (noIdeaBtnEl) {
            noIdeaBtnEl.addEventListener("click", e => {
                fetch('https://baconipsum.com/api/?type=all-meat-and-filler&paras=1&start-with-lorem=0&format=json&sentences=2')
                    .then(response => {
                        response.json().then(v => {
                            utils.updateInputValue(descriptionEl, v);
                            utils.updateInputValue(titleEl, v[0].split(' ').slice(0, 2).join(' '));
                        });
                    });
            });
        }
    }

    const unsubscribeOnAuthChanged = firebaseApp.auth().onAuthStateChanged((user: firebase.User | null) => {
        unsubscribeOnAuthChanged();
        handleLoggedIn(user);
    });

    store.subscribe(render);
    render(); // display initial state in UI
}

function render() {
    ReactDOM.render(
        React.createElement(IdeaCardGrid, { ideas: store.getState().ideas }),
        ideaGridEl);
}

function onVoteUpIdea(key: string) {
    canVoteOnIdeaAsync()
        .then(() => voteOnIdeaAsync(key, firebaseApp.auth().currentUser!.uid)
            , () => {
                showSnackbarMessage("U moet ingelogd zijn om te kunnen stemmen.");
            });
}

function onDeleteIdea(key: string) {
    console.log("begin delete idea: " + key);
    deleteIdeaAsync(key);
}

function submitIdeaAsync(idea: IIdea): Promise<IPeristedIdea> {
    return new Promise((resolve, reject) => {
        const ref = dbIdeasRef.doc();
        const persistedIdea = {
            ...idea,
            id: ref.id,
            deleted: false,
            created: firebase.firestore.FieldValue.serverTimestamp()
        };

        ref.set(persistedIdea).then(docRef => {

            showSnackbarMessageAsync("Bedankt voor uw idee.", "Ongedaan maken")
                .then(() => deleteIdeaAsync(persistedIdea.id));
            resolve(persistedIdea);
        })
            .catch(function (error) {
                console.error("Error adding idea: ", error);
                reject(error);
            });
    });
}

function deleteIdeaAsync(id: string): Promise<void> {
    return dbIdeasRef.doc(id).update({ deleted: true })
        .then(() => {
            // TODO: move out UI stuff
            showSnackbarMessage("Uw idee werd verwijderd.");
            store.dispatch({ type: "IDEA_REMOVED", payload: { key: id } });
        });
}

function canVoteOnIdeaAsync(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const u = firebaseApp.auth().onAuthStateChanged((user: firebase.User | null) => {
            u(); // unsubscribe the auth changed listener
            if (user) resolve();
            else reject();
        })
    });
}

function voteOnIdeaAsync(id: string, uid: string): Promise<void> {
    const ideaRef = dbIdeasRef.doc(id);
    return db.runTransaction(transaction => {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(ideaRef).then(doc => {
            if (!doc.exists) {
                throw "Document does not exist!";
            }

            const newVoteCount = (doc.data()! as IPeristedIdea).votes + 1;
            transaction.update(ideaRef, { votes: newVoteCount });

            // to verify: good idea to dispatch the action here as well to get a better ui response?
            // Seems transactions to not fire a snapshot change untill really save in database...
            store.dispatch({
                type: "IDEA_UPDATED",
                payload: Object.assign({}, doc.data() as IPeristedIdea, { votes: newVoteCount })
            });
        });
    }).then(function () {
        console.log("Transaction successfully committed!");
    }).catch(function (error) {
        console.log("Transaction failed: ", error);
    });
}

function showSnackbarMessageAsync(message: string, action: string) {
    return new Promise((resolve, reject) => {
        // show snackbar

        if (snackbarContainer) {
            const data = {
                message: message,
                timeout: 4000,
                actionHandler: resolve,
                actionText: action
            };
            (snackbarContainer as any).MaterialSnackbar.showSnackbar(data);
        }
    })
}

function showSnackbarMessage(message: string) {
    if (snackbarContainer) {
        const data = {
            message: message,
            timeout: 4000,
        };
        (snackbarContainer as any).MaterialSnackbar.showSnackbar(data);
    }
}

function handleLoggedIn(user: firebase.User | null) {
    if (user) {
        showSnackbarMessage(`Welkom: ${user.displayName}`);
        document.body.classList.add("logged-in");
    }
}