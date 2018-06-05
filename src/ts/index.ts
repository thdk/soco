import { config } from '../../config';

import { IIdea } from './interfaces/IIdea'

import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';

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
const db = firebaseApp.firestore();
const storage = firebaseApp.storage();
const storageRef = storage.ref();

const settings = { timestampsInSnapshots: true };
db.settings(settings);

const dbIdeasRef = db.collection("ideas");

const pagesize = 10;

window.onload = function (e) {
    const ideaGridEl = document.getElementById("idea-grid");
    if (!ideaGridEl)
        return;

    db.collection("ideas").limit(pagesize).get().then(querySnapshot => {
        const items = querySnapshot.docs.map(doc => createIdeaItem(doc.data() as IIdea));
        salvattore.prependElements(ideaGridEl, items);
    });

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
    };

    const headerNewIdeaButton = document.getElementById('headerNewIdeaBtn');
    const addNewIdeaPanel = document.getElementById('newidea');

    if (headerNewIdeaButton)
        headerNewIdeaButton.addEventListener("click", e => {
            window.location.href = "#newidea";
        });

    if (addNewIdeaPanel) {
        const submitNewIdeaBtnEl = addNewIdeaPanel.querySelector('#submitNewIdea');
        const noIdeaBtnEl = addNewIdeaPanel.querySelector('#noIdeaBtn');

        const titleEl = addNewIdeaPanel.querySelector('input.title') as HTMLInputElement;
        const descriptionEl = addNewIdeaPanel.querySelector('textarea.description') as HTMLTextAreaElement;

        if (submitNewIdeaBtnEl) {
            submitNewIdeaBtnEl.addEventListener("click", e => {
                e.preventDefault();
                const newIdea = {
                    title: titleEl.value,
                    description: descriptionEl.value
                };

                submitIdeaAsync(newIdea).then(idea => {
                    const itemEl = createIdeaItem(newIdea);
                    salvattore.prependElements(ideaGridEl, [itemEl]);
                    const itembounds = itemEl.closest('section')!.getBoundingClientRect();
                    window.scrollTo(0, itembounds.top + window.scrollY);
                    updateInputValue(titleEl);
                    updateInputValue(descriptionEl);
                });
            });
        }

        if (noIdeaBtnEl) {
            noIdeaBtnEl.addEventListener("click", e => {
                fetch('https://baconipsum.com/api/?type=all-meat-and-filler&paras=1&start-with-lorem=0&format=json&sentences=2')
                    .then(response => {
                        response.json().then(v => {
                            updateInputValue(descriptionEl, v);
                            updateInputValue(titleEl, v[0].split(' ').slice(0, 2).join(' '));
                        });
                    })
                    .then(function (myJson) {
                        console.log(myJson);
                    });
            });
        }
    }
}

function updateInputValue(element: HTMLInputElement | HTMLTextAreaElement, text?: string) {
    element.value = text ? text : '';
    element.closest("div")!.classList.toggle("is-dirty", !!text);

    if (element instanceof HTMLTextAreaElement) {
        element.style.height = "1px";
        element.style.height = (25 + element.scrollHeight) + "px";
    }
}

function submitIdeaAsync(idea: IIdea): Promise<IIdea> {
    return new Promise((resolve, reject) => {
        db.collection("ideas").add(idea).then(docRef => {
            resolve(idea);
        })
            .catch(function (error) {
                console.error("Error adding idea: ", error);
                reject(error);
            });
    });
}

function createIdeaItem(idea: IIdea): HTMLElement {
    const article = document.createElement('article');
    const articleContent = `
    <div class="demo-card-wide mdl-card mdl-shadow--2dp">
        <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">${idea.title}</h2>
        </div>
        <div class="mdl-card__supporting-text">
            ${idea.description}
        </div>
        <div class="mdl-card__actions mdl-card--border">
        <div class="vote-buttons-wrapper">
            <div class="vote-button plus">
                <span class="bg bg-plus"></span>
                <span class="symbol symbol-plus"></span>
                </a>
            </div>
            <div class="vote-button minus">
                <span class="bg bg-minus"></span>
                <span class="symbol symbol-minus"></span>
                </a>
            </div>
        </div>
        </div>
        <div class="mdl-card__menu">
            <button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                <i class="material-icons">share</i>
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

function voteButtonClickEvent(e: MouseEvent) {
    const button = e.currentTarget;
    if (!button || !(button instanceof Element)) return;

    button.querySelector(".bg")!.classList.toggle("active");
}