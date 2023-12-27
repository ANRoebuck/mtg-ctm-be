import { strongMatch } from './AbstractPriceGetter';

describe('strongMatch', () => {

    it('true for matching strings', () => {
        const searchTerm = 'foo';
        const textBody = 'foo';

        expect(strongMatch(textBody, searchTerm)).toBeTruthy();
    });

    it('true when bounded by spaces', () => {
        const searchTerm = 'foo';
        const textBody = ' foo ';

        expect(strongMatch(textBody, searchTerm)).toBeTruthy();
    });

    it('true if first word', () => {
        const searchTerm = 'ring';
        const textBody = 'ring me tomorrow';

        expect(strongMatch(textBody, searchTerm)).toBeTruthy();
    });
    
    it('true if last word', () => {
        const searchTerm = 'ring';
        const textBody = 'give me a ring';

        expect(strongMatch(textBody, searchTerm)).toBeTruthy();
    });

    it('false for a part-word', () => {
        const searchTerm = 'ring';
        const textBody = 'the phone is ringing loudly';
  
        expect(strongMatch(textBody, searchTerm)).toBeFalsy();
    });

    it('true for phrases (space-separated)', () => {
        const searchTerm = 'see you';
        const textBody = 'Ill see you there';
  
        expect(strongMatch(textBody, searchTerm)).toBeTruthy();
    });

    it('case insensitive', () => {
        const searchTerm = 'sarcasm';
        const textBody = 'sArCaSm DeTeCtEd';
  
        expect(strongMatch(textBody, searchTerm)).toBeTruthy();
    });

    it('ignores new lines in both searchTerm and textBody', () => {
        const searchTerm = 'new \nline cinema';
        const textBody = 'new line \ncinema';
  
        expect(strongMatch(textBody, searchTerm)).toBeTruthy();
    });

    it('ignores special chars and diacritics in both searchTerm and textBody', () => {
        const noSpecialChars = 'aceiou';
        const hasSpecialChars = 'àçéïôü';
  
        expect(strongMatch(noSpecialChars, hasSpecialChars)).toBeTruthy();
        expect(strongMatch(hasSpecialChars, noSpecialChars)).toBeTruthy();
    });

    it('false for banned terms; case insensitive', () => {
        const bannedTerms = ['foo', 'bar'];
        const searchTerm = 'match me';
        const textBody1 = 'bad string despite match me foo';
        const textBody2 = 'bad string despite match me BAR';
  
        expect(strongMatch(textBody1, searchTerm, bannedTerms)).toBeFalsy();
        expect(strongMatch(textBody2, searchTerm, bannedTerms)).toBeFalsy();
    });

});