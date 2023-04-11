/* eslint-disable @typescript-eslint/no-namespace */
declare global {
	namespace JSX {
		interface IntrinsicElements {
			// TODO: element typing
			[elementName: string]: unknown;
		}
	}
}

/** A read-only empty object; convenience/optimization to use instead of literal `{}` */
const emptyObject: Record<string, never> = Object.freeze(Object.create(null));

export type Renderable = string | Node;
export type RenderChildren = Renderable | Renderable[];

/**
 * A Component may optionally define a controller. The controller is not quite the Controller in MVC,
 * rather it is the external API of the component. A ComponentRef will have all properties and methods
 * of the Component's controller.
 */
export class Controller<E extends HTMLElement = HTMLElement> {
	element?: E;
	listenerRemovers: Array<() => void> = [];

	/**
	 * Destroy the DOM element and perform any cleanup.
	 * Cleanup (e.g. removing event listeners) should be performed in implementations of this method.
	 * The browser will garbage collect event listeners on destroyed nodes that are unreferenced.
	 * tizi removes listeners registered with `on<EventName>` props in case there are any circular
	 * references.
	 */
	destroy () {
		this.listenerRemovers?.forEach(remove => remove());
		this.element?.remove();
	}
}

/** For internal use. A Ref stores the element on the RefElementSymbol property */
export const RefElementSymbol = Symbol('RefElementSymbol');

/** For internal use. A Ref stores the controller on the RefControllerSymbol property */
export const RefControllerSymbol = Symbol('RefControllerSymbol');

/**
 * A Ref represents an element rendered by tizi. The ref is actually a proxy to the element. The element
 * itself is accessible via `ref.element` which can be useful for equality comparison.
 */
export type Ref<E extends HTMLElement = HTMLElement> = {
	[RefElementSymbol]: E;
	clone(ref: Ref<E>): void;
	element: E;
};

const RefPrototype = Object.create(null, {
	// TODO: clone method probably needs improvement
	clone: {
		configurable: false,
		enumerable: true,
		writable: false,
		value: function (ref: Ref) {
			this[RefElementSymbol] = ref[RefElementSymbol];
		},
	},
});

export function createRef<T extends HTMLElement> (): T & Ref<T> {
	const ref = Object.create(RefPrototype);

	return new Proxy(ref, {
		get (target, key) {
			if (key === RefElementSymbol || key === 'element') {
				return target[RefElementSymbol];
			}
			else {
				let value = target[RefElementSymbol][key];
				// TODO: this is probably not a great workaround for the problem that you can't call instance methods
				// when the context has been changed from the instance to a Proxy.
				if (typeof value === 'function') {
					value = value.bind(target[RefElementSymbol]);
				}

				return value;
			}
		},

		set (target, key, value) {
			if (key === 'element') {
				return false;
			}

			if (key === RefElementSymbol) {
				target[RefElementSymbol] = value;
			}
			else {
				target[RefElementSymbol][key] = value;
			}

			return true;
		},
	});
}

/**
 * A ComponentRef represents a component rendered by tizi. The ref is actually a proxy to the
 * component's controller. The component's root element is accessible via `ref.element`.
 */
export interface ComponentRef<C extends Controller<HTMLElement>> extends Ref {
	[RefControllerSymbol]: C;
	clone(ref: ComponentRef<C>): void;
	control(element: Controller['element'], controller?: C): void;
}

const ComponentRefPrototype = Object.create(null, {
	clone: {
		configurable: false,
		enumerable: true,
		writable: false,
		value: function<E extends HTMLElement> (ref: ComponentRef<Controller<E>>) {
			RefPrototype.clone(ref);
			this[RefControllerSymbol] = ref[RefControllerSymbol];
		},
	},

	control: {
		configurable: false,
		enumerable: true,
		writable: false,
		value: function control<E extends HTMLElement = HTMLElement, C extends Controller<E> = Controller<E>>
		(element: E, controller?: C) {
			if (controller) {
				Object.defineProperty(controller, 'element', {
					configurable: false,
					enumerable: true,
					writable: false,
					value: element,
				});
			}

			this[RefElementSymbol] = element;
			this[RefControllerSymbol] = controller || emptyObject;
		},
	},
});

/**
 * Create a component ref that can be passed to a component's `ref` prop
 */
export function createComponentRef<C extends Controller<HTMLElement> = Controller<HTMLElement>> ():
	C & ComponentRef<C> {
	const ref = Object.create(ComponentRefPrototype);

	return new Proxy(ref, {
		get (target, property) {
			if (property === 'element') {
				return target[RefElementSymbol];
			}
			else if (property === 'clone' || property === 'control') {
				return target[property];
			}
			else {
				return target[RefControllerSymbol][property];
			}
		},

		set (target, property, value) {
			if (property === 'clone' || property === 'control' || property === 'element') {
				return false;
			}

			if (property === RefControllerSymbol || property === RefElementSymbol) {
				target[property] = value;
			}
			else {
				target[RefControllerSymbol][property] = value;
			}

			return true;
		},
	}) as C & ComponentRef<C>;
}

export interface ComponentOptions<E extends HTMLElement, C extends Controller<E> = Controller<E>> {
	// [key: string]: unknown;
	controller?: C;
	// ref?: Ref<E> | ComponentRef<C>;
	ref?: ComponentRef<C>;
}

/**
 * A tizi component.
 * Types:
 *   * E: the root element rendered by the component
 *   * C: the component's controller type (if there is a controller; `Controller<E>` if there is no controller)
 *   * P: the component's props type
 */
export interface Component<
	E extends HTMLElement,
	C extends Controller<E> = Controller<E>,
	P extends ComponentOptions<E, C> = ComponentOptions<E, C>,
> {
	(options?: P, children?: RenderChildren): E
}

function appendChild (parent: Node) {
	return function (child: Renderable) {
		if (!child) {
			return;
		}

		if (typeof child === 'string') {
			child = document.createTextNode(child);
		}

		parent.appendChild(child);
	};
}

export type ElementOptions = {
	[key: string]: unknown;
	controller?: Controller;
	ref?: Ref | ComponentRef<Controller>;
};

export function Fragment (_: ElementOptions, children: Renderable[]) {
	const fragment = document.createDocumentFragment();
	if (children.length) {
		children.forEach(appendChild(fragment));
	}

	return fragment;
}

const eventHandlerRegex = /^on[A-Z][a-zA-Z]+$/;
const PREFIX_LENGTH = 2; // length of 'on' prefix in 'onClick'

function applyOptions<E extends HTMLElement> (element: E, options: ElementOptions, controller?: Controller) {
	Object.keys(options).forEach(function (key) {
		const value = options[key];

		if (eventHandlerRegex.test(key)) {
			const [ eventListener, eventListenerOptions ] = (Array.isArray(value) ?
				value :
				[ value ]) as [EventListener, EventListenerOptions?];
			const eventName = key.slice(PREFIX_LENGTH).toLowerCase();
			element.addEventListener(eventName, eventListener, eventListenerOptions);

			if (controller) {
				controller.listenerRemovers.push(() => element.removeEventListener(eventName, eventListener));
			}
		}
		else if (element.setAttribute && typeof value === 'string') {
			element.setAttribute(key, value as string);
		}
		else {
			element[key] = value;
		}
	});
}

function isChild (child: unknown): child is Renderable {
	const childType = typeof child;
	if (childType === 'string' || child instanceof Node || Array.isArray(child)) {
		return true;
	}

	return false;
}

/**
 * Apply `options` to `element`, including `options.ref`. If provided, append `children` to `element`.
 * If provided, apply `controller` to `options.ref`. Can be called as `render(element, options, children)` or
 * `render(element, options)` or `render(element, children)`. If `controller` is specified all parameters must
 * be supplied.
 */
function render (
	element: Node,
	options?: ElementOptions | RenderChildren,
	children?: RenderChildren,
	controller?: Controller,
): typeof element extends string ? Text : typeof element extends Node ? typeof element : unknown {
	// if (typeof element === 'string') {
	// 	console.log(`render called with string element: ${element}`);
	// 	element = document.createTextNode(element);
	// }

	if (isChild(options)) {
		children = options;
		options = emptyObject as ElementOptions;
	}

	const {
		ref,
		...elementOptions
	} = options as ElementOptions;

	if (elementOptions && element.nodeType === element.ELEMENT_NODE) {
		applyOptions(element as HTMLElement, elementOptions, controller);
	}

	if (ref && element.nodeType === element.ELEMENT_NODE) {
		if ('control' in ref) {
			ref.control(element as HTMLElement, controller);
		}
		else {
			ref[RefElementSymbol] = element as HTMLElement;
		}
	}

	if (children) {
		if (!Array.isArray(children)) {
			children = [ children ];
		}

		children.forEach(appendChild(element));
	}

	return element;
}

export default function tizi<K extends keyof HTMLElementTagNameMap> (
	tagNameOrComponent: K | Component<HTMLElementTagNameMap[K]>,
	options?: ElementOptions | ComponentOptions<HTMLElementTagNameMap[K]>,
	...children: Renderable[]
) {
	const {
		controller,
		...elementOptions
	} = (options || emptyObject) as ElementOptions;

	// nested renders cause children to become a nested array, flatten it:
	children = children.flat();

	if (typeof tagNameOrComponent === 'string') {
		const tagName = tagNameOrComponent;
		const element = document.createElement(tagName);
		render(
			element,
			elementOptions,
			children,
			controller as unknown as Controller<HTMLElementTagNameMap[K]>,
		);

		return element;
	}

	const componentFunction = tagNameOrComponent;
	const element = componentFunction(options as ComponentOptions<HTMLElementTagNameMap[K]>, children);

	return element;
}

tizi.Fragment = Fragment;
