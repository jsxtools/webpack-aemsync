/**
* @callback HasOwnProperty - Return whether an object has a property with the specified name
* @param {*} value - Property name
* @return {Boolean}
*/

/** @type {HasOwnProperty} */
const hasOwnProperty = Function.call.bind(Object.hasOwnProperty);

export default hasOwnProperty;
