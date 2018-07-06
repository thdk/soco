import { Panel } from "../panel";
import { IIdea } from "../../interfaces/IIdea";

import * as firebase from 'firebase/app'
import utils from '../utils';

export class SubmitIdeaPanel extends Panel<IIdea | undefined> {
    private readonly firebaseApp: any;

    private readonly titleEl: HTMLInputElement;
    private readonly authorEl: HTMLInputElement;
    private readonly descriptionEl: HTMLTextAreaElement;

    constructor(containerEl: HTMLElement, firebaseApp: firebase.app.App) {
        super(containerEl);
        this.firebaseApp = firebaseApp;

        this.titleEl = this.containerEl.querySelector('input.title') as HTMLInputElement;
        this.authorEl = this.containerEl.querySelector('input.author') as HTMLInputElement;
        this.descriptionEl = this.containerEl.querySelector('textarea.description') as HTMLTextAreaElement;
    }

    public openAsync():Promise<IIdea | undefined> {
        return new Promise((resolve, reject) => {
            const unsubscribeOnAuthChanged = this.firebaseApp.auth().onAuthStateChanged((user: firebase.User) => {
                unsubscribeOnAuthChanged();
                if (user && user.displayName) {
                    const authorEl = this.containerEl.querySelector("input.author") as HTMLInputElement;
                    utils.updateInputValue(authorEl, user.displayName);
                }
                resolve();
            });
        }).then(() => super.openAsync());
    }

    public close(value: IIdea | undefined) {
        utils.updateInputValue(this.titleEl);
        utils.updateInputValue(this.descriptionEl);
        super.close(value);
    }
}