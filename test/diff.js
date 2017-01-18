import { diff } from '../src/lib/diff';
import { expect } from 'chai';

describe('diff', () => {
    it('should return add when array is pushed', () => {
        let a = [1];
        let b = [1, 2];
        expect(diff(a, b)).to.deep.equal([[1, b, 1, 1]]);
    });

    it('should return add when array is spliced', () => {
        let a = [1, 2];
        let b = [1];
        let c = [1, 2, 3];
        let d = [1, 3];
        expect(diff(a, b)).to.deep.equal([[-1, a, 1, 1]]);
        expect(diff(c, d)).to.deep.equal([[-1, c, 1, 1]]);
    });

    it('should return mixed when arrays are different', () => {
        let a = [1, 2];
        let b = [3];
        let c = [1, 2, 3, 4, 5];
        let d = [3, 6, 5];
        expect(diff(a, b)).to.deep.equal([[-1, a, 0, 1], [+1, b, 0, 0]]);
        expect(diff(c, d)).to.deep.equal([[-1, c, 0, 1], [-1, c, 3, 4], [1, d, 1, 2]]);
    });
})
