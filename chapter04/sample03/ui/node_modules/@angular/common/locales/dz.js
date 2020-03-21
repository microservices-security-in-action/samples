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
        define("@angular/common/locales/dz", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        return 5;
    }
    exports.default = [
        'dz',
        [['སྔ་ཆ་', 'ཕྱི་ཆ་'], u, u],
        u,
        [
            ['ཟླ', 'མིར', 'ལྷག', 'ཕུར', 'སངྶ', 'སྤེན', 'ཉི'],
            [
                'ཟླ་', 'མིར་', 'ལྷག་', 'ཕུར་', 'སངས་',
                'སྤེན་', 'ཉི་'
            ],
            [
                'གཟའ་ཟླ་བ་', 'གཟའ་མིག་དམར་',
                'གཟའ་ལྷག་པ་', 'གཟའ་ཕུར་བུ་',
                'གཟའ་པ་སངས་', 'གཟའ་སྤེན་པ་',
                'གཟའ་ཉི་མ་'
            ],
            [
                'ཟླ་', 'མིར་', 'ལྷག་', 'ཕུར་', 'སངས་',
                'སྤེན་', 'ཉི་'
            ]
        ],
        u,
        [
            ['༡', '༢', '༣', '4', '༥', '༦', '༧', '༨', '9', '༡༠', '༡༡', '༡༢'],
            ['༡', '༢', '༣', '༤', '༥', '༦', '༧', '༨', '༩', '༡༠', '༡༡', '12'],
            [
                'ཟླ་དངཔ་', 'ཟླ་གཉིས་པ་', 'ཟླ་གསུམ་པ་',
                'ཟླ་བཞི་པ་', 'ཟླ་ལྔ་པ་', 'ཟླ་དྲུག་པ',
                'ཟླ་བདུན་པ་', 'ཟླ་བརྒྱད་པ་',
                'ཟླ་དགུ་པ་', 'ཟླ་བཅུ་པ་',
                'ཟླ་བཅུ་གཅིག་པ་', 'ཟླ་བཅུ་གཉིས་པ་'
            ]
        ],
        [
            ['༡', '༢', '༣', '༤', '༥', '༦', '༧', '༨', '༩', '༡༠', '༡༡', '༡༢'],
            [
                'ཟླ་༡', 'ཟླ་༢', 'ཟླ་༣', 'ཟླ་༤', 'ཟླ་༥',
                'ཟླ་༦', 'ཟླ་༧', 'ཟླ་༨', 'ཟླ་༩', 'ཟླ་༡༠',
                'ཟླ་༡༡', 'ཟླ་༡༢'
            ],
            [
                'སྤྱི་ཟླ་དངཔ་', 'སྤྱི་ཟླ་གཉིས་པ་',
                'སྤྱི་ཟླ་གསུམ་པ་', 'སྤྱི་ཟླ་བཞི་པ',
                'སྤྱི་ཟླ་ལྔ་པ་', 'སྤྱི་ཟླ་དྲུག་པ',
                'སྤྱི་ཟླ་བདུན་པ་',
                'སྤྱི་ཟླ་བརྒྱད་པ་',
                'སྤྱི་ཟླ་དགུ་པ་', 'སྤྱི་ཟླ་བཅུ་པ་',
                'སྤྱི་ཟླ་བཅུ་གཅིག་པ་',
                'སྤྱི་ཟླ་བཅུ་གཉིས་པ་'
            ]
        ],
        [['BCE', 'CE'], u, u],
        0,
        [6, 0],
        [
            'y-MM-dd', 'སྤྱི་ལོ་y ཟླ་MMM ཚེས་dd',
            'སྤྱི་ལོ་y MMMM ཚེས་ dd',
            'EEEE, སྤྱི་ལོ་y MMMM ཚེས་dd'
        ],
        [
            'ཆུ་ཚོད་ h སྐར་མ་ mm a', 'ཆུ་ཚོད་h:mm:ss a',
            'ཆུ་ཚོད་ h སྐར་མ་ mm:ss a z',
            'ཆུ་ཚོད་ h སྐར་མ་ mm:ss a zzzz'
        ],
        ['{1} {0}', u, u, u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##,##0.###', '#,##,##0 %', '¤#,##,##0.00', '#E0'],
        'INR',
        '₹',
        'རྒྱ་གར་གྱི་དངུལ་ རུ་པི',
        {
            'AUD': ['AU$', '$'],
            'BTN': ['Nu.'],
            'ILS': [u, '₪'],
            'JPY': ['JP¥', '¥'],
            'KRW': ['KR₩', '₩'],
            'THB': ['TH฿', '฿'],
            'USD': ['US$', '$'],
            'XAF': []
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHouanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9kei50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixJQUFJO1FBQ0osQ0FBQyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFDRDtZQUNFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDO1lBQ2hEO2dCQUNFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNO2dCQUNyQyxPQUFPLEVBQUUsS0FBSzthQUNmO1lBQ0Q7Z0JBQ0UsV0FBVyxFQUFFLGNBQWM7Z0JBQzNCLFlBQVksRUFBRSxhQUFhO2dCQUMzQixZQUFZLEVBQUUsYUFBYTtnQkFDM0IsV0FBVzthQUNaO1lBQ0Q7Z0JBQ0UsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU07Z0JBQ3JDLE9BQU8sRUFBRSxLQUFLO2FBQ2Y7U0FDRjtRQUNELENBQUM7UUFDRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7WUFDL0QsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztZQUMvRDtnQkFDRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFlBQVk7Z0JBQ3JDLFdBQVcsRUFBRSxVQUFVLEVBQUUsV0FBVztnQkFDcEMsWUFBWSxFQUFFLGFBQWE7Z0JBQzNCLFdBQVcsRUFBRSxXQUFXO2dCQUN4QixnQkFBZ0IsRUFBRSxnQkFBZ0I7YUFDbkM7U0FDRjtRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztZQUMvRDtnQkFDRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTTtnQkFDdEMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU87Z0JBQ3ZDLE9BQU8sRUFBRSxPQUFPO2FBQ2pCO1lBQ0Q7Z0JBQ0UsY0FBYyxFQUFFLGlCQUFpQjtnQkFDakMsaUJBQWlCLEVBQUUsZUFBZTtnQkFDbEMsZUFBZSxFQUFFLGdCQUFnQjtnQkFDakMsaUJBQWlCO2dCQUNqQixrQkFBa0I7Z0JBQ2xCLGdCQUFnQixFQUFFLGdCQUFnQjtnQkFDbEMscUJBQXFCO2dCQUNyQixxQkFBcUI7YUFDdEI7U0FDRjtRQUNELENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBQ0QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ047WUFDRSxTQUFTLEVBQUUseUJBQXlCO1lBQ3BDLHdCQUF3QjtZQUN4Qiw2QkFBNkI7U0FDOUI7UUFDRDtZQUNFLHVCQUF1QixFQUFFLGtCQUFrQjtZQUMzQyw0QkFBNEI7WUFDNUIsK0JBQStCO1NBQ2hDO1FBQ0QsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUM5RCxDQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQztRQUNyRCxLQUFLO1FBQ0wsR0FBRztRQUNILHdCQUF3QjtRQUN4QjtZQUNFLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ2QsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLEVBQUU7U0FDVjtRQUNELE1BQU07S0FDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuLy8gU2VlIGFuZ3VsYXIvdG9vbHMvZ3VscC10YXNrcy9jbGRyL2V4dHJhY3QuanNcblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICdkeicsXG4gIFtbJ+C9puC+lOC8i+C9huC8iycsICfgvZXgvrHgvbLgvIvgvYbgvIsnXSwgdSwgdV0sXG4gIHUsXG4gIFtcbiAgICBbJ+C9n+C+sycsICfgvZjgvbLgvaInLCAn4L2j4L634L2CJywgJ+C9leC9tOC9oicsICfgvabgvYTgvrYnLCAn4L2m4L6k4L264L2TJywgJ+C9ieC9siddLFxuICAgIFtcbiAgICAgICfgvZ/gvrPgvIsnLCAn4L2Y4L2y4L2i4LyLJywgJ+C9o+C+t+C9guC8iycsICfgvZXgvbTgvaLgvIsnLCAn4L2m4L2E4L2m4LyLJyxcbiAgICAgICfgvabgvqTgvbrgvZPgvIsnLCAn4L2J4L2y4LyLJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+C9guC9n+C9oOC8i+C9n+C+s+C8i+C9luC8iycsICfgvYLgvZ/gvaDgvIvgvZjgvbLgvYLgvIvgvZHgvZjgvaLgvIsnLFxuICAgICAgJ+C9guC9n+C9oOC8i+C9o+C+t+C9guC8i+C9lOC8iycsICfgvYLgvZ/gvaDgvIvgvZXgvbTgvaLgvIvgvZbgvbTgvIsnLFxuICAgICAgJ+C9guC9n+C9oOC8i+C9lOC8i+C9puC9hOC9puC8iycsICfgvYLgvZ/gvaDgvIvgvabgvqTgvbrgvZPgvIvgvZTgvIsnLFxuICAgICAgJ+C9guC9n+C9oOC8i+C9ieC9suC8i+C9mOC8iydcbiAgICBdLFxuICAgIFtcbiAgICAgICfgvZ/gvrPgvIsnLCAn4L2Y4L2y4L2i4LyLJywgJ+C9o+C+t+C9guC8iycsICfgvZXgvbTgvaLgvIsnLCAn4L2m4L2E4L2m4LyLJyxcbiAgICAgICfgvabgvqTgvbrgvZPgvIsnLCAn4L2J4L2y4LyLJ1xuICAgIF1cbiAgXSxcbiAgdSxcbiAgW1xuICAgIFsn4LyhJywgJ+C8oicsICfgvKMnLCAnNCcsICfgvKUnLCAn4LymJywgJ+C8pycsICfgvKgnLCAnOScsICfgvKHgvKAnLCAn4Lyh4LyhJywgJ+C8oeC8oiddLFxuICAgIFsn4LyhJywgJ+C8oicsICfgvKMnLCAn4LykJywgJ+C8pScsICfgvKYnLCAn4LynJywgJ+C8qCcsICfgvKknLCAn4Lyh4LygJywgJ+C8oeC8oScsICcxMiddLFxuICAgIFtcbiAgICAgICfgvZ/gvrPgvIvgvZHgvYTgvZTgvIsnLCAn4L2f4L6z4LyL4L2C4L2J4L2y4L2m4LyL4L2U4LyLJywgJ+C9n+C+s+C8i+C9guC9puC9tOC9mOC8i+C9lOC8iycsXG4gICAgICAn4L2f4L6z4LyL4L2W4L2e4L2y4LyL4L2U4LyLJywgJ+C9n+C+s+C8i+C9o+C+lOC8i+C9lOC8iycsICfgvZ/gvrPgvIvgvZHgvrLgvbTgvYLgvIvgvZQnLFxuICAgICAgJ+C9n+C+s+C8i+C9luC9keC9tOC9k+C8i+C9lOC8iycsICfgvZ/gvrPgvIvgvZbgvaLgvpLgvrHgvZHgvIvgvZTgvIsnLFxuICAgICAgJ+C9n+C+s+C8i+C9keC9guC9tOC8i+C9lOC8iycsICfgvZ/gvrPgvIvgvZbgvYXgvbTgvIvgvZTgvIsnLFxuICAgICAgJ+C9n+C+s+C8i+C9luC9heC9tOC8i+C9guC9heC9suC9guC8i+C9lOC8iycsICfgvZ/gvrPgvIvgvZbgvYXgvbTgvIvgvYLgvYngvbLgvabgvIvgvZTgvIsnXG4gICAgXVxuICBdLFxuICBbXG4gICAgWyfgvKEnLCAn4LyiJywgJ+C8oycsICfgvKQnLCAn4LylJywgJ+C8picsICfgvKcnLCAn4LyoJywgJ+C8qScsICfgvKHgvKAnLCAn4Lyh4LyhJywgJ+C8oeC8oiddLFxuICAgIFtcbiAgICAgICfgvZ/gvrPgvIvgvKEnLCAn4L2f4L6z4LyL4LyiJywgJ+C9n+C+s+C8i+C8oycsICfgvZ/gvrPgvIvgvKQnLCAn4L2f4L6z4LyL4LylJyxcbiAgICAgICfgvZ/gvrPgvIvgvKYnLCAn4L2f4L6z4LyL4LynJywgJ+C9n+C+s+C8i+C8qCcsICfgvZ/gvrPgvIvgvKknLCAn4L2f4L6z4LyL4Lyh4LygJyxcbiAgICAgICfgvZ/gvrPgvIvgvKHgvKEnLCAn4L2f4L6z4LyL4Lyh4LyiJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+C9puC+pOC+seC9suC8i+C9n+C+s+C8i+C9keC9hOC9lOC8iycsICfgvabgvqTgvrHgvbLgvIvgvZ/gvrPgvIvgvYLgvYngvbLgvabgvIvgvZTgvIsnLFxuICAgICAgJ+C9puC+pOC+seC9suC8i+C9n+C+s+C8i+C9guC9puC9tOC9mOC8i+C9lOC8iycsICfgvabgvqTgvrHgvbLgvIvgvZ/gvrPgvIvgvZbgvZ7gvbLgvIvgvZQnLFxuICAgICAgJ+C9puC+pOC+seC9suC8i+C9n+C+s+C8i+C9o+C+lOC8i+C9lOC8iycsICfgvabgvqTgvrHgvbLgvIvgvZ/gvrPgvIvgvZHgvrLgvbTgvYLgvIvgvZQnLFxuICAgICAgJ+C9puC+pOC+seC9suC8i+C9n+C+s+C8i+C9luC9keC9tOC9k+C8i+C9lOC8iycsXG4gICAgICAn4L2m4L6k4L6x4L2y4LyL4L2f4L6z4LyL4L2W4L2i4L6S4L6x4L2R4LyL4L2U4LyLJyxcbiAgICAgICfgvabgvqTgvrHgvbLgvIvgvZ/gvrPgvIvgvZHgvYLgvbTgvIvgvZTgvIsnLCAn4L2m4L6k4L6x4L2y4LyL4L2f4L6z4LyL4L2W4L2F4L204LyL4L2U4LyLJyxcbiAgICAgICfgvabgvqTgvrHgvbLgvIvgvZ/gvrPgvIvgvZbgvYXgvbTgvIvgvYLgvYXgvbLgvYLgvIvgvZTgvIsnLFxuICAgICAgJ+C9puC+pOC+seC9suC8i+C9n+C+s+C8i+C9luC9heC9tOC8i+C9guC9ieC9suC9puC8i+C9lOC8iydcbiAgICBdXG4gIF0sXG4gIFtbJ0JDRScsICdDRSddLCB1LCB1XSxcbiAgMCxcbiAgWzYsIDBdLFxuICBbXG4gICAgJ3ktTU0tZGQnLCAn4L2m4L6k4L6x4L2y4LyL4L2j4L284LyLeSDgvZ/gvrPgvItNTU0g4L2a4L264L2m4LyLZGQnLFxuICAgICfgvabgvqTgvrHgvbLgvIvgvaPgvbzgvIt5IE1NTU0g4L2a4L264L2m4LyLIGRkJyxcbiAgICAnRUVFRSwg4L2m4L6k4L6x4L2y4LyL4L2j4L284LyLeSBNTU1NIOC9muC9uuC9puC8i2RkJ1xuICBdLFxuICBbXG4gICAgJ+C9huC9tOC8i+C9muC9vOC9keC8iyBoIOC9puC+kOC9ouC8i+C9mOC8iyBtbSBhJywgJ+C9huC9tOC8i+C9muC9vOC9keC8i2g6bW06c3MgYScsXG4gICAgJ+C9huC9tOC8i+C9muC9vOC9keC8iyBoIOC9puC+kOC9ouC8i+C9mOC8iyBtbTpzcyBhIHonLFxuICAgICfgvYbgvbTgvIvgvZrgvbzgvZHgvIsgaCDgvabgvpDgvaLgvIvgvZjgvIsgbW06c3MgYSB6enp6J1xuICBdLFxuICBbJ3sxfSB7MH0nLCB1LCB1LCB1XSxcbiAgWycuJywgJywnLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAnTmFOJywgJzonXSxcbiAgWycjLCMjLCMjMC4jIyMnLCAnIywjIywjIzDCoCUnLCAnwqQjLCMjLCMjMC4wMCcsICcjRTAnXSxcbiAgJ0lOUicsXG4gICfigrknLFxuICAn4L2i4L6S4L6x4LyL4L2C4L2i4LyL4L2C4L6x4L2y4LyL4L2R4L2E4L204L2j4LyLIOC9ouC9tOC8i+C9lOC9sicsXG4gIHtcbiAgICAnQVVEJzogWydBVSQnLCAnJCddLFxuICAgICdCVE4nOiBbJ051LiddLFxuICAgICdJTFMnOiBbdSwgJ+KCqiddLFxuICAgICdKUFknOiBbJ0pQwqUnLCAnwqUnXSxcbiAgICAnS1JXJzogWydLUuKCqScsICfigqknXSxcbiAgICAnVEhCJzogWydUSOC4vycsICfguL8nXSxcbiAgICAnVVNEJzogWydVUyQnLCAnJCddLFxuICAgICdYQUYnOiBbXVxuICB9LFxuICBwbHVyYWxcbl07XG4iXX0=