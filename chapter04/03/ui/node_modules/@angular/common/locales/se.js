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
        define("@angular/common/locales/se", ["require", "exports"], factory);
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
        return 5;
    }
    exports.default = [
        'se',
        [['i.b.', 'e.b.'], u, ['iđitbeaivet', 'eahketbeaivet']],
        [['i.b.', 'e.b.'], u, ['iđitbeaivi', 'eahketbeaivi']],
        [
            ['S', 'V', 'M', 'G', 'D', 'B', 'L'], ['sotn', 'vuos', 'maŋ', 'gask', 'duor', 'bear', 'láv'],
            [
                'sotnabeaivi', 'vuossárga', 'maŋŋebárga', 'gaskavahkku', 'duorasdat', 'bearjadat',
                'lávvardat'
            ],
            ['sotn', 'vuos', 'maŋ', 'gask', 'duor', 'bear', 'láv']
        ],
        u,
        [
            ['O', 'G', 'N', 'C', 'M', 'G', 'S', 'B', 'Č', 'G', 'S', 'J'],
            [
                'ođđj', 'guov', 'njuk', 'cuo', 'mies', 'geas', 'suoi', 'borg', 'čakč', 'golg', 'skáb',
                'juov'
            ],
            [
                'ođđajagemánnu', 'guovvamánnu', 'njukčamánnu', 'cuoŋománnu', 'miessemánnu',
                'geassemánnu', 'suoidnemánnu', 'borgemánnu', 'čakčamánnu', 'golggotmánnu',
                'skábmamánnu', 'juovlamánnu'
            ]
        ],
        u,
        [['o.Kr.', 'm.Kr.'], u, ['ovdal Kristtusa', 'maŋŋel Kristtusa']],
        1,
        [6, 0],
        ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
        ['{1} {0}', u, u, u],
        [',', ' ', ';', '%', '+', '−', '·10^', '·', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
        'NOK',
        'kr',
        'norgga kruvdno',
        {
            'DKK': ['Dkr', 'kr'],
            'JPY': ['JP¥', '¥'],
            'NOK': ['kr'],
            'SEK': ['Skr', 'kr'],
            'THB': ['฿'],
            'USD': ['US$', '$']
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0QixPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBZTtRQUNiLElBQUk7UUFDSixDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNyRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7WUFDM0Y7Z0JBQ0UsYUFBYSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxXQUFXO2dCQUNqRixXQUFXO2FBQ1o7WUFDRCxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztTQUN2RDtRQUNELENBQUM7UUFDRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDNUQ7Z0JBQ0UsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU07Z0JBQ3JGLE1BQU07YUFDUDtZQUNEO2dCQUNFLGVBQWUsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxhQUFhO2dCQUMxRSxhQUFhLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsY0FBYztnQkFDekUsYUFBYSxFQUFFLGFBQWE7YUFDN0I7U0FDRjtRQUNELENBQUM7UUFDRCxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUNELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUM7UUFDcEQsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUM7UUFDcEQsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUNqRSxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQztRQUM3QyxLQUFLO1FBQ0wsSUFBSTtRQUNKLGdCQUFnQjtRQUNoQjtZQUNFLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7WUFDcEIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDYixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO1lBQ3BCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7U0FDcEI7UUFDRCxNQUFNO0tBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAobiA9PT0gMSkgcmV0dXJuIDE7XG4gIGlmIChuID09PSAyKSByZXR1cm4gMjtcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ3NlJyxcbiAgW1snaS5iLicsICdlLmIuJ10sIHUsIFsnacSRaXRiZWFpdmV0JywgJ2VhaGtldGJlYWl2ZXQnXV0sXG4gIFtbJ2kuYi4nLCAnZS5iLiddLCB1LCBbJ2nEkWl0YmVhaXZpJywgJ2VhaGtldGJlYWl2aSddXSxcbiAgW1xuICAgIFsnUycsICdWJywgJ00nLCAnRycsICdEJywgJ0InLCAnTCddLCBbJ3NvdG4nLCAndnVvcycsICdtYcWLJywgJ2dhc2snLCAnZHVvcicsICdiZWFyJywgJ2zDoXYnXSxcbiAgICBbXG4gICAgICAnc290bmFiZWFpdmknLCAndnVvc3PDoXJnYScsICdtYcWLxYtlYsOhcmdhJywgJ2dhc2thdmFoa2t1JywgJ2R1b3Jhc2RhdCcsICdiZWFyamFkYXQnLFxuICAgICAgJ2zDoXZ2YXJkYXQnXG4gICAgXSxcbiAgICBbJ3NvdG4nLCAndnVvcycsICdtYcWLJywgJ2dhc2snLCAnZHVvcicsICdiZWFyJywgJ2zDoXYnXVxuICBdLFxuICB1LFxuICBbXG4gICAgWydPJywgJ0cnLCAnTicsICdDJywgJ00nLCAnRycsICdTJywgJ0InLCAnxIwnLCAnRycsICdTJywgJ0onXSxcbiAgICBbXG4gICAgICAnb8SRxJFqJywgJ2d1b3YnLCAnbmp1aycsICdjdW8nLCAnbWllcycsICdnZWFzJywgJ3N1b2knLCAnYm9yZycsICfEjWFrxI0nLCAnZ29sZycsICdza8OhYicsXG4gICAgICAnanVvdidcbiAgICBdLFxuICAgIFtcbiAgICAgICdvxJHEkWFqYWdlbcOhbm51JywgJ2d1b3Z2YW3DoW5udScsICduanVrxI1hbcOhbm51JywgJ2N1b8WLb23DoW5udScsICdtaWVzc2Vtw6FubnUnLFxuICAgICAgJ2dlYXNzZW3DoW5udScsICdzdW9pZG5lbcOhbm51JywgJ2JvcmdlbcOhbm51JywgJ8SNYWvEjWFtw6FubnUnLCAnZ29sZ2dvdG3DoW5udScsXG4gICAgICAnc2vDoWJtYW3DoW5udScsICdqdW92bGFtw6FubnUnXG4gICAgXVxuICBdLFxuICB1LFxuICBbWydvLktyLicsICdtLktyLiddLCB1LCBbJ292ZGFsIEtyaXN0dHVzYScsICdtYcWLxYtlbCBLcmlzdHR1c2EnXV0sXG4gIDEsXG4gIFs2LCAwXSxcbiAgWyd5LU1NLWRkJywgJ3kgTU1NIGQnLCAneSBNTU1NIGQnLCAneSBNTU1NIGQsIEVFRUUnXSxcbiAgWydISDptbScsICdISDptbTpzcycsICdISDptbTpzcyB6JywgJ0hIOm1tOnNzIHp6enonXSxcbiAgWyd7MX0gezB9JywgdSwgdSwgdV0sXG4gIFsnLCcsICfCoCcsICc7JywgJyUnLCAnKycsICfiiJInLCAnwrcxMF4nLCAnwrcnLCAn4oCwJywgJ+KInicsICdOYU4nLCAnOiddLFxuICBbJyMsIyMwLiMjIycsICcjLCMjMMKgJScsICcjLCMjMC4wMMKgwqQnLCAnI0UwJ10sXG4gICdOT0snLFxuICAna3InLFxuICAnbm9yZ2dhIGtydXZkbm8nLFxuICB7XG4gICAgJ0RLSyc6IFsnRGtyJywgJ2tyJ10sXG4gICAgJ0pQWSc6IFsnSlDCpScsICfCpSddLFxuICAgICdOT0snOiBbJ2tyJ10sXG4gICAgJ1NFSyc6IFsnU2tyJywgJ2tyJ10sXG4gICAgJ1RIQic6IFsn4Li/J10sXG4gICAgJ1VTRCc6IFsnVVMkJywgJyQnXVxuICB9LFxuICBwbHVyYWxcbl07XG4iXX0=