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
    const ideaGridEl = document.getElementById("idea-grid");
    if (!ideaGridEl)
        return;

    db.collection("ideas").limit(5).onSnapshot(querySnapshot => {
        const items = querySnapshot.docChanges().map(i => createIdeaItem(i.doc.data() as IIdea));
        salvattore.prependElements(ideaGridEl, items);
    });

    ideaGridEl.onclick = (e) => {
        const target = e.target as HTMLElement;
        const buttonEl = target.closest('.vote-button');
        if (buttonEl) {
            if (buttonEl.classList.contains("plus"))
                alert("plus clicked");
            else if (buttonEl.classList.contains("minus"))
                alert("minus clicked");

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
    db.collection("ideas").add(idea).then(docRef => {
        console.log("Document written with ID: ", docRef.id);
    })
        .catch(function (error) {
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
            <div class="vote-button minus">
                <span class="bg bg-minus"></span>
                <span class="symbol symbol-minus"></span>
                </a>
            </div>
        </div>
    `;

    article.innerHTML = articleContent;
    // (article.querySelector(".vote-button") as HTMLElement).onclick = voteButtonClickEvent;
    return article;


}

function voteButtonClickEvent(e: MouseEvent) {
    const button = e.currentTarget;
    if (!button || !(button instanceof Element)) return;

    button.querySelector(".bg")!.classList.toggle("active");
}