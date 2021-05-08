'use strict';

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
    this.width = width;
    this.height = height;

    Rectangle.prototype.getArea = function () {
       return width * height;
    };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
    return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
    return Object.setPrototypeOf(JSON.parse(json), proto);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class Selector {
    constructor(items) {
        this.items = items || [];
        this.touched = {
            element: false,
            id: false,
            pseudoElement: false,
        };
        this.order = {
            element: 1,
            id: 2,
            class: 3,
            attr: 4,
            pseudoClass: 5,
            pseudoElement: 6,
        };
    }

    checkOrder(orderType) {
        if (this.items.find(item => this.order[item.type] > this.order[orderType])) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
        }
    }

    element(value) {
        if (this.touched.element) {
            throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
        }
        this.checkOrder('element');

        this.touched.element = true;
        this.items.push({ type: 'element', value });
        return this;
    }

    id(value) {
        if (this.touched.id) {
            throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
        }
        this.checkOrder('id');

        this.touched.id = true;
        this.items.push({ type: 'id', value: `#${value}` });
        return this;
    }

    class(value) {
        this.checkOrder('class');

        this.items.push({ type: 'class', value: `.${value}` });
        return this;
    }

    attr(value) {
        this.checkOrder('attr');

        this.items.push({ type: 'attr', value: `[${value}]` });
        return this;
    }

    pseudoClass(value) {
        this.checkOrder('pseudoClass');

        this.items.push({ type: 'pseudoClass', value: `:${value}` });
        return this;
    }

    pseudoElement(value) {
        if (this.touched.pseudoElement) {
            throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
        }
        this.checkOrder('pseudoElement');

        this.touched.pseudoElement = true;
        this.items.push({ type: 'pseudoElement', value: `::${value}` });
        return this;
    }

    stringify () {
        return [].concat(this.items).map(item => item.value).join('');
    }
}

const cssSelectorBuilder = {
    element: function(value) {
        return (new Selector()).element(value);
    },

    id: function(value) {
        return (new Selector()).id(value);
    },

    class: function(value) {
        return (new Selector()).class(value);
    },

    attr: function(value) {
        return (new Selector()).attr(value);
    },

    pseudoClass: function(value) {
        return (new Selector()).pseudoClass(value);
    },

    pseudoElement: function(value) {
        return (new Selector()).pseudoElement(value);
    },

    stringify: function () {
        return (new Selector()).stringify();
    },

    combine: function(selector1, combinator, selector2) {
        return new Selector([].concat(selector1.items, [{ type: 'combinator', value: ` ${combinator} `}], selector2.items));
    },
};


module.exports = {
    Rectangle: Rectangle,
    getJSON: getJSON,
    fromJSON: fromJSON,
    cssSelectorBuilder: cssSelectorBuilder
};
