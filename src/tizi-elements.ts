import tizi, {
	ElementOptions,
	ElementRenderer,
	Renderable,
	RenderChildren,
	emptyObject,
} from './tizi';

function factory<K extends keyof HTMLElementTagNameMap> (tagName: K): ElementRenderer<K> {
	return function (options?: RenderChildren | ElementOptions, children?: RenderChildren): HTMLElementTagNameMap[K] {
		if (Object.prototype.toString.apply(options) !== '[object Object]') {
			children = options as RenderChildren;
			options = emptyObject;
		}

		if (!Array.isArray(children)) {
			children = [ children ] as Renderable[];
		}

		return tizi(tagName, options as ElementOptions, ...children);
	};
}

// TODO: all the elements
export const a = factory('a');
export const br = factory('br');
export const button = factory('button');
export const div = factory('div');
export const hr = factory('hr');
export const input = factory('input');
export const kbd = factory('kbd');
export const label = factory('label');
export const main = factory('main');
export const p = factory('p');
export const section = factory('section');
export const span = factory('span');
export const table = factory('table');
export const td = factory('td');
export const tr = factory('tr');
