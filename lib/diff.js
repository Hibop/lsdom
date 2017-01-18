import logger from './logger';
/**
 * diff array
 * @param {Array} from
 * @param {Array} to
 * @return {Array} diff with [type, arr, start, end],
 *      type:1 -- add, type: -1 remove
 */
export const diff = (from, to) => {
    logger.group('diff', from, to);
    let i = 0;
    let totalFrom = from.length;
    let j = 0;
    let totalTo = to.length;

    let result = [];

    while (i < totalFrom && j < totalTo){
        if (from[i] === to[j]){
            i++;
            j++;
        } else {
            let k = from.indexOf(to[j]);
            if (k > i){
                result.push([-1, from, i, k - 1])
                i = k + 1;
                j++;
            } else {
                let l = to.indexOf(from[i]);
                if (l > j){
                    result.push([+1, to, j, l - 1]);
                    i++;
                    j = l + 1;
                } else {
                    break;
                }
            }
        }
    }

    if (i < totalFrom){
        result.push([-1, from, i, totalFrom - 1]);
    }

    if (j < totalTo){
        result.push([1, to, j, totalTo - 1]);
    }
    logger.groupEnd();
    return result;
}
