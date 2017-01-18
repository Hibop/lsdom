function noop(){}

let logger = console;
if (typeof process !== 'undefined'){
    logger = {
        group: noop,
        groupEnd: noop,
        log: noop
    }
}

export default logger;
