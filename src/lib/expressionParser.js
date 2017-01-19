/**
 * parse an expression to function
 * @param {expression} expression - expression
 */
export const parse = (expression) => {
    // [TODO] handle unchanged expressions
    return {
        expression: expression,
        update: new Function('', 'with(this){ return ' + expression + '}')
    }
};

/**
 * parse string with {expression}
 */
export const parseInterpolation = (str) => {
    let i = 0;
    let j = 0;
    let segs = [];
    let hasInterpolation = false;
    while (j < str.length){
        if (str[j] === '{'){
            hasInterpolation = true;
            if (j > i){
                segs.push(str.slice(i, j));
            }
            i = j + 1;
        } else if (str[j] === '}'){
            if (j > i){
                segs.push(parse(str.slice(i, j)));
            }
            i = j + 1;
        }
        j++;
    }

    if (j > i){
        segs.push(str.slice(i, j));
    }

    if (hasInterpolation){
        let keys = new Set();

        return {
            expression: segs.reduce((pre, curr) => {
                if (typeof curr !== 'string'){
                    return pre + ' ' + curr.expression
                }
                return pre + ' ' + curr;
            }, ''),

            update(){
                // if only 1 interpolation, this prevent returning string
                // such as "true" "false"
                if (segs.length === 1 && hasInterpolation) {
                    return segs[0].update.call(this);
                } else {
                    return segs.reduce((pre, curr) => {
                        if (typeof curr !== 'string'){
                            return pre + curr.update.call(this);
                        }
                        return pre + curr;
                    }, '');
                }
            }
        }
    } else {
        return str;
    }
}
