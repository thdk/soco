import { config } from '../../config';

import { IIdea } from './interfaces/IIdea'

import * as firebase from 'firebase/app';
import 'firebase/firestore'

const firebaseApp = firebase.initializeApp({
    apiKey: config.firebase.apiKey,
    authDomain: config.firebase.authDomain,
    projectId: config.firebase.projectId
});

// Initialize Cloud Firestore through Firebase
const db = firebaseApp.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

const dbIdeasRef = db.collection("ideas");

window.onload = function (e) {
    const ideaGrid = document.getElementById("idea-grid");
    if (!ideaGrid)
        return;

        dbIdeasRef.onSnapshot(querySnapshot => {
        const items = querySnapshot.docChanges().map(i =>  createIdeaItem(i.doc.data() as IIdea));
        salvattore.prependElements(ideaGrid, items);
    });

    const headerNewIdeaButton = document.getElementById('headerNewIdeaBtn');
    const addNewIdeaPanel = document.getElementById('newidea');  

    if (headerNewIdeaButton)
        headerNewIdeaButton.addEventListener("click", e => {
            window.location.href = "#newidea";
        });

    if (addNewIdeaPanel) {
        const submitNewIdeaBtn = addNewIdeaPanel.querySelector('#submitNewIdea');
        const titleEl = addNewIdeaPanel.querySelector('input.title') as HTMLInputElement;
        const descriptionEl = addNewIdeaPanel.querySelector('textarea.description') as HTMLTextAreaElement;
        if (submitNewIdeaBtn)
            submitNewIdeaBtn.addEventListener("click", e => {
                e.preventDefault();
                const newIdea = {
                    title: titleEl.value,
                    description: descriptionEl.value
                };

                submitIdea(newIdea);
            });
    }    
}

function submitIdea(idea: IIdea) {
    dbIdeasRef.add(idea).then(docRef => {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
}

function createIdeaItem(idea: IIdea): HTMLElement {
    const article = document.createElement('article');
    const articleContent = `
        <h2>${idea.title}</h2>
        <p>${idea.description}</p>
        <div class="vote-buttons-wrapper">
            <div class="vote-button plus">
                <span class="bg bg-plus"></span>
                <span class="symbol symbol-plus"></span>
                </a>
            </div>
            <!--<div class="vote-button minus">
                <span class="bg bg-minus"></span>
                <span class="symbol symbol-minus"></span>
                </a>
            </div>-->
        </div>
    `;

    article.innerHTML = articleContent;
    (article.querySelector(".vote-button") as HTMLElement).onclick = voteButtonClickEvent;
    return article;
}

function voteButtonClickEvent(e:MouseEvent) {
    const button = e.currentTarget;
    if (!button || !(button instanceof Element)) return;

    button.querySelector(".bg")!.classList.toggle("active");
}