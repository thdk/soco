import { config } from '../../config';

import * as firebase from 'firebase/app';
import 'firebaseui';
import 'firebase/auth';
import 'firebase/storage';

import utils from './framework/utils'
import { IIdea, IPeristedIdea, IIdeaCardModel } from './interfaces/IIdea'
import IPanel from './interfaces/IPanel';
import { Panel} from './framework/panel';

import {IdeaCardCollection} from './containers/IdeaCardGrid'

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { createStore, Store, applyMiddleware } from "redux";

import IAppState from './interfaces/IAppState';
import { IdeaActionType, Action as IdeaAction, updateIdea, deleteIdea, addIdeas } from './actions/idea';
import { ideaReducer, ideas } from './reducers/ideaReducer';
import { Provider } from 'react-redux';
import { firestoreSync, logger, firebaseApp, dbIdeasRef, deleteIdeaAsync } from './middleware';
import { SubmitIdeaPanel } from './framework/panels/submitideapanel';
import { LoginPanel } from './framework/panels/loginpanel';

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

const pagesize = 10;

let ideasPanel: IPanel<void>;
let newIdeaPanel: SubmitIdeaPanel;
let loginPanel: IPanel<firebase.User | null>;
let ideaGridEl: HTMLElement;
let layoutEl: HTMLElement;

let snackbarContainer: HTMLElement | null;

declare const firebaseui: any;

// TODO: move this to the Provider
let store: Store;

window.onload = function (e) {
    layoutEl = document.querySelector('.mdl-layout') as HTMLElement;
    ideaGridEl = document.getElementById("ideas") as HTMLElement;
    if (!ideaGridEl)
        return;

    dbIdeasRef
        .where("deleted", '==', false)
        .orderBy("created", "desc")
        .limit(pagesize).onSnapshot({ includeMetadataChanges: true }, querySnapshot => {
            console.log(querySnapshot);
            const changes = querySnapshot.docChanges();

            const updatedIdeas = changes.filter(c => c.type === "modified")
                .map(c => Object.assign({ key: c.doc.id }, c.doc.data()));
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

            if (newIdeas.length) {
                if (!store) {
                    // create store with initial state
                    store = createStore(ideas, {ideas: newIdeas}, applyMiddleware(firestoreSync, logger) );
                    ReactDOM.render(
                        <Provider store={store}>
                            <IdeaCardCollection />
                        </Provider>,
                        ideaGridEl);
                }
                else {
                    store.dispatch(addIdeas(newIdeas as IIdeaCardModel[]));
                }
            }

            if (updatedIdeas.length) {
                for (let idea of updatedIdeas) {
                    store.dispatch(updateIdea(idea as IIdeaCardModel));
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
            triggerLogout();
        });
    }

    const headerNavigationLoginButton = document.querySelector("header .mdl-navigation .login");
    if (headerNavigationLoginButton) {
        headerNavigationLoginButton.addEventListener("click", e => {
            e.preventDefault();
            triggerLogin();
        });
    }

    const drawerNavigationLogoutButton = document.querySelector(".mdl-layout__drawer .logout");
    if (drawerNavigationLogoutButton) {
        drawerNavigationLogoutButton.addEventListener("click", e => {
            e.preventDefault();
            (layoutEl as any).MaterialLayout.toggleDrawer();
            triggerLogout();
        });
    }

    const drawerNavigationLoginButton = document.querySelector(".mdl-layout__drawer .login");
    if (drawerNavigationLoginButton) {
        drawerNavigationLoginButton.addEventListener("click", e => {
            e.preventDefault();
            (layoutEl as any).MaterialLayout.toggleDrawer();
            triggerLogin();
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
}

function triggerLogin() {
    ideasPanel.close(undefined);
    loginPanel.openAsync().then(user => {
        ideasPanel.openAsync();
        handleLoggedIn(user);
    })
}

function triggerLogout() {
    firebase.auth().signOut().then(() => {
        document.body.classList.remove("logged-in");
        showSnackbarMessage(`Tot ziens!`);
    });
}


// function onDeleteIdea(key: string) {
//     console.log("begin delete idea: " + key);
//     deleteIdeaAsync(key);
// }

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

const showSnackbarMessageAsync = (message: string, action: string) => {
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

export const showSnackbarMessage = (message: string) => {
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