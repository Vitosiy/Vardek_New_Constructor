import { useAppData } from "@/store/appliction/useAppData"
import { expressionsReplace } from "./Functions";

export default class Filters {
    _APP: { [key: string]: any } = useAppData().getAppData
    _FILLING: { [key: string]: any } = this._APP.FILLING
    _FASADE_POSITION: { [key: string]: any } = this._APP.FASADE_POSITION
    _FASADE: { [key: string]: any } = this._APP.FASADE
    _FASADENUMBERSIZE: { [key: string]: any } = this._APP.FASADENUMBERSIZE
    _LOOPSIDE: { [key: string]: any } = this._APP.LOOPSIDE

    constructor() {

    }

    filterFilling() {
        return function (items, criteria) {
            let tmp = [];

            if (criteria.ID != undefined) {
                for (let i in items) {
                    let item = items[i];

                    if (
                        criteria.ID.indexOf(item.ID) != -1 &&
                        (!item.CONDITIONS ||
                            eval(
                                expressionsReplace(item.CONDITIONS, {
                                    "#X#": criteria.PR.SIZE.width,
                                    "#Y#": criteria.PR.SIZE.height,
                                    "#Z#": criteria.PR.SIZE.depth,
                                })
                            ))
                    )
                        tmp.push(item);
                }
            }
            return tmp.sort(function (a, b) {
                return this._FILLING[a.ID].SORT - this._FILLING[b.ID].SORT;
            });
        };
    };

    filterFasadePosition() {
        return function (items, CONFIG, sort = true) {
            let tmp = [];
            let _items = CONFIG.CUSTOMFILLING ? Object.values(CONFIG.FASADELIST) : items;

            for (var i in _items) {
                let fasadePosition = this._FASADE_POSITION[_items[i]];

                if (
                    (!CONFIG.BASKET["FILLING"] ||
                        (!!CONFIG.BASKET["FILLING"] &&
                            fasadePosition["filling"].indexOf(CONFIG.BASKET["FILLING"]) != -1) ||
                        (!!CONFIG.BASKET["FILLING"] && !fasadePosition["filling"][0])) &&
                    (!CONFIG.BASKET["FASADESIZE"] ||
                        (!!CONFIG.BASKET["FASADESIZE"] &&
                            fasadePosition["FASADE_SIZE"] == CONFIG.BASKET["FASADESIZE"])) &&
                    (!CONFIG.BASKET["FASADESIZE" + fasadePosition.FASADE_NUMBER] ||
                        (!!CONFIG.BASKET["FASADESIZE" + fasadePosition.FASADE_NUMBER] &&
                            fasadePosition["FASADE_SIZE"] ==
                            CONFIG.BASKET["FASADESIZE" + fasadePosition.FASADE_NUMBER]))
                ) {
                    tmp.push(fasadePosition["ID"]);
                }
            }

            if (sort)
                return tmp.sort(function (a, b) {
                    return (
                        this._FASADE_POSITION[a].FASADE_NUMBER -
                        this._FASADE_POSITION[b].FASADE_NUMBER
                    );
                });
            else
                return tmp
        };
    };

    filterFasadeSize() {
        return function (items, number) {
            let tmp;
            if (number === false) {
                tmp = {};
                for (let i in items) {
                    let fasadeNumbedSize = items[i];
                    this._FASADENUMBERSIZE[fasadeNumbedSize].forEach((v, k) => {
                        v.forEach((fasadeSizeId) => {
                            if (this._FASADESIZE[fasadeSizeId] != undefined) {
                                if (!tmp[k]) {
                                    tmp[k] = [];
                                }
                                tmp[k].push(fasadeSizeId);
                            }
                        });

                        if (tmp[k]) {
                            tmp[k] = tmp[k].sort(function (a, b) {
                                return (
                                    this._FASADESIZE[a].SORT - this._FASADESIZE[b].SORT
                                );
                            });
                        }
                    }
                    );
                }
            } else {
                tmp = [];
                for (let i in items) {
                    let fasadeNumbedSize = items[i];

                    if (this._FASADENUMBERSIZE[fasadeNumbedSize])

                        this._FASADENUMBERSIZE[fasadeNumbedSize][number].forEach(
                            (fasadeSizeId, k) => {
                                if (this._FASADESIZE[fasadeSizeId] != undefined) {
                                    tmp.push(fasadeSizeId);
                                }
                            }
                        );
                }
                tmp = tmp.sort(function (a, b) {
                    return this._FASADESIZE[a].SORT - this._FASADESIZE[b].SORT;
                });
            }
            return tmp;
        };
    };

    filterFasadeType() {
        return function (items, criteria) {
            var tmp = {};

            //Глушка
            if (typeof criteria.fasade == 'object') {
                criteria.fasade = criteria.fasade[0];
            }

            if (
                criteria.fasade &&
                self.scope.app.FASADE[criteria.fasade].fasade_type[0] &&
                criteria.milling === undefined
            ) {

                var fasadeList = self.scope.app.FASADE[criteria.fasade].fasade_type;

                if (items.length > 0) {
                    angular.forEach(items, function (type) {
                        if (
                            self.scope.app.FASADETYPE[type] != undefined &&
                            fasadeList.indexOf(type) != -1
                        ) {
                            tmp[type] = self.scope.app.FASADETYPE[type];
                        }
                    });
                }
            } else if (!self.scope.app.MILLING[criteria.milling]) {
                if (items.length > 0) {
                    angular.forEach(items, function (type) {
                        if (self.scope.app.FASADETYPE[type] != undefined) {
                            tmp[type] = self.scope.app.FASADETYPE[type];
                        }
                    });
                }
            } else {
                var millingList = self.scope.app.MILLING[criteria.milling].fasade_type;

                if (items.length > 0) {
                    angular.forEach(items, function (type) {
                        if (
                            self.scope.app.FASADETYPE[type] != undefined &&
                            millingList.indexOf(type) != -1
                        ) {
                            tmp[type] = self.scope.app.FASADETYPE[type];
                        }
                    });
                }
            }
            return tmp;
        };
    };

    filterLoopSide() {
        return function (items, criteria) {
            const tmp = {}
            if (items.length > 0) {
                angular.forEach(items, function (type) {
                    if (this._LOOPSIDE[type] != undefined) {
                        tmp[type] = this._LOOPSIDE[type];
                    }
                });
            }
            return tmp;
        }
    }

    filterModuleColor() {
        return function (items, criteria) {
            var tmp = [];

            for (var color in items) {
                var colorId = items[color];

                if (this._FASADE[colorId] != undefined) tmp.push(colorId);
            }

            return tmp;
        };
    };

    filterModuleColorID() {
        return function (items, criteria) {
            var tmp = {};
            var ids = criteria?.IDS || false;
            var productId = criteria?.PRODUCT_ID ? criteria.PRODUCT_ID : false;

            var s = criteria?.filter ? criteria.filter.toLowerCase() : false;

            for (var i in items) {
                // список доступных элементов

                if (this._FASADE[items[i]])
                    var item = this._FASADE[items[i]];
                else
                    var item = items[i];

                if (
                    item != undefined && item.ID &&
                    (!s || (item.NAME !== undefined && s && item.NAME.toLowerCase().search(s) != -1)) && item["ELEMENT_TYPE"] != "plinth"
                ) {
                    if (
                        this._FASADE_SECTION[item.IBLOCK_SECTION_ID] != undefined &&
                        this._FASADE_SECTION[item.IBLOCK_SECTION_ID][
                        "UF_GROUP_CONSTRUCTOR"
                        ] != null
                    ) {
                        if (!ids || (ids && ids.indexOf(item.ID) != -1)) {
                            if (
                                tmp[
                                this._FASADE_SECTION[item.IBLOCK_SECTION_ID][
                                "UF_GROUP_CONSTRUCTOR"
                                ]
                                ] == undefined
                            )
                                tmp[
                                    self.scope.app.FASADE_SECTION[item.IBLOCK_SECTION_ID][
                                    "UF_GROUP_CONSTRUCTOR"
                                    ]
                                ] = [];

                            // if (
                            //     self.scope.app.optionsTabName == "defaultModuleColor"
                            // ) {
                            //     if (item.ID !== 1042113 && item.ID !== 2307265 && item.ID !== 2307267) {
                            //         tmp[
                            //             self.scope.app.FASADE_SECTION[item.IBLOCK_SECTION_ID][
                            //             "UF_GROUP_CONSTRUCTOR"
                            //             ]
                            //         ].push(item.ID);
                            //     }
                            // } else {
                            //     tmp[
                            //         self.scope.app.FASADE_SECTION[item.IBLOCK_SECTION_ID][
                            //         "UF_GROUP_CONSTRUCTOR"
                            //         ]
                            //     ].push(item.ID);
                            // }
                        }
                    }
                }
            }

            var tmpl = {};
            tmp.forEach((k, i) => {
                if (
                    this._APP.optionsTabName == "defaultModuleColor"
                ) {
                    if (i !== "1294117" && i !== "953073") {
                        tmpl[i] = this._FASADE_GROUPS[i];
                        tmpl[i]["FASADES"] = tmp[i];
                    }
                } else {
                    tmpl[i] = this._FASADE_GROUPS[i];
                    tmpl[i]["FASADES"] = tmp[i];
                }
            });

            return tmpl;
        };
    };

    filterPalette() {
        return function (items, criteria) {
            var tmp = {};

            //Глушка
            if (typeof criteria.element == 'object') {
                criteria.element = criteria.element[0];
            }

            var s = criteria.filter ? criteria.filter.toLowerCase() : false;
            var root = criteria.root ? criteria.root : "FASADE";

            if (
                criteria.element != undefined &&
                self.scope.app[root][criteria.element] &&
                self.scope.app[root][criteria.element].PALETTE[0]
            ) {
                var type = self.scope.app[root][criteria.element].PALETTE;

                for (var i in items) {
                    var item = items[i];
                    if (
                        !s ||
                        (s &&
                            (item.NAME.toLowerCase().search(s) != -1))
                    ) {
                        for (let w in type) {
                            if (type[w] == item.TYPE) {
                                tmp[item.ID] = item;
                                break;
                            }
                        }
                    }
                }
            }

            return tmp;
        };
    };
}