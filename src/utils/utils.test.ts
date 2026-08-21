import { strongMatch, sanitizeString } from "./utils";


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
        const noSpecialChars = 'aceiouxyz';
        const hasSpecialChars = 'àçéïôüxyz';
  
        expect(strongMatch(noSpecialChars, hasSpecialChars)).toBeTruthy();
        expect(strongMatch(hasSpecialChars, noSpecialChars)).toBeTruthy();
    });

    it('false for banned terms; case insensitive', () => {
        const bannedTerms = ['foo', '(Bar)', 'two words'];
        const searchTerm = 'match me';
        const textBody1 = 'bad string despite match me foo';
        const textBody2 = 'bad string despite match me (bar)';
        const textBody3 = 'good string match me bar';   // bar not in brackets
        const textBody4 = 'bad string despite match me with two words banned phrase';
  
        expect(strongMatch(textBody1, searchTerm, bannedTerms)).toBeFalsy();
        expect(strongMatch(textBody2, searchTerm, bannedTerms)).toBeFalsy();
        expect(strongMatch(textBody3, searchTerm, bannedTerms)).toBeTruthy();
        expect(strongMatch(textBody4, searchTerm, bannedTerms)).toBeFalsy();
    });

    it('ignores certain punctuation', () => {
        const searchTerm1 = 'hyphenated-word';
        const textBody1 = 'hyphenatedword';

        const searchTerm2 = 'apos\'trophe';
        const textBody2 = 'apostrophe'

        const searchTerm3 = 'The Eagles Are Coming!';
        const textBody3 = 'The Eagles Are Coming';

        expect(strongMatch(textBody1, searchTerm1)).toBeTruthy();
        expect(strongMatch(textBody2, searchTerm2)).toBeTruthy();
        expect(strongMatch(textBody3, searchTerm3)).toBeTruthy();
    })

    it('matches split card names using only the first half', () => {
        const searchTerm = 'Fire // Ice';
        const textBody = 'Fire';

        expect(strongMatch(textBody, searchTerm)).toBeTruthy();
    });

});

describe('sanitizeString', () => {

    it('takes only the first half of a split card name', () => {
        expect(sanitizeString('Fire // Ice')).toBe('fire');
    });

    it('discards everything after the first "//", however many there are', () => {
        expect(sanitizeString('Who // What // When // Where // Why')).toBe('who');
    });

    it('does not collapse "//" into the surrounding words as if it were regular punctuation', () => {
        expect(sanitizeString('Fire // Ice')).not.toBe('fire ice');
    });

    it('leaves a lone slash untouched (only a double slash triggers split-card handling)', () => {
        expect(sanitizeString('Wear / Tear')).toBe('wear / tear');
    });

    it('strips common punctuation', () => {
        expect(sanitizeString('The Eagles Are Coming!')).toBe('the eagles are coming');
        expect(sanitizeString('Will you find it?')).toBe('will you find it');
        expect(sanitizeString('Kongming, "Sleeping Dragon"')).toBe('kongming sleeping dragon');
    });

});