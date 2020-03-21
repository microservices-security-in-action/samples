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
        define("@angular/common/locales/ksh", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        if (n === 0)
            return 0;
        if (n === 1)
            return 1;
        return 5;
    }
    exports.default = [
        'ksh',
        [['v.M.', 'n.M.'], u, ['Uhr vörmiddaachs', 'Uhr nommendaachs']],
        [['v.M.', 'n.M.'], u, ['Vörmeddaach', 'Nommendaach']],
        [
            ['S', 'M', 'D', 'M', 'D', 'F', 'S'], ['Su.', 'Mo.', 'Di.', 'Me.', 'Du.', 'Fr.', 'Sa.'],
            ['Sunndaach', 'Mohndaach', 'Dinnsdaach', 'Metwoch', 'Dunnersdaach', 'Friidaach', 'Samsdaach'],
            ['Su', 'Mo', 'Di', 'Me', 'Du', 'Fr', 'Sa']
        ],
        u,
        [
            ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
            ['Jan', 'Fäb', 'Mäz', 'Apr', 'Mai', 'Jun', 'Jul', 'Ouj', 'Säp', 'Okt', 'Nov', 'Dez'],
            [
                'Jannewa', 'Fäbrowa', 'Määz', 'Aprell', 'Mai', 'Juuni', 'Juuli', 'Oujoß', 'Septämber',
                'Oktohber', 'Novämber', 'Dezämber'
            ]
        ],
        [
            ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
            [
                'Jan.', 'Fäb.', 'Mäz.', 'Apr.', 'Mai', 'Jun.', 'Jul.', 'Ouj.', 'Säp.', 'Okt.', 'Nov.',
                'Dez.'
            ],
            [
                'Jannewa', 'Fäbrowa', 'Määz', 'Aprell', 'Mai', 'Juuni', 'Juuli', 'Oujoß', 'Septämber',
                'Oktohber', 'Novämber', 'Dezämber'
            ]
        ],
        [['vC', 'nC'], ['v. Chr.', 'n. Chr.'], ['vür Krestos', 'noh Krestos']],
        1,
        [6, 0],
        ['d. M. y', 'd. MMM. y', 'd. MMMM y', 'EEEE, \'dä\' d. MMMM y'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
        ['{1} {0}', u, u, u],
        [',', ' ', ';', '%', '+', '−', '×10^', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
        'EUR',
        '€',
        'Euro',
        { 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$'] },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3NoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2xvY2FsZXMva3NoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgseUNBQXlDO0lBQ3pDLCtDQUErQztJQUUvQyxJQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7SUFFcEIsU0FBUyxNQUFNLENBQUMsQ0FBUztRQUN2QixJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVELGtCQUFlO1FBQ2IsS0FBSztRQUNMLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUMvRCxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNyRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDdEYsQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUM7WUFDN0YsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7U0FDM0M7UUFDRCxDQUFDO1FBQ0Q7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQzVELENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDcEY7Z0JBQ0UsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxXQUFXO2dCQUNyRixVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVU7YUFDbkM7U0FDRjtRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUM1RDtnQkFDRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTTtnQkFDckYsTUFBTTthQUNQO1lBQ0Q7Z0JBQ0UsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxXQUFXO2dCQUNyRixVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVU7YUFDbkM7U0FDRjtRQUNELENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUNELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsd0JBQXdCLENBQUM7UUFDL0QsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUM7UUFDcEQsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUNqRSxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQztRQUM3QyxLQUFLO1FBQ0wsR0FBRztRQUNILE1BQU07UUFDTixFQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUM7UUFDMUMsTUFBTTtLQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRISVMgQ09ERSBJUyBHRU5FUkFURUQgLSBETyBOT1QgTU9ESUZZXG4vLyBTZWUgYW5ndWxhci90b29scy9ndWxwLXRhc2tzL2NsZHIvZXh0cmFjdC5qc1xuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKG4gPT09IDApIHJldHVybiAwO1xuICBpZiAobiA9PT0gMSkgcmV0dXJuIDE7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICdrc2gnLFxuICBbWyd2Lk0uJywgJ24uTS4nXSwgdSwgWydVaHIgdsO2cm1pZGRhYWNocycsICdVaHIgbm9tbWVuZGFhY2hzJ11dLFxuICBbWyd2Lk0uJywgJ24uTS4nXSwgdSwgWydWw7ZybWVkZGFhY2gnLCAnTm9tbWVuZGFhY2gnXV0sXG4gIFtcbiAgICBbJ1MnLCAnTScsICdEJywgJ00nLCAnRCcsICdGJywgJ1MnXSwgWydTdS4nLCAnTW8uJywgJ0RpLicsICdNZS4nLCAnRHUuJywgJ0ZyLicsICdTYS4nXSxcbiAgICBbJ1N1bm5kYWFjaCcsICdNb2huZGFhY2gnLCAnRGlubnNkYWFjaCcsICdNZXR3b2NoJywgJ0R1bm5lcnNkYWFjaCcsICdGcmlpZGFhY2gnLCAnU2Ftc2RhYWNoJ10sXG4gICAgWydTdScsICdNbycsICdEaScsICdNZScsICdEdScsICdGcicsICdTYSddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ0onLCAnRicsICdNJywgJ0EnLCAnTScsICdKJywgJ0onLCAnTycsICdTJywgJ08nLCAnTicsICdEJ10sXG4gICAgWydKYW4nLCAnRsOkYicsICdNw6R6JywgJ0FwcicsICdNYWknLCAnSnVuJywgJ0p1bCcsICdPdWonLCAnU8OkcCcsICdPa3QnLCAnTm92JywgJ0RleiddLFxuICAgIFtcbiAgICAgICdKYW5uZXdhJywgJ0bDpGJyb3dhJywgJ03DpMOkeicsICdBcHJlbGwnLCAnTWFpJywgJ0p1dW5pJywgJ0p1dWxpJywgJ091am/DnycsICdTZXB0w6RtYmVyJyxcbiAgICAgICdPa3RvaGJlcicsICdOb3bDpG1iZXInLCAnRGV6w6RtYmVyJ1xuICAgIF1cbiAgXSxcbiAgW1xuICAgIFsnSicsICdGJywgJ00nLCAnQScsICdNJywgJ0onLCAnSicsICdPJywgJ1MnLCAnTycsICdOJywgJ0QnXSxcbiAgICBbXG4gICAgICAnSmFuLicsICdGw6RiLicsICdNw6R6LicsICdBcHIuJywgJ01haScsICdKdW4uJywgJ0p1bC4nLCAnT3VqLicsICdTw6RwLicsICdPa3QuJywgJ05vdi4nLFxuICAgICAgJ0Rlei4nXG4gICAgXSxcbiAgICBbXG4gICAgICAnSmFubmV3YScsICdGw6Ricm93YScsICdNw6TDpHonLCAnQXByZWxsJywgJ01haScsICdKdXVuaScsICdKdXVsaScsICdPdWpvw58nLCAnU2VwdMOkbWJlcicsXG4gICAgICAnT2t0b2hiZXInLCAnTm92w6RtYmVyJywgJ0RlesOkbWJlcidcbiAgICBdXG4gIF0sXG4gIFtbJ3ZDJywgJ25DJ10sIFsndi4gQ2hyLicsICduLiBDaHIuJ10sIFsndsO8ciBLcmVzdG9zJywgJ25vaCBLcmVzdG9zJ11dLFxuICAxLFxuICBbNiwgMF0sXG4gIFsnZC4gTS4geScsICdkLiBNTU0uIHknLCAnZC4gTU1NTSB5JywgJ0VFRUUsIFxcJ2TDpFxcJyBkLiBNTU1NIHknXSxcbiAgWydISDptbScsICdISDptbTpzcycsICdISDptbTpzcyB6JywgJ0hIOm1tOnNzIHp6enonXSxcbiAgWyd7MX0gezB9JywgdSwgdSwgdV0sXG4gIFsnLCcsICfCoCcsICc7JywgJyUnLCAnKycsICfiiJInLCAnw5cxMF4nLCAnw5cnLCAn4oCwJywgJ+KInicsICdOYU4nLCAnOiddLFxuICBbJyMsIyMwLiMjIycsICcjLCMjMMKgJScsICcjLCMjMC4wMMKgwqQnLCAnI0UwJ10sXG4gICdFVVInLFxuICAn4oKsJyxcbiAgJ0V1cm8nLFxuICB7J0pQWSc6IFsnSlDCpScsICfCpSddLCAnVVNEJzogWydVUyQnLCAnJCddfSxcbiAgcGx1cmFsXG5dO1xuIl19