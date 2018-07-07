import { IPanel } from ".";

export class Panel<T> implements IPanel<T>{
    protected readonly containerEl: HTMLElement;
    private resolve?: (value: T | PromiseLike<T> | undefined) => void;
    private readonly addBodyClass: boolean;

    constructor(containerEl: HTMLElement, addBodyClass = true) {
        this.containerEl = containerEl;
        this.addBodyClass = addBodyClass;
    }

    public openAsync() {
        if (this.addBodyClass) {
            document.body.classList.add("panel-open");
        }

        this.containerEl.classList.add("active");

        return new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
        });
    }

    public close(value: T) {
        this.containerEl.classList.remove("active");

        if (this.addBodyClass) {
            document.body.classList.remove("panel-open");
        }
        if (this.resolve) this.resolve(value);
    }
}