declare module "tizi" {
    global {
        namespace JSX {
            interface IntrinsicElements {
                [elementName: string]: unknown;
            }
        }
    }
    export type Renderable = string | Node;
    export type RenderChildren = Renderable | Renderable[];
    export class Controller<E extends HTMLElement = HTMLElement> {
        element?: E;
        listenerRemovers: Array<() => void>;
        destroy(): void;
    }
    export const RefElementSymbol: unique symbol;
    export const RefControllerSymbol: unique symbol;
    export type Ref<E extends HTMLElement = HTMLElement> = {
        [RefElementSymbol]: E;
        clone(ref: Ref<E>): void;
        element: E;
    };
    export function createRef<T extends HTMLElement>(): T & Ref<T>;
    export interface ComponentRef<C extends Controller<HTMLElement>> extends Ref {
        [RefControllerSymbol]: C;
        clone(ref: ComponentRef<C>): void;
        control(element: Controller['element'], controller?: C): void;
    }
    export function createComponentRef<C extends Controller<HTMLElement> = Controller<HTMLElement>>(): C & ComponentRef<C>;
    export interface ComponentOptions<E extends HTMLElement, C extends Controller<E> = Controller<E>> {
        controller?: C;
        ref?: ComponentRef<C>;
    }
    export interface Component<E extends HTMLElement, C extends Controller<E> = Controller<E>, P extends ComponentOptions<E, C> = ComponentOptions<E, C>> {
        (options?: P, children?: RenderChildren): E;
    }
    export type ElementOptions = {
        [key: string]: unknown;
        controller?: Controller;
        ref?: Ref | ComponentRef<Controller>;
    };
    export function Fragment(_: ElementOptions, children: Renderable[]): DocumentFragment;
    declare function tizi<K extends keyof HTMLElementTagNameMap>(tagNameOrComponent: K | Component<HTMLElementTagNameMap[K]>, options?: ElementOptions | ComponentOptions<HTMLElementTagNameMap[K]>, ...children: Renderable[]): HTMLElementTagNameMap[K];
    declare namespace tizi {
        var Fragment: typeof import("tizi").Fragment;
    }
    export default tizi;
}
