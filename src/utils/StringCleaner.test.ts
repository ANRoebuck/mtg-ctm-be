import StringCleaner from "./StringCleaner";
// import { readFileSync, writeFileSync } from 'fs';


describe('StringCleaner', () => {

    it('removes inner html', () => {
        const input = 'foo <div>bar</div> baz';
        const expected = 'foo  baz';

        const output: string = new StringCleaner(input)
            .removeInnerHtml()
            .get();

        expect(output).toBe(expected);
    });

    it('removes line break html tags', () => {
        const input = 'foo <br> bar';
        const expected = 'foo  bar';

        const output: string = new StringCleaner(input)
            .removeLineBreakHtml()
            .get();

        expect(output).toBe(expected);
    });

    it('removes new line characters', () => {
        const input = '\nfoo\n';
        const expected = 'foo';

        const output: string = new StringCleaner(input)
            .removeNewLines()
            .get();

        expect(output).toBe(expected);
    });

    it('removes non-digit characters', () => {
        const input = '£ 123.45';
        const expected = '12345';

        const output: string = new StringCleaner(input)
            .removeNonDigits()
            .get();

        expect(output).toBe(expected);
    });

    it('removes query params from url string', () => {
        const input = 'https://www.axionnow.com//products/mtg-singles-rvr-steamvents-412?_pos=2&_sid=d388dd3e9&_ss=r&_fid=4328b684d&variant=47557758058813';
        const expected = 'https://www.axionnow.com//products/mtg-singles-rvr-steamvents-412';

        const output: string = new StringCleaner(input)
            .removeQueryParams()
            .get();

        expect(output).toBe(expected);
    });

    it('removes segment in square brackets', () => {
        const input = 'foo [bar]';
        const expected = 'foo ';

        const output: string = new StringCleaner(input)
            .removeSegmentInSquareBrackets()
            .get();

        expect(expected).toBe(output);
    });

    it('removes trailing comma', () => {
        const input = 'foo bar,';
        const expected = 'foo bar';

        const output: string = new StringCleaner(input)
            .removeTrailingComma()
            .get();

        expect(expected).toBe(output);
    });  

    it('removes trailing FOIL', () => {
        const input = 'foo Foil';
        const expected = 'foo ';

        const output: string = new StringCleaner(input)
            .removeTrailingFOIL()
            .get();

        expect(expected).toBe(output);
    });

    it('removes weird brackets', () => {
        const input = '【foo】《bar》 ■baz■ ◆bat◆';
        const expected = ' foo  bar   baz   bat ';

        const output: string = new StringCleaner(input)
            .removeWeirdBrackets()
            .get();

        expect(expected).toBe(output);
    });

    it('selects segment in square brackets', () => {
        const input = 'foo [bar]';
        const expected = 'bar';

        const output: string = new StringCleaner(input)
            .selectSegmentInSquareBrackets()
            .get();

        expect(expected).toBe(output);
    });

    it('splits on symbol and selects section', () => {
        const input = 'foo | bar | baz';
        const expected = 'foo ';

        const output: string = new StringCleaner(input)
            .splitOnSymbolAndSelectSection('|', 0)
            .get();

        expect(expected).toBe(output);


        const input2 = 'tic / tac / toe';
        const expected2 = ' tac ';

        const output2: string = new StringCleaner(input2)
            .splitOnSymbolAndSelectSection('/', 1)
            .get();

        expect(expected2).toBe(output2);
    });

    it('trims leading and trailing whitespace', () => {
        const input = '   foo   ';
        const expected = 'foo';

        const output: string = new StringCleaner(input)
            .trimWhitespace()
            .get();

        expect(expected).toBe(output);
    });

});

describe('chaining methods', () => {
    it('asdlfkhjas', () => {
        const input = '   foo   [bar]   ';
        const expected = 'foo';

        const output: string = new StringCleaner(input)
            .removeSegmentInSquareBrackets()
            .trimWhitespace()
            .get();

        expect(expected).toBe(output);
    });
});

// describe('foo', () => {
//     it('bar', () => {
//         const saveToFile = (contents: string) => {
//             try {
//                 writeFileSync('./src/utils/bar.txt', contents);
//             } catch (e) {
//                 console.log(e);
//             }
//         }
        
//         const readTxt = (): string => {
//             let htmlString: string = '';
//             try {
//                 const file = `./src/utils/foo.txt`;
//                 htmlString = readFileSync(file, 'utf8');
//             } catch(e) {
//                 console.log(e);
//             }
//             return htmlString;
//         };

//         const unsorted = readTxt();
//         const sorted = unsorted.split('\n').sort();
//         const unique = [...new Set(sorted)];

//         const final = unique.join('\n');
        
//         saveToFile(final);
//     });
// });
