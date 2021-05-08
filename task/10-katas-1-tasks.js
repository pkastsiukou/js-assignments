'use strict';

/**
 * Returns the array of 32 compass points and heading.
 * See details here:
 * https://en.wikipedia.org/wiki/Points_of_the_compass#32_cardinal_points
 *
 * @return {array}
 *
 * Example of return :
 *  [
 *     { abbreviation : 'N',     azimuth : 0.00 ,
 *     { abbreviation : 'NbE',   azimuth : 11.25 },
 *     { abbreviation : 'NNE',   azimuth : 22.50 },
 *       ...
 *     { abbreviation : 'NbW',   azimuth : 348.75 }
 *  ]
 */
function createCompassPoints() {
    const sides = ['N', 'E', 'S', 'W'];  // use array of cardinal directions only!
    const points = [];

    const symbolOne = (i) => sides[Math.floor(i / 8) % 4];
    const symbolTwo = (i) => sides[(Math.floor(((i + 8) / 16)) % 2 * 2) % 4] + sides[(Math.floor(i / 16) * 2 + 1) % 4];
    const symbolThree = (i) => symbolOne(i + 2) + symbolTwo(i);
    const symbolFour = (i) => {
        let name = '';
        if ((i % 8) === 1) {
            name += symbolOne(i);
        } else if ((i % 8) === 7) {
            name += symbolOne(i + 8);
        } else {
            name += symbolTwo(i + 1);
        }
        name += 'b';
        name += (i % 4 === 1) ? symbolOne(i + 8) : symbolOne(i);
        return name;
    }

    const getAbbreviation = (i) => {
        if (i % 8 === 0) {
            return symbolOne(i);
        }
        if (i % 4 === 0) {
            return symbolTwo(i);
        }
        if (i % 2 === 0) {
            return symbolThree(i);
        }
        return symbolFour(i);
    }

    for(let i = 0, az = 0; i < 32; i++, az += 11.25){
        const abbreviation = getAbbreviation(i);
        points.push({ abbreviation, azimuth: az });
    }

    return points;
}


/**
 * Expand the braces of the specified string.
 * See https://en.wikipedia.org/wiki/Bash_(Unix_shell)#Brace_expansion
 *
 * In the input string, balanced pairs of braces containing comma-separated substrings
 * represent alternations that specify multiple alternatives which are to appear at that position in the output.
 *
 * @param {string} str
 * @return {Iterable.<string>}
 *
 * NOTE: The order of output string does not matter.
 *
 * Example:
 *   '~/{Downloads,Pictures}/*.{jpg,gif,png}'  => '~/Downloads/*.jpg',
 *                                                '~/Downloads/*.gif'
 *                                                '~/Downloads/*.png',
 *                                                '~/Pictures/*.jpg',
 *                                                '~/Pictures/*.gif',
 *                                                '~/Pictures/*.png'
 *
 *   'It{{em,alic}iz,erat}e{d,}, please.'  => 'Itemized, please.',
 *                                            'Itemize, please.',
 *                                            'Italicized, please.',
 *                                            'Italicize, please.',
 *                                            'Iterated, please.',
 *                                            'Iterate, please.'
 *
 *   'thumbnail.{png,jp{e,}g}'  => 'thumbnail.png'
 *                                 'thumbnail.jpeg'
 *                                 'thumbnail.jpg'
 *
 *   'nothing to do' => 'nothing to do'
 */
function* expandBraces(str) {
    let items = [str];
    let isBracesLeft = true;
    while (isBracesLeft) {
        isBracesLeft = false;
        for (let i = 0; i < items.length; i++) {
            if (/{[^{}]+}/g.test(items[i])) {
                isBracesLeft = true;
                const inBracesContent = items[i].match(/{([^{}]+)}/);
                const substitutes = inBracesContent[1].split(',');
                const newItems = substitutes.map(substitute => items[i].replace(inBracesContent[0], substitute));
                items.splice(i, 1, ...newItems);
                items = items.filter((value, index, self) => self.indexOf(value) === index);
            }
        }
    }

    for (let i = 0; i < items.length; i++) {
        yield items[i];
    }
}


/**
 * Returns the ZigZag matrix
 *
 * The fundamental idea in the JPEG compression algorithm is to sort coefficient of given image by zigzag path and encode it.
 * In this task you are asked to implement a simple method to create a zigzag square matrix.
 * See details at https://en.wikipedia.org/wiki/JPEG#Entropy_coding
 * and zigzag path here: https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/JPEG_ZigZag.svg/220px-JPEG_ZigZag.svg.png
 *
 * @param {number} n - matrix dimension
 * @return {array}  n x n array of zigzag path
 *
 * @example
 *   1  => [[0]]
 *
 *   2  => [[ 0, 1 ],
 *          [ 2, 3 ]]
 *
 *         [[ 0, 1, 5 ],
 *   3  =>  [ 2, 4, 6 ],
 *          [ 3, 7, 8 ]]
 *
 *         [[ 0, 1, 5, 6 ],
 *   4 =>   [ 2, 4, 7,12 ],
 *          [ 3, 8,11,13 ],
 *          [ 9,10,14,15 ]]
 *
 */
function getZigZagMatrix(n) {
    const arr = new Array(n).fill([]).map(() => new Array(n).fill(0));

    const getDiagonals = () => {
        const d = [];
        let num = 0;
        let index = 0;
        while (index < n) {
            d.push(new Array(index + 1).fill(0).map(() => num++));
            index++
        }
        index--;
        while (index > 0) {
            d.push(new Array(index).fill(0).map(() => num++));
            index--;
        }
        return d;
    }

    const fillDiagonal = (startIndex, items) => {
        for (let i = 0; i < items.length; i++) {
            arr[items.length - i  + startIndex - 1][i + startIndex] = items[i];
        }
    }

    const diagonals = getDiagonals();

    let startIndex = 0;
    let isUp = true;
    for (let i = 0; i < diagonals.length; i++) {
        const d = i % 2 === 0 ? diagonals[i] : [].concat(diagonals[i]).reverse();
        if (diagonals[i].length >= n) { // we have reached main diagonal
            isUp = false;
        }
        fillDiagonal(startIndex, d);
        if (!isUp) {
            startIndex++;
        }
    }

    return arr;
}


/**
 * Returns true if specified subset of dominoes can be placed in a row accroding to the game rules.
 * Dominoes details see at: https://en.wikipedia.org/wiki/Dominoes
 *
 * Each domino tile presented as an array [x,y] of tile value.
 * For example, the subset [1, 1], [2, 2], [1, 2] can be arranged in a row (as [1, 1] followed by [1, 2] followed by [2, 2]),
 * while the subset [1, 1], [0, 3], [1, 4] can not be arranged in one row.
 * NOTE that as in usual dominoes playing any pair [i, j] can also be treated as [j, i].
 *
 * @params {array} dominoes
 * @return {bool}
 *
 * @example
 *
 * [[0,1],  [1,1]] => true
 * [[1,1], [2,2], [1,5], [5,6], [6,3]] => false
 * [[1,3], [2,3], [1,4], [2,4], [1,5], [2,5]]  => true
 * [[0,0], [0,1], [1,1], [0,2], [1,2], [2,2], [0,3], [1,3], [2,3], [3,3]] => false
 *
 */
function canDominoesMakeRow(dominoes) {
    throw new Error('Not implemented');
}


/**
 * Returns the string expression of the specified ordered list of integers.
 *
 * A format for expressing an ordered list of integers is to use a comma separated list of either:
 *   - individual integers
 *   - or a range of integers denoted by the starting integer separated from the end integer in the range by a dash, '-'.
 *     (The range includes all integers in the interval including both endpoints)
 *     The range syntax is to be used only for, and for every range that expands to more than two values.
 *
 * @params {array} nums
 * @return {bool}
 *
 * @example
 *
 * [ 0, 1, 2, 3, 4, 5 ]   => '0-5'
 * [ 1, 4, 5 ]            => '1,4,5'
 * [ 0, 1, 2, 5, 7, 8, 9] => '0-2,5,7-9'
 * [ 1, 2, 4, 5]          => '1,2,4,5'
 */
function extractRanges(nums) {
    throw new Error('Not implemented');
}

module.exports = {
    createCompassPoints : createCompassPoints,
    expandBraces : expandBraces,
    getZigZagMatrix : getZigZagMatrix,
    canDominoesMakeRow : canDominoesMakeRow,
    extractRanges : extractRanges
};
