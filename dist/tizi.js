var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
export const emptyObject = Object.freeze(Object.create(null));
export const RefElementSymbol = Symbol('RefElementSymbol');
export const RefControllerSymbol = Symbol('RefControllerSymbol');
const RefPrototype = Object.create(null, {
    clone: {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function (ref) {
            this[RefElementSymbol] = ref[RefElementSymbol];
        },
    },
});
export function createRef() {
    const ref = Object.create(RefPrototype);
    return new Proxy(ref, {
        get(target, key) {
            if (key === RefElementSymbol || key === 'element') {
                return target[RefElementSymbol];
            }
            else {
                let value = target[RefElementSymbol][key];
                if (typeof value === 'function') {
                    value = value.bind(target[RefElementSymbol]);
                }
                return value;
            }
        },
        set(target, key, value) {
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
const ComponentRefPrototype = Object.create(null, {
    clone: {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function (ref) {
            RefPrototype.clone(ref);
            this[RefControllerSymbol] = ref[RefControllerSymbol];
        },
    },
    control: {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function control(element, controller) {
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
export function createComponentRef() {
    const ref = Object.create(ComponentRefPrototype);
    return new Proxy(ref, {
        get(target, property) {
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
        set(target, property, value) {
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
    });
}
function appendChild(parent, child) {
    if (!child) {
        return;
    }
    if (typeof child === 'string') {
        child = document.createTextNode(child);
    }
    parent.appendChild(child);
}
export function Fragment(_, children) {
    const fragment = document.createDocumentFragment();
    if (children.length) {
        children.forEach(appendChild.bind(null, fragment));
    }
    return fragment;
}
const eventHandlerRegex = /^on[A-Z][a-zA-Z]+$/;
const PREFIX_LENGTH = 2;
function applyOptions(element, options) {
    Object.keys(options).forEach(function (key) {
        const value = options[key];
        if (eventHandlerRegex.test(key)) {
            const [eventListener, eventListenerOptions] = (Array.isArray(value) ?
                value :
                [value]);
            const eventName = key.slice(PREFIX_LENGTH).toLowerCase();
            element.addEventListener(eventName, eventListener, eventListenerOptions);
        }
        else if (element.setAttribute && typeof value === 'string') {
            element.setAttribute(key, value);
        }
        else {
            element[key] = value;
        }
    });
}
function isChild(child) {
    const childType = typeof child;
    if (childType === 'string' || child instanceof Node || Array.isArray(child)) {
        return true;
    }
    return false;
}
export function render(element, options, children, controller) {
    if (typeof element === 'string') {
        element = document.createTextNode(element);
    }
    if (isChild(options)) {
        children = options;
        options = emptyObject;
    }
    const _a = options, { ref } = _a, elementOptions = __rest(_a, ["ref"]);
    if (elementOptions && element.nodeType === element.ELEMENT_NODE) {
        applyOptions(element, elementOptions);
    }
    if (ref && element.nodeType === element.ELEMENT_NODE) {
        if ('control' in ref) {
            ref.control(element, controller);
        }
        else {
            ref[RefElementSymbol] = element;
        }
    }
    if (children) {
        if (!Array.isArray(children)) {
            children = [children];
        }
        children.forEach(appendChild.bind(null, element));
    }
    return element;
}
export default function tizi(tagName, options, ...children) {
    const _a = (options || emptyObject), { controller } = _a, elementOptions = __rest(_a, ["controller"]);
    let element;
    if (typeof tagName === 'string') {
        element = document.createElement(tagName);
        render(element, elementOptions, children, controller);
    }
    else {
        element = tagName(options, children);
    }
    return element;
}
tizi.Fragment = Fragment;
