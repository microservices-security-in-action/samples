/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(null, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/common/locales/shi", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n));
        if (i === 0 || n === 1)
            return 1;
        if (n === Math.floor(n) && n >= 2 && n <= 10)
            return 3;
        return 5;
    }
    exports.default = [
        'shi',
        [['ⵜⵉⴼⴰⵡⵜ', 'ⵜⴰⴷⴳⴳⵯⴰⵜ'], u, u],
        u,
        [
            ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            [
                'ⴰⵙⴰ', 'ⴰⵢⵏ', 'ⴰⵙⵉ', 'ⴰⴽⵕ', 'ⴰⴽⵡ', 'ⴰⵙⵉⵎ',
                'ⴰⵙⵉⴹ'
            ],
            [
                'ⴰⵙⴰⵎⴰⵙ', 'ⴰⵢⵏⴰⵙ', 'ⴰⵙⵉⵏⴰⵙ', 'ⴰⴽⵕⴰⵙ',
                'ⴰⴽⵡⴰⵙ', 'ⵙⵉⵎⵡⴰⵙ', 'ⴰⵙⵉⴹⵢⴰⵙ'
            ],
            [
                'ⴰⵙⴰ', 'ⴰⵢⵏ', 'ⴰⵙⵉ', 'ⴰⴽⵕ', 'ⴰⴽⵡ', 'ⴰⵙⵉⵎ',
                'ⴰⵙⵉⴹ'
            ]
        ],
        u,
        [
            ['ⵉ', 'ⴱ', 'ⵎ', 'ⵉ', 'ⵎ', 'ⵢ', 'ⵢ', 'ⵖ', 'ⵛ', 'ⴽ', 'ⵏ', 'ⴷ'],
            [
                'ⵉⵏⵏ', 'ⴱⵕⴰ', 'ⵎⴰⵕ', 'ⵉⴱⵔ', 'ⵎⴰⵢ', 'ⵢⵓⵏ', 'ⵢⵓⵍ',
                'ⵖⵓⵛ', 'ⵛⵓⵜ', 'ⴽⵜⵓ', 'ⵏⵓⵡ', 'ⴷⵓⵊ'
            ],
            [
                'ⵉⵏⵏⴰⵢⵔ', 'ⴱⵕⴰⵢⵕ', 'ⵎⴰⵕⵚ', 'ⵉⴱⵔⵉⵔ', 'ⵎⴰⵢⵢⵓ',
                'ⵢⵓⵏⵢⵓ', 'ⵢⵓⵍⵢⵓⵣ', 'ⵖⵓⵛⵜ', 'ⵛⵓⵜⴰⵏⴱⵉⵔ',
                'ⴽⵜⵓⴱⵔ', 'ⵏⵓⵡⴰⵏⴱⵉⵔ', 'ⴷⵓⵊⴰⵏⴱⵉⵔ'
            ]
        ],
        u,
        [
            ['ⴷⴰⵄ', 'ⴷⴼⵄ'], u,
            ['ⴷⴰⵜ ⵏ ⵄⵉⵙⴰ', 'ⴷⴼⴼⵉⵔ ⵏ ⵄⵉⵙⴰ']
        ],
        1,
        [6, 0],
        ['d/M/y', 'd MMM, y', 'd MMMM y', 'EEEE d MMMM y'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
        ['{1} {0}', u, u, u],
        [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0%', '#,##0.00¤', '#E0'],
        'MAD',
        'MAD',
        'ⴰⴷⵔⵉⵎ ⵏ ⵍⵎⵖⵔⵉⴱ',
        { 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$'] },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2xvY2FsZXMvc2hpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgseUNBQXlDO0lBQ3pDLCtDQUErQztJQUUvQyxJQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7SUFFcEIsU0FBUyxNQUFNLENBQUMsQ0FBUztRQUN2QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2RCxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBZTtRQUNiLEtBQUs7UUFDTCxDQUFDLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDbkM7Z0JBQ0UsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNO2dCQUN6QyxNQUFNO2FBQ1A7WUFDRDtnQkFDRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPO2dCQUNwQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVM7YUFDN0I7WUFDRDtnQkFDRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU07Z0JBQ3pDLE1BQU07YUFDUDtTQUNGO1FBQ0QsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUM1RDtnQkFDRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO2dCQUMvQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSzthQUNsQztZQUNEO2dCQUNFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPO2dCQUMzQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVO2dCQUNyQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVU7YUFDaEM7U0FDRjtRQUNELENBQUM7UUFDRDtZQUNFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDakIsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDO1NBQy9CO1FBQ0QsQ0FBQztRQUNELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDO1FBQ2xELENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsZUFBZSxDQUFDO1FBQ3BELENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUM7UUFDOUQsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUM7UUFDM0MsS0FBSztRQUNMLEtBQUs7UUFDTCxnQkFBZ0I7UUFDaEIsRUFBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFDO1FBQzFDLE1BQU07S0FDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuLy8gU2VlIGFuZ3VsYXIvdG9vbHMvZ3VscC10YXNrcy9jbGRyL2V4dHJhY3QuanNcblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBpID0gTWF0aC5mbG9vcihNYXRoLmFicyhuKSk7XG4gIGlmIChpID09PSAwIHx8IG4gPT09IDEpIHJldHVybiAxO1xuICBpZiAobiA9PT0gTWF0aC5mbG9vcihuKSAmJiBuID49IDIgJiYgbiA8PSAxMCkgcmV0dXJuIDM7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICdzaGknLFxuICBbWyfitZzitYnitLzitLDitaHitZwnLCAn4rWc4rSw4rS34rSz4rSz4rWv4rSw4rWcJ10sIHUsIHVdLFxuICB1LFxuICBbXG4gICAgWydTJywgJ00nLCAnVCcsICdXJywgJ1QnLCAnRicsICdTJ10sXG4gICAgW1xuICAgICAgJ+K0sOK1meK0sCcsICfitLDitaLitY8nLCAn4rSw4rWZ4rWJJywgJ+K0sOK0veK1lScsICfitLDitL3itaEnLCAn4rSw4rWZ4rWJ4rWOJyxcbiAgICAgICfitLDitZnitYnitLknXG4gICAgXSxcbiAgICBbXG4gICAgICAn4rSw4rWZ4rSw4rWO4rSw4rWZJywgJ+K0sOK1ouK1j+K0sOK1mScsICfitLDitZnitYnitY/itLDitZknLCAn4rSw4rS94rWV4rSw4rWZJyxcbiAgICAgICfitLDitL3itaHitLDitZknLCAn4rWZ4rWJ4rWO4rWh4rSw4rWZJywgJ+K0sOK1meK1ieK0ueK1ouK0sOK1mSdcbiAgICBdLFxuICAgIFtcbiAgICAgICfitLDitZnitLAnLCAn4rSw4rWi4rWPJywgJ+K0sOK1meK1iScsICfitLDitL3itZUnLCAn4rSw4rS94rWhJywgJ+K0sOK1meK1ieK1jicsXG4gICAgICAn4rSw4rWZ4rWJ4rS5J1xuICAgIF1cbiAgXSxcbiAgdSxcbiAgW1xuICAgIFsn4rWJJywgJ+K0sScsICfitY4nLCAn4rWJJywgJ+K1jicsICfitaInLCAn4rWiJywgJ+K1licsICfitZsnLCAn4rS9JywgJ+K1jycsICfitLcnXSxcbiAgICBbXG4gICAgICAn4rWJ4rWP4rWPJywgJ+K0seK1leK0sCcsICfitY7itLDitZUnLCAn4rWJ4rSx4rWUJywgJ+K1juK0sOK1oicsICfitaLitZPitY8nLCAn4rWi4rWT4rWNJyxcbiAgICAgICfitZbitZPitZsnLCAn4rWb4rWT4rWcJywgJ+K0veK1nOK1kycsICfitY/itZPitaEnLCAn4rS34rWT4rWKJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+K1ieK1j+K1j+K0sOK1ouK1lCcsICfitLHitZXitLDitaLitZUnLCAn4rWO4rSw4rWV4rWaJywgJ+K1ieK0seK1lOK1ieK1lCcsICfitY7itLDitaLitaLitZMnLFxuICAgICAgJ+K1ouK1k+K1j+K1ouK1kycsICfitaLitZPitY3itaLitZPitaMnLCAn4rWW4rWT4rWb4rWcJywgJ+K1m+K1k+K1nOK0sOK1j+K0seK1ieK1lCcsXG4gICAgICAn4rS94rWc4rWT4rSx4rWUJywgJ+K1j+K1k+K1oeK0sOK1j+K0seK1ieK1lCcsICfitLfitZPitYritLDitY/itLHitYnitZQnXG4gICAgXVxuICBdLFxuICB1LFxuICBbXG4gICAgWyfitLfitLDitYQnLCAn4rS34rS84rWEJ10sIHUsXG4gICAgWyfitLfitLDitZwg4rWPIOK1hOK1ieK1meK0sCcsICfitLfitLzitLzitYnitZQg4rWPIOK1hOK1ieK1meK0sCddXG4gIF0sXG4gIDEsXG4gIFs2LCAwXSxcbiAgWydkL00veScsICdkIE1NTSwgeScsICdkIE1NTU0geScsICdFRUVFIGQgTU1NTSB5J10sXG4gIFsnSEg6bW0nLCAnSEg6bW06c3MnLCAnSEg6bW06c3MgeicsICdISDptbTpzcyB6enp6J10sXG4gIFsnezF9IHswfScsIHUsIHUsIHVdLFxuICBbJywnLCAnwqAnLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAnTmFOJywgJzonXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzAlJywgJyMsIyMwLjAwwqQnLCAnI0UwJ10sXG4gICdNQUQnLFxuICAnTUFEJyxcbiAgJ+K0sOK0t+K1lOK1ieK1jiDitY8g4rWN4rWO4rWW4rWU4rWJ4rSxJyxcbiAgeydKUFknOiBbJ0pQwqUnLCAnwqUnXSwgJ1VTRCc6IFsnVVMkJywgJyQnXX0sXG4gIHBsdXJhbFxuXTtcbiJdfQ==