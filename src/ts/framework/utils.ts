namespace utils {
    export function updateInputValue(element: HTMLInputElement | HTMLTextAreaElement, text?: string) {
        element.value = text ? text : '';
        element.closest("div")!.classList.toggle("is-dirty", !!text);

        if (element instanceof HTMLTextAreaElement) {
            element.style.height = "1px";
            element.style.height = (25 + element.scrollHeight) + "px";
        }
    }
}

export default utils;
