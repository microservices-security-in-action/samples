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
        define("@angular/common/locales/fa", ["require", "exports"], factory);
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
        return 5;
    }
    exports.default = [
        'fa',
        [['ق', 'ب'], ['ق.ظ.', 'ب.ظ.'], ['قبل\u200cازظهر', 'بعدازظهر']],
        u,
        [
            ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
            [
                'یکشنبه', 'دوشنبه', 'سه\u200cشنبه', 'چهارشنبه', 'پنجشنبه',
                'جمعه', 'شنبه'
            ],
            u, ['۱ش', '۲ش', '۳ش', '۴ش', '۵ش', 'ج', 'ش']
        ],
        u,
        [
            ['ژ', 'ف', 'م', 'آ', 'م', 'ژ', 'ژ', 'ا', 'س', 'ا', 'ن', 'د'],
            [
                'ژانویهٔ', 'فوریهٔ', 'مارس', 'آوریل', 'مهٔ', 'ژوئن',
                'ژوئیهٔ', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
            ],
            u
        ],
        [
            ['ژ', 'ف', 'م', 'آ', 'م', 'ژ', 'ژ', 'ا', 'س', 'ا', 'ن', 'د'],
            [
                'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه',
                'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
            ],
            u
        ],
        [['ق', 'م'], ['ق.م.', 'م.'], ['قبل از میلاد', 'میلادی']],
        6,
        [5, 5],
        ['y/M/d', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
        ['H:mm', 'H:mm:ss', 'H:mm:ss (z)', 'H:mm:ss (zzzz)'],
        ['{1}،\u200f {0}', u, '{1}، ساعت {0}', u],
        ['.', ',', ';', '%', '\u200e+', '\u200e−', 'E', '×', '‰', '∞', 'ناعدد', ':'],
        ['#,##0.###', '#,##0%', '\u200e¤ #,##0.00', '#E0'],
        'IRR',
        'ریال',
        'ریال ایران',
        {
            'AFN': ['؋'],
            'CAD': ['$CA', '$'],
            'CNY': ['¥CN', '¥'],
            'HKD': ['$HK', '$'],
            'IRR': ['ریال'],
            'MXN': ['$MX', '$'],
            'NZD': ['$NZ', '$'],
            'THB': ['฿'],
            'XCD': ['$EC', '$']
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9mYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDakMsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixJQUFJO1FBQ0osQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFDRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQ25DO2dCQUNFLFFBQVEsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxTQUFTO2dCQUN6RCxNQUFNLEVBQUUsTUFBTTthQUNmO1lBQ0QsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1NBQzVDO1FBQ0QsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUM1RDtnQkFDRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU07Z0JBQ25ELFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUTthQUN4RDtZQUNELENBQUM7U0FDRjtRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUM1RDtnQkFDRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPO2dCQUN6RCxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUTthQUM5QztZQUNELENBQUM7U0FDRjtRQUNELENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUNELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDO1FBQ2pELENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUM7UUFDcEQsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQztRQUN6QyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDO1FBQzVFLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLENBQUM7UUFDbEQsS0FBSztRQUNMLE1BQU07UUFDTixZQUFZO1FBQ1o7WUFDRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDWixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztTQUNwQjtRQUNELE1BQU07S0FDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuLy8gU2VlIGFuZ3VsYXIvdG9vbHMvZ3VscC10YXNrcy9jbGRyL2V4dHJhY3QuanNcblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBpID0gTWF0aC5mbG9vcihNYXRoLmFicyhuKSk7XG4gIGlmIChpID09PSAwIHx8IG4gPT09IDEpIHJldHVybiAxO1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAnZmEnLFxuICBbWyfZgicsICfYqCddLCBbJ9mCLti4LicsICfYqC7YuC4nXSwgWyfZgtio2YRcXHUyMDBj2KfYsti42YfYsScsICfYqNi52K/Yp9iy2LjZh9ixJ11dLFxuICB1LFxuICBbXG4gICAgWyfbjCcsICfYrycsICfYsycsICfahicsICfZvicsICfYrCcsICfYtCddLFxuICAgIFtcbiAgICAgICfbjNqp2LTZhtio2YcnLCAn2K/ZiNi02YbYqNmHJywgJ9iz2YdcXHUyMDBj2LTZhtio2YcnLCAn2obZh9in2LHYtNmG2KjZhycsICfZvtmG2KzYtNmG2KjZhycsXG4gICAgICAn2KzZhdi52YcnLCAn2LTZhtio2YcnXG4gICAgXSxcbiAgICB1LCBbJ9ux2LQnLCAn27LYtCcsICfbs9i0JywgJ9u02LQnLCAn27XYtCcsICfYrCcsICfYtCddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ9qYJywgJ9mBJywgJ9mFJywgJ9iiJywgJ9mFJywgJ9qYJywgJ9qYJywgJ9inJywgJ9izJywgJ9inJywgJ9mGJywgJ9ivJ10sXG4gICAgW1xuICAgICAgJ9qY2KfZhtmI24zZh9mUJywgJ9mB2YjYsduM2YfZlCcsICfZhdin2LHYsycsICfYotmI2LHbjNmEJywgJ9mF2YfZlCcsICfamNmI2KbZhicsXG4gICAgICAn2pjZiNim24zZh9mUJywgJ9in2YjYqicsICfYs9m+2KrYp9mF2KjYsScsICfYp9qp2KrYqNixJywgJ9mG2YjYp9mF2KjYsScsICfYr9iz2KfZhdio2LEnXG4gICAgXSxcbiAgICB1XG4gIF0sXG4gIFtcbiAgICBbJ9qYJywgJ9mBJywgJ9mFJywgJ9iiJywgJ9mFJywgJ9qYJywgJ9qYJywgJ9inJywgJ9izJywgJ9inJywgJ9mGJywgJ9ivJ10sXG4gICAgW1xuICAgICAgJ9qY2KfZhtmI24zZhycsICfZgdmI2LHbjNmHJywgJ9mF2KfYsdizJywgJ9ii2YjYsduM2YQnLCAn2YXZhycsICfamNmI2KbZhicsICfamNmI2KbbjNmHJyxcbiAgICAgICfYp9mI2KonLCAn2LPZvtiq2KfZhdio2LEnLCAn2Kfaqdiq2KjYsScsICfZhtmI2KfZhdio2LEnLCAn2K/Ys9in2YXYqNixJ1xuICAgIF0sXG4gICAgdVxuICBdLFxuICBbWyfZgicsICfZhSddLCBbJ9mCLtmFLicsICfZhS4nXSwgWyfZgtio2YQg2KfYsiDZhduM2YTYp9ivJywgJ9mF24zZhNin2K/bjCddXSxcbiAgNixcbiAgWzUsIDVdLFxuICBbJ3kvTS9kJywgJ2QgTU1NIHknLCAnZCBNTU1NIHknLCAnRUVFRSBkIE1NTU0geSddLFxuICBbJ0g6bW0nLCAnSDptbTpzcycsICdIOm1tOnNzICh6KScsICdIOm1tOnNzICh6enp6KSddLFxuICBbJ3sxfdiMXFx1MjAwZiB7MH0nLCB1LCAnezF92Iwg2LPYp9i52KogezB9JywgdV0sXG4gIFsnLicsICcsJywgJzsnLCAnJScsICdcXHUyMDBlKycsICdcXHUyMDBl4oiSJywgJ0UnLCAnw5cnLCAn4oCwJywgJ+KInicsICfZhtin2LnYr9ivJywgJzonXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzAlJywgJ1xcdTIwMGXCpMKgIywjIzAuMDAnLCAnI0UwJ10sXG4gICdJUlInLFxuICAn2LHbjNin2YQnLFxuICAn2LHbjNin2YQg2KfbjNix2KfZhicsXG4gIHtcbiAgICAnQUZOJzogWyfYiyddLFxuICAgICdDQUQnOiBbJyRDQScsICckJ10sXG4gICAgJ0NOWSc6IFsnwqVDTicsICfCpSddLFxuICAgICdIS0QnOiBbJyRISycsICckJ10sXG4gICAgJ0lSUic6IFsn2LHbjNin2YQnXSxcbiAgICAnTVhOJzogWyckTVgnLCAnJCddLFxuICAgICdOWkQnOiBbJyROWicsICckJ10sXG4gICAgJ1RIQic6IFsn4Li/J10sXG4gICAgJ1hDRCc6IFsnJEVDJywgJyQnXVxuICB9LFxuICBwbHVyYWxcbl07XG4iXX0=