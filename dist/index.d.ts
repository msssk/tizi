declare module "tizi" {
    global {
        namespace JSX {
            interface IntrinsicElements {
                [elementName: string]: any;
            }
        }
    }
    export const emptyObject: any;
    export type Renderable = string | Node;
    export type RenderChildren = Renderable | Renderable[];
    export interface Controller<E extends HTMLElement = HTMLElement> {
        destroy?(): void;
        element?: E;
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
    export type ComponentOptions<E extends HTMLElement, C extends Controller<E> = Controller<E>> = {
        [key: string]: unknown;
        controller?: C;
        ref?: Ref<E> | ComponentRef<C>;
    };
    export interface Component {
        <E extends HTMLElement, C extends Controller<E>>(options?: ComponentOptions<E, C>, children?: RenderChildren): E;
    }
    export type ElementOptions = {
        [key: string]: unknown;
        controller?: Controller;
        ref?: Ref | ComponentRef<Controller>;
    };
    export function Fragment(_: ElementOptions, children: Renderable[]): DocumentFragment;
    export function render<C extends Controller = Controller>(element: string | Node, options?: ElementOptions | ComponentOptions<HTMLElement> | RenderChildren, children?: RenderChildren, controller?: C): typeof element extends string ? Text : typeof element extends Node ? typeof element : unknown;
    declare function tizi<K extends keyof HTMLElementTagNameMap>(tagName: K | Component, options?: ElementOptions, ...children: Renderable[]): any;
    declare namespace tizi {
        var Fragment: typeof import("tizi").Fragment;
    }
    export default tizi;
}
