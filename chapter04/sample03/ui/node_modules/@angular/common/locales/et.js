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
        define("@angular/common/locales/et", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
        if (i === 1 && v === 0)
            return 1;
        return 5;
    }
    exports.default = [
        'et',
        [['AM', 'PM'], u, u],
        u,
        [
            ['P', 'E', 'T', 'K', 'N', 'R', 'L'], u,
            ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'],
            ['P', 'E', 'T', 'K', 'N', 'R', 'L']
        ],
        u,
        [
            ['J', 'V', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
            [
                'jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets'
            ],
            [
                'jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september',
                'oktoober', 'november', 'detsember'
            ]
        ],
        u,
        [['eKr', 'pKr'], u, ['enne Kristust', 'pärast Kristust']],
        1,
        [6, 0],
        ['dd.MM.yy', 'd. MMM y', 'd. MMMM y', 'EEEE, d. MMMM y'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
        ['{1} {0}', u, u, u],
        [',', ' ', ';', '%', '+', '−', '×10^', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
        'EUR',
        '€',
        'euro',
        { 'AUD': ['AU$', '$'], 'EEK': ['kr'], 'THB': ['฿'], 'TWD': ['NT$'] },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9ldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNsRixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqQyxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBZTtRQUNiLElBQUk7UUFDSixDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3RDLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDO1lBQ3BGLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1NBQ3BDO1FBQ0QsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUM1RDtnQkFDRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU07YUFDOUY7WUFDRDtnQkFDRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVc7Z0JBQ3hGLFVBQVUsRUFBRSxVQUFVLEVBQUUsV0FBVzthQUNwQztTQUNGO1FBQ0QsQ0FBQztRQUNELENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDekQsQ0FBQztRQUNELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLENBQUM7UUFDeEQsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUM7UUFDcEQsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUNqRSxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQztRQUM1QyxLQUFLO1FBQ0wsR0FBRztRQUNILE1BQU07UUFDTixFQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBQztRQUNsRSxNQUFNO0tBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpLCB2ID0gbi50b1N0cmluZygpLnJlcGxhY2UoL15bXi5dKlxcLj8vLCAnJykubGVuZ3RoO1xuICBpZiAoaSA9PT0gMSAmJiB2ID09PSAwKSByZXR1cm4gMTtcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ2V0JyxcbiAgW1snQU0nLCAnUE0nXSwgdSwgdV0sXG4gIHUsXG4gIFtcbiAgICBbJ1AnLCAnRScsICdUJywgJ0snLCAnTicsICdSJywgJ0wnXSwgdSxcbiAgICBbJ3DDvGhhcMOkZXYnLCAnZXNtYXNww6RldicsICd0ZWlzaXDDpGV2JywgJ2tvbG1hcMOkZXYnLCAnbmVsamFww6RldicsICdyZWVkZScsICdsYXVww6RldiddLFxuICAgIFsnUCcsICdFJywgJ1QnLCAnSycsICdOJywgJ1InLCAnTCddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ0onLCAnVicsICdNJywgJ0EnLCAnTScsICdKJywgJ0onLCAnQScsICdTJywgJ08nLCAnTicsICdEJ10sXG4gICAgW1xuICAgICAgJ2phYW4nLCAndmVlYnInLCAnbcOkcnRzJywgJ2FwcicsICdtYWknLCAnanV1bmknLCAnanV1bGknLCAnYXVnJywgJ3NlcHQnLCAnb2t0JywgJ25vdicsICdkZXRzJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ2phYW51YXInLCAndmVlYnJ1YXInLCAnbcOkcnRzJywgJ2FwcmlsbCcsICdtYWknLCAnanV1bmknLCAnanV1bGknLCAnYXVndXN0JywgJ3NlcHRlbWJlcicsXG4gICAgICAnb2t0b29iZXInLCAnbm92ZW1iZXInLCAnZGV0c2VtYmVyJ1xuICAgIF1cbiAgXSxcbiAgdSxcbiAgW1snZUtyJywgJ3BLciddLCB1LCBbJ2VubmUgS3Jpc3R1c3QnLCAncMOkcmFzdCBLcmlzdHVzdCddXSxcbiAgMSxcbiAgWzYsIDBdLFxuICBbJ2RkLk1NLnl5JywgJ2QuIE1NTSB5JywgJ2QuIE1NTU0geScsICdFRUVFLCBkLiBNTU1NIHknXSxcbiAgWydISDptbScsICdISDptbTpzcycsICdISDptbTpzcyB6JywgJ0hIOm1tOnNzIHp6enonXSxcbiAgWyd7MX0gezB9JywgdSwgdSwgdV0sXG4gIFsnLCcsICfCoCcsICc7JywgJyUnLCAnKycsICfiiJInLCAnw5cxMF4nLCAnw5cnLCAn4oCwJywgJ+KInicsICdOYU4nLCAnOiddLFxuICBbJyMsIyMwLiMjIycsICcjLCMjMCUnLCAnIywjIzAuMDDCoMKkJywgJyNFMCddLFxuICAnRVVSJyxcbiAgJ+KCrCcsXG4gICdldXJvJyxcbiAgeydBVUQnOiBbJ0FVJCcsICckJ10sICdFRUsnOiBbJ2tyJ10sICdUSEInOiBbJ+C4vyddLCAnVFdEJzogWydOVCQnXX0sXG4gIHBsdXJhbFxuXTtcbiJdfQ==