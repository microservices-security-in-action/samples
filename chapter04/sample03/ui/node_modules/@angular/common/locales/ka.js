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
        define("@angular/common/locales/ka", ["require", "exports"], factory);
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
        return 5;
    }
    exports.default = [
        'ka',
        [['a', 'p'], ['AM', 'PM'], u],
        [['AM', 'PM'], u, u],
        [
            ['კ', 'ო', 'ს', 'ო', 'ხ', 'პ', 'შ'],
            ['კვი', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'],
            [
                'კვირა', 'ორშაბათი', 'სამშაბათი',
                'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი',
                'შაბათი'
            ],
            ['კვ', 'ორ', 'სმ', 'ოთ', 'ხთ', 'პრ', 'შბ']
        ],
        u,
        [
            ['ი', 'თ', 'მ', 'ა', 'მ', 'ი', 'ი', 'ა', 'ს', 'ო', 'ნ', 'დ'],
            [
                'იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ',
                'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'
            ],
            [
                'იანვარი', 'თებერვალი', 'მარტი',
                'აპრილი', 'მაისი', 'ივნისი', 'ივლისი',
                'აგვისტო', 'სექტემბერი', 'ოქტომბერი',
                'ნოემბერი', 'დეკემბერი'
            ]
        ],
        u,
        [
            ['ძვ. წ.', 'ახ. წ.'], u,
            [
                'ძველი წელთაღრიცხვით',
                'ახალი წელთაღრიცხვით'
            ]
        ],
        1,
        [6, 0],
        ['dd.MM.yy', 'd MMM. y', 'd MMMM, y', 'EEEE, dd MMMM, y'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
        ['{1}, {0}', u, u, u],
        [
            ',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞',
            'არ არის რიცხვი', ':'
        ],
        ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
        'GEL',
        '₾',
        'ქართული ლარი',
        {
            'AUD': [u, '$'],
            'CNY': [u, '¥'],
            'GEL': ['₾'],
            'HKD': [u, '$'],
            'ILS': [u, '₪'],
            'INR': [u, '₹'],
            'JPY': [u, '¥'],
            'KRW': [u, '₩'],
            'NZD': [u, '$'],
            'TWD': ['NT$'],
            'USD': ['US$', '$'],
            'VND': [u, '₫']
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2EuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9rYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVELGtCQUFlO1FBQ2IsSUFBSTtRQUNKLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQjtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQ25DLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1lBQ2pEO2dCQUNFLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVztnQkFDaEMsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXO2dCQUNyQyxRQUFRO2FBQ1Q7WUFDRCxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztTQUMzQztRQUNELENBQUM7UUFDRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDNUQ7Z0JBQ0UsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztnQkFDL0MsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7YUFDbEM7WUFDRDtnQkFDRSxTQUFTLEVBQUUsV0FBVyxFQUFFLE9BQU87Z0JBQy9CLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVE7Z0JBQ3JDLFNBQVMsRUFBRSxZQUFZLEVBQUUsV0FBVztnQkFDcEMsVUFBVSxFQUFFLFdBQVc7YUFDeEI7U0FDRjtRQUNELENBQUM7UUFDRDtZQUNFLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdkI7Z0JBQ0UscUJBQXFCO2dCQUNyQixxQkFBcUI7YUFDdEI7U0FDRjtRQUNELENBQUM7UUFDRCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixDQUFDO1FBQ3pELENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsZUFBZSxDQUFDO1FBQ3BELENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JCO1lBQ0UsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztZQUNoRCxnQkFBZ0IsRUFBRSxHQUFHO1NBQ3RCO1FBQ0QsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUM7UUFDNUMsS0FBSztRQUNMLEdBQUc7UUFDSCxjQUFjO1FBQ2Q7WUFDRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNkLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztTQUNoQjtRQUNELE1BQU07S0FDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuLy8gU2VlIGFuZ3VsYXIvdG9vbHMvZ3VscC10YXNrcy9jbGRyL2V4dHJhY3QuanNcblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIGlmIChuID09PSAxKSByZXR1cm4gMTtcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ2thJyxcbiAgW1snYScsICdwJ10sIFsnQU0nLCAnUE0nXSwgdV0sXG4gIFtbJ0FNJywgJ1BNJ10sIHUsIHVdLFxuICBbXG4gICAgWyfhg5knLCAn4YOdJywgJ+GDoScsICfhg50nLCAn4YOuJywgJ+GDnicsICfhg6gnXSxcbiAgICBbJ+GDmeGDleGDmCcsICfhg53hg6Dhg6gnLCAn4YOh4YOQ4YObJywgJ+GDneGDl+GDricsICfhg67hg6Phg5cnLCAn4YOe4YOQ4YOgJywgJ+GDqOGDkOGDkSddLFxuICAgIFtcbiAgICAgICfhg5nhg5Xhg5jhg6Dhg5AnLCAn4YOd4YOg4YOo4YOQ4YOR4YOQ4YOX4YOYJywgJ+GDoeGDkOGDm+GDqOGDkOGDkeGDkOGDl+GDmCcsXG4gICAgICAn4YOd4YOX4YOu4YOo4YOQ4YOR4YOQ4YOX4YOYJywgJ+GDruGDo+GDl+GDqOGDkOGDkeGDkOGDl+GDmCcsICfhg57hg5Dhg6Dhg5Dhg6Hhg5nhg5Thg5Xhg5gnLFxuICAgICAgJ+GDqOGDkOGDkeGDkOGDl+GDmCdcbiAgICBdLFxuICAgIFsn4YOZ4YOVJywgJ+GDneGDoCcsICfhg6Hhg5snLCAn4YOd4YOXJywgJ+GDruGDlycsICfhg57hg6AnLCAn4YOo4YORJ11cbiAgXSxcbiAgdSxcbiAgW1xuICAgIFsn4YOYJywgJ+GDlycsICfhg5snLCAn4YOQJywgJ+GDmycsICfhg5gnLCAn4YOYJywgJ+GDkCcsICfhg6EnLCAn4YOdJywgJ+GDnCcsICfhg5MnXSxcbiAgICBbXG4gICAgICAn4YOY4YOQ4YOcJywgJ+GDl+GDlOGDkScsICfhg5vhg5Dhg6AnLCAn4YOQ4YOe4YOgJywgJ+GDm+GDkOGDmCcsICfhg5jhg5Xhg5wnLCAn4YOY4YOV4YOaJyxcbiAgICAgICfhg5Dhg5Lhg5UnLCAn4YOh4YOU4YOlJywgJ+GDneGDpeGDoicsICfhg5zhg53hg5QnLCAn4YOT4YOU4YOZJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+GDmOGDkOGDnOGDleGDkOGDoOGDmCcsICfhg5fhg5Thg5Hhg5Thg6Dhg5Xhg5Dhg5rhg5gnLCAn4YOb4YOQ4YOg4YOi4YOYJyxcbiAgICAgICfhg5Dhg57hg6Dhg5jhg5rhg5gnLCAn4YOb4YOQ4YOY4YOh4YOYJywgJ+GDmOGDleGDnOGDmOGDoeGDmCcsICfhg5jhg5Xhg5rhg5jhg6Hhg5gnLFxuICAgICAgJ+GDkOGDkuGDleGDmOGDoeGDouGDnScsICfhg6Hhg5Thg6Xhg6Lhg5Thg5vhg5Hhg5Thg6Dhg5gnLCAn4YOd4YOl4YOi4YOd4YOb4YOR4YOU4YOg4YOYJyxcbiAgICAgICfhg5zhg53hg5Thg5vhg5Hhg5Thg6Dhg5gnLCAn4YOT4YOU4YOZ4YOU4YOb4YOR4YOU4YOg4YOYJ1xuICAgIF1cbiAgXSxcbiAgdSxcbiAgW1xuICAgIFsn4YOr4YOVLiDhg6wuJywgJ+GDkOGDri4g4YOsLiddLCB1LFxuICAgIFtcbiAgICAgICfhg6vhg5Xhg5Thg5rhg5gg4YOs4YOU4YOa4YOX4YOQ4YOm4YOg4YOY4YOq4YOu4YOV4YOY4YOXJyxcbiAgICAgICfhg5Dhg67hg5Dhg5rhg5gg4YOs4YOU4YOa4YOX4YOQ4YOm4YOg4YOY4YOq4YOu4YOV4YOY4YOXJ1xuICAgIF1cbiAgXSxcbiAgMSxcbiAgWzYsIDBdLFxuICBbJ2RkLk1NLnl5JywgJ2QgTU1NLiB5JywgJ2QgTU1NTSwgeScsICdFRUVFLCBkZCBNTU1NLCB5J10sXG4gIFsnSEg6bW0nLCAnSEg6bW06c3MnLCAnSEg6bW06c3MgeicsICdISDptbTpzcyB6enp6J10sXG4gIFsnezF9LCB7MH0nLCB1LCB1LCB1XSxcbiAgW1xuICAgICcsJywgJ8KgJywgJzsnLCAnJScsICcrJywgJy0nLCAnRScsICfDlycsICfigLAnLCAn4oieJyxcbiAgICAn4YOQ4YOgwqDhg5Dhg6Dhg5jhg6HCoOGDoOGDmOGDquGDruGDleGDmCcsICc6J1xuICBdLFxuICBbJyMsIyMwLiMjIycsICcjLCMjMCUnLCAnIywjIzAuMDDCoMKkJywgJyNFMCddLFxuICAnR0VMJyxcbiAgJ+KCvicsXG4gICfhg6Xhg5Dhg6Dhg5fhg6Phg5rhg5gg4YOa4YOQ4YOg4YOYJyxcbiAge1xuICAgICdBVUQnOiBbdSwgJyQnXSxcbiAgICAnQ05ZJzogW3UsICfCpSddLFxuICAgICdHRUwnOiBbJ+KCviddLFxuICAgICdIS0QnOiBbdSwgJyQnXSxcbiAgICAnSUxTJzogW3UsICfigqonXSxcbiAgICAnSU5SJzogW3UsICfigrknXSxcbiAgICAnSlBZJzogW3UsICfCpSddLFxuICAgICdLUlcnOiBbdSwgJ+KCqSddLFxuICAgICdOWkQnOiBbdSwgJyQnXSxcbiAgICAnVFdEJzogWydOVCQnXSxcbiAgICAnVVNEJzogWydVUyQnLCAnJCddLFxuICAgICdWTkQnOiBbdSwgJ+KCqyddXG4gIH0sXG4gIHBsdXJhbFxuXTtcbiJdfQ==