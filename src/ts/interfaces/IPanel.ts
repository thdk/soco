export interface IPanel<T> {
    openAsync(): Promise<T>;
    close(value: T): void;
}