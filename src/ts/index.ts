import { config } from '../../config';

import * as firebase from 'firebase/app';
import 'firebaseui';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import utils from './framework/utils'
import { IIdea, IPeristedIdea } from './interfaces/IIdea'
import IPanel from './interfaces/IPanel';
import { Panel, LoginPanel, SubmitIdeaPanel } from './framework/panel';

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

const ideaIs: string[] = [];

window.onload = function (e) {
    ideaGridEl = document.getElementById("idea-grid") as HTMLElement;
    if (!ideaGridEl)
        return;

    // db.collection("ideas").where("deleted", '==', false).limit(pagesize).get().then(querySnapshot => {
    //     const items = querySnapshot.docs.map(doc => createIdeaItem({ ...doc.data(), id: doc.id } as IPeristedIdea));
    //     salvattore.prependElements(ideaGridEl, items);
    // });
    db.collection("ideas")
        .where("deleted", '==', false)
        .orderBy("created", "desc")
        .limit(pagesize).onSnapshot(querySnapshot => {
            const ideaEls = querySnapshot.docChanges()
                .filter(c => ideaIs.findIndex(id => id === c.doc.id) == -1)
                .map(change => {
                    console.log(change);
                    const idea = { ...change.doc.data()} as IPeristedIdea;
                    ideaIs.push(idea.id);
                    return createIdeaItem(idea);
                });
            salvattore.prependElements(ideaGridEl, ideaEls);
        });

    ideasPanel = new Panel<void>(document.getElementById("ideas") as HTMLElement, false);
    ideasPanel.openAsync();

    newIdeaPanel = new SubmitIdeaPanel(document.getElementById("newidea") as HTMLElement, firebaseApp);

    loginPanel = new LoginPanel(document.getElementById("authentication") as HTMLElement, new firebaseui.auth.AuthUI(firebase.auth()), firebaseApp);

    snackbarContainer = document.querySelector('#snackbar');

    ideaGridEl.onclick = (e) => {
        const target = e.target as HTMLElement;
        const buttonEl = target.closest('.vote-button');
        if (buttonEl) {
            //if (buttonEl.classList.contains("plus"))
            // alert("plus clicked");
            // else if (buttonEl.classList.contains("minus"))
            // alert("minus clicked");

            buttonEl.querySelector(".bg")!.classList.toggle("active");
        }

        const deleteButtonEl = target.closest(".delete-icon");
        if (deleteButtonEl) {
            deleteIdeaAsync(deleteButtonEl.closest('.mdl-card')!.attributes.getNamedItem('data-id')!.value);
        }
    };

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
                    author: authorEl.value
                };

                newIdeaPanel.close(newIdea);
                submitIdeaAsync(newIdea).then(idea => {
                    // TODO: add error handling with retry
                });
            });
        }

        if (noIdeaBtnEl) {
            noIdeaBtnEl.addEventListener("click", e => {
                fetch('https://baconipsum.com/api/?type=all-meat-and-filler&paras=1&start-with-lorem=0&format=json&sentences=2')
                    .then(response => {
                        response.json().then(v => {
                            utils.updateInputValue(descriptionEl, v);
                            utils.updateInputValue(titleEl, v[0].split(' ').slice(0, 2).join(' '));
                        });
                    })
                    .then(function (myJson) {
                        console.log(myJson);
                    });
            });
        }
    }

    const unsubscribeOnAuthChanged = firebaseApp.auth().onAuthStateChanged((user: firebase.User | null) => {
        unsubscribeOnAuthChanged();
        handleLoggedIn(user);
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

function deleteIdeaAsync(id: string): Promise<void> {
    return db.collection("ideas").doc(id).update({ deleted: true })
        .then(() => {
            showSnackbarMessage("Uw idee werd verwijderd.");
            ideaGridEl!.querySelector('.mdl-card[data-id=' + id + ']')!.parentElement!.remove();
            salvattore.recreateColumns(ideaGridEl);
        })
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

function createIdeaItem(idea: IPeristedIdea): HTMLElement {
    const article = document.createElement('article');
    const articleContent = `
    <div class="demo-card-wide mdl-card mdl-shadow--2dp" data-id="${idea.id}">
        <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">${idea.title}</h2>
        </div>
        <div class="mdl-card__supporting-text">
            <p>${idea.description}</p>

            ${createAuthorTemplate(idea)}
        </div>
        ${createCardActions(idea)}
        </div>
        <div class="mdl-card__menu">
            <button class="mdl-button delete-icon mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                <i class="material-icons">clear</i>
            </button>
        </div>
    </div>
    `;

    article.innerHTML = articleContent;
    const image = null;
    if (imageMap.length == 0) {
        imageMap = imageMapTemp.slice();
        imageMapTemp = [];
    }

    imageMapTemp.push(imageMap.pop()!);

    storageRef.child('demo/' + imageMapTemp[imageMapTemp.length - 1] + '.jpg').getDownloadURL().then(imageUrl => {
        const titleEl = (article.querySelector('.mdl-card__title') as HTMLElement);
        titleEl.classList.add("hasImage");
        titleEl.style.backgroundImage = 'url(' + imageUrl + ')';
    });

    return article;
}

function createAuthorTemplate(idea: IIdea) {
    if (idea.author)
        return `<p>Door: ${idea.author}</p>`;
    else
        return "";
}

function createCardActions(idea: IIdea) {
    return `<div class="mdl-card__actions mdl-card--border">
        <div class="vote-buttons-wrapper">
            <i class="material-icons">favorite_border</i>
        </div>`;
}

function voteButtonClickEvent(e: MouseEvent) {
    const button = e.currentTarget;
    if (!button || !(button instanceof Element)) return;

    button.querySelector(".bg")!.classList.toggle("active");
}

function handleLoggedIn(user: firebase.User | null) {
    if (user) {
        showSnackbarMessage(`Welkom: ${user.displayName}`);
        document.body.classList.add("logged-in");
    }
}