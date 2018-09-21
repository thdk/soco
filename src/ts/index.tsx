import * as firebase from 'firebase/app';
import 'firebaseui';
import 'firebase/auth';
import 'firebase/storage';

import utils from './framework/utils'
import { IIdea, IPeristedIdea } from './interfaces/IIdea'

import { IdeaCardCollection } from './containers/IdeaCardGrid'

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { createStore,  applyMiddleware } from "redux";

import { ideas } from './reducers/ideaReducer';
import { Provider } from 'react-redux';
import { firestoreSync, logger, firebaseApp, dbIdeasRef, deleteIdeaAsync } from './middleware/firestore';
import { SubmitIdeaPanel, IPanel, Panel, LoginPanel } from './framework/panels';

let ideasPanel: IPanel<void>;
let newIdeaPanel: SubmitIdeaPanel;
let loginPanel: IPanel<firebase.User | null>;
let ideaGridEl: HTMLElement;
let layoutEl: HTMLElement;

let snackbarContainer: HTMLElement | null;

declare const firebaseui: any;

window.onload = function (e) {
    layoutEl = document.querySelector('.mdl-layout') as HTMLElement;
    ideaGridEl = document.getElementById("ideas") as HTMLElement;
    if (!ideaGridEl)
        return;

    // todo: no need to pass initial state if it is empty
    const store = createStore(ideas, { ideas: [] }, applyMiddleware(firestoreSync, logger));
    ReactDOM.render(
        <Provider store={store}>
           <IdeaCardCollection/>
        </Provider>,
        ideaGridEl);

    ideasPanel = new Panel<void>(document.getElementById("ideas") as HTMLElement, false);
    ideasPanel.openAsync();

    newIdeaPanel = new SubmitIdeaPanel(document.getElementById("newidea") as HTMLElement, firebaseApp);

    loginPanel = new LoginPanel(document.getElementById("authentication") as HTMLElement, new firebaseui.auth.AuthUI(firebase.auth()));

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

const showSnackbarMessageAsync = (message: string, actionText: string) => {
    return new Promise((resolve, reject) => {
        // show snackbar

        if (snackbarContainer) {
            const data = {
                message,
                timeout: 3500,
                actionHandler: resolve,
                actionText
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