import { StringCleaner } from "./StringCleaner";


describe('StringCleaner', () => {

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

    it('selects segment in square brackets', () => {
        const input = 'foo [bar]';
        const expected = 'bar';

        const output: string = new StringCleaner(input)
            .selectSegmentInSquareBrackets()
            .get();

        expect(expected).toBe(output);
    });

    it('removes segment in square brackets', () => {
        const input = 'foo [bar]';
        const expected = 'foo ';

        const output: string = new StringCleaner(input)
            .removeSegmentInSquareBrackets()
            .get();

        expect(expected).toBe(output);
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