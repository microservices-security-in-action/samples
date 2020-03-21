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
        define("@angular/common/locales/ga-GB", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        if (n === 1)
            return 1;
        if (n === 2)
            return 2;
        if (n === Math.floor(n) && n >= 3 && n <= 6)
            return 3;
        if (n === Math.floor(n) && n >= 7 && n <= 10)
            return 4;
        return 5;
    }
    exports.default = [
        'ga-GB',
        [['r.n.', 'i.n.'], u, u],
        u,
        [
            ['D', 'L', 'M', 'C', 'D', 'A', 'S'],
            ['Domh', 'Luan', 'Máirt', 'Céad', 'Déar', 'Aoine', 'Sath'],
            [
                'Dé Domhnaigh', 'Dé Luain', 'Dé Máirt', 'Dé Céadaoin', 'Déardaoin', 'Dé hAoine',
                'Dé Sathairn'
            ],
            ['Do', 'Lu', 'Má', 'Cé', 'Dé', 'Ao', 'Sa']
        ],
        u,
        [
            ['E', 'F', 'M', 'A', 'B', 'M', 'I', 'L', 'M', 'D', 'S', 'N'],
            [
                'Ean', 'Feabh', 'Márta', 'Aib', 'Beal', 'Meith', 'Iúil', 'Lún', 'MFómh', 'DFómh', 'Samh',
                'Noll'
            ],
            [
                'Eanáir', 'Feabhra', 'Márta', 'Aibreán', 'Bealtaine', 'Meitheamh', 'Iúil', 'Lúnasa',
                'Meán Fómhair', 'Deireadh Fómhair', 'Samhain', 'Nollaig'
            ]
        ],
        u,
        [['RC', 'AD'], u, ['Roimh Chríost', 'Anno Domini']],
        1,
        [6, 0],
        ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
        ['{1} {0}', u, u, u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
        'GBP',
        '£',
        'Punt Steirling',
        { 'THB': ['฿'], 'TWD': ['NT$'], 'XXX': [] },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2EtR0IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9nYS1HQi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2RCxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBZTtRQUNiLE9BQU87UUFDUCxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDbkMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUM7WUFDMUQ7Z0JBQ0UsY0FBYyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxXQUFXO2dCQUMvRSxhQUFhO2FBQ2Q7WUFDRCxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztTQUMzQztRQUNELENBQUM7UUFDRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDNUQ7Z0JBQ0UsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU07Z0JBQ3hGLE1BQU07YUFDUDtZQUNEO2dCQUNFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxRQUFRO2dCQUNuRixjQUFjLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLFNBQVM7YUFDekQ7U0FDRjtRQUNELENBQUM7UUFDRCxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBQ0QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUM7UUFDbkQsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUM7UUFDcEQsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUM5RCxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQztRQUMzQyxLQUFLO1FBQ0wsR0FBRztRQUNILGdCQUFnQjtRQUNoQixFQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUM7UUFDekMsTUFBTTtLQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRISVMgQ09ERSBJUyBHRU5FUkFURUQgLSBETyBOT1QgTU9ESUZZXG4vLyBTZWUgYW5ndWxhci90b29scy9ndWxwLXRhc2tzL2NsZHIvZXh0cmFjdC5qc1xuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKG4gPT09IDEpIHJldHVybiAxO1xuICBpZiAobiA9PT0gMikgcmV0dXJuIDI7XG4gIGlmIChuID09PSBNYXRoLmZsb29yKG4pICYmIG4gPj0gMyAmJiBuIDw9IDYpIHJldHVybiAzO1xuICBpZiAobiA9PT0gTWF0aC5mbG9vcihuKSAmJiBuID49IDcgJiYgbiA8PSAxMCkgcmV0dXJuIDQ7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICdnYS1HQicsXG4gIFtbJ3Iubi4nLCAnaS5uLiddLCB1LCB1XSxcbiAgdSxcbiAgW1xuICAgIFsnRCcsICdMJywgJ00nLCAnQycsICdEJywgJ0EnLCAnUyddLFxuICAgIFsnRG9taCcsICdMdWFuJywgJ03DoWlydCcsICdDw6lhZCcsICdEw6lhcicsICdBb2luZScsICdTYXRoJ10sXG4gICAgW1xuICAgICAgJ0TDqSBEb21obmFpZ2gnLCAnRMOpIEx1YWluJywgJ0TDqSBNw6FpcnQnLCAnRMOpIEPDqWFkYW9pbicsICdEw6lhcmRhb2luJywgJ0TDqSBoQW9pbmUnLFxuICAgICAgJ0TDqSBTYXRoYWlybidcbiAgICBdLFxuICAgIFsnRG8nLCAnTHUnLCAnTcOhJywgJ0PDqScsICdEw6knLCAnQW8nLCAnU2EnXVxuICBdLFxuICB1LFxuICBbXG4gICAgWydFJywgJ0YnLCAnTScsICdBJywgJ0InLCAnTScsICdJJywgJ0wnLCAnTScsICdEJywgJ1MnLCAnTiddLFxuICAgIFtcbiAgICAgICdFYW4nLCAnRmVhYmgnLCAnTcOhcnRhJywgJ0FpYicsICdCZWFsJywgJ01laXRoJywgJ0nDumlsJywgJ0zDum4nLCAnTUbDs21oJywgJ0RGw7NtaCcsICdTYW1oJyxcbiAgICAgICdOb2xsJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ0VhbsOhaXInLCAnRmVhYmhyYScsICdNw6FydGEnLCAnQWlicmXDoW4nLCAnQmVhbHRhaW5lJywgJ01laXRoZWFtaCcsICdJw7ppbCcsICdMw7puYXNhJyxcbiAgICAgICdNZcOhbiBGw7NtaGFpcicsICdEZWlyZWFkaCBGw7NtaGFpcicsICdTYW1oYWluJywgJ05vbGxhaWcnXG4gICAgXVxuICBdLFxuICB1LFxuICBbWydSQycsICdBRCddLCB1LCBbJ1JvaW1oIENocsOtb3N0JywgJ0Fubm8gRG9taW5pJ11dLFxuICAxLFxuICBbNiwgMF0sXG4gIFsnZGQvTU0veScsICdkIE1NTSB5JywgJ2QgTU1NTSB5JywgJ0VFRUUgZCBNTU1NIHknXSxcbiAgWydISDptbScsICdISDptbTpzcycsICdISDptbTpzcyB6JywgJ0hIOm1tOnNzIHp6enonXSxcbiAgWyd7MX0gezB9JywgdSwgdSwgdV0sXG4gIFsnLicsICcsJywgJzsnLCAnJScsICcrJywgJy0nLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ05hTicsICc6J10sXG4gIFsnIywjIzAuIyMjJywgJyMsIyMwJScsICfCpCMsIyMwLjAwJywgJyNFMCddLFxuICAnR0JQJyxcbiAgJ8KjJyxcbiAgJ1B1bnQgU3RlaXJsaW5nJyxcbiAgeydUSEInOiBbJ+C4vyddLCAnVFdEJzogWydOVCQnXSwgJ1hYWCc6IFtdfSxcbiAgcGx1cmFsXG5dO1xuIl19