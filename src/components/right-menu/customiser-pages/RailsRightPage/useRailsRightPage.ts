//@ts-nocheck
import {useAppData} from "@/store/appliction/useAppData";
import {useModelState} from "@/store/appliction/useModelState";
import {useEventBus} from "@/store/appliction/useEventBus";
import {useMechanism} from "./Mechanism/useMechanism";
import {useUMStorage} from "@/store/appStore/UniversalModule/useUMStorage.ts";

const mechanism = useMechanism()


export const useRailsRightPage = () => {

    const appData = useAppData();
    const modelState = useModelState();
    const eventBus = useEventBus();
    const UM_STORE = useUMStorage();
    const {weightCalculation, createMeckhanizmList} = mechanism

    const mechanismList = createMeckhanizmList()

    const createOptionList = () => {

        const {PROPS} = modelState.getCurrentModel.userData;
        const filtered = filterOptions()
        let result = checkExeptionOptionForFasade(filtered, PROPS.CONFIG.OPTIONS)

        if (mechanismList.length > 0) {

            result = [...result, ...mechanismList]
        }

        return {
            props: PROPS.CONFIG.OPTIONS,
            data: result
        }
    }

    const checkActive = (id: string | number, values: boolean) => {
        const {PROPS} = modelState.getCurrentModel.userData;
        const {OPTIONS, MECHANISM_TEMP} = PROPS.CONFIG;

        const curOpt = OPTIONS.find(el => el.id == id);
        const curMech = MECHANISM_TEMP.find(el => el.ID == id);

        if (curMech) {

            MECHANISM_TEMP.forEach(mech => {

                if (mech.close === curMech.close && mech.id !== curMech.ID) {
                    mech.active = false;
                }

            });

            PROPS.CONFIG.MECHANISM = values ? id : null
            curMech.active = values;

            eventBus.emit("A:SelectModelOption")
        }

        if (!curOpt)
            return;

        if (values) {
            OPTIONS.forEach(opt => {
                // if (opt.close === curOpt.close && opt.id !== curOpt.id) {
                //     opt.active = false;
                // }
                if (opt.group === curOpt.group && opt.close === curOpt.close && opt.id !== curOpt.id || opt.section === curOpt.section && opt.close === curOpt.close && opt.id !== curOpt.id) {

                    if (opt.active) {
                        switch (+opt.id) {
                            case 7250452:   //Деревянная царга
                                delete PROPS.CONFIG.TSARGA
                                break;
                            case 7250589:   //Металлическая царга
                                delete PROPS.CONFIG.TSARGA
                                break;
                            case 5738924:   //Без дна
                                PROPS.CONFIG.BACKWALL = {COLOR: PROPS.CONFIG.MODULE_COLOR, SHOW: true};
                                //PROPS.CONFIG.HORIZONT = 78
                                UM_STORE.onHorizont = true
                                UM_STORE.noBottom = false
                                break;
                            default:
                                break;
                        }
                    }

                    opt.active = false;
                }
            });
        }

        curOpt.active = values;

        if (!values && curOpt.close === '1') {
            checkNecessaryOptions([], OPTIONS)
        }

        switch (+curOpt.id) {
            case 3955910: //Опция без присадки под петли
                if(curOpt.active) {
                    checkActive(1795067, true)
                    let noLoopsOption = OPTIONS.find((opt, index) => {
                        if (+opt.id === 1795067)
                            return opt;
                    })
                    noLoopsOption.disabled = true
                }
                else {
                    let noLoopsOption = OPTIONS.find((opt, index) => {
                        if (+opt.id === 1795067)
                            return opt;
                    })
                    delete noLoopsOption.disabled
                }

                break;
            case 7250452:   //Деревянная царга
                if (curOpt.active) {
                    PROPS.CONFIG.TSARGA = {TYPE: 'wood', COLOR: PROPS.CONFIG.MODULE_COLOR}
                } else
                    delete PROPS.CONFIG.TSARGA
                break;
            case 8390271:
                if(PROPS.CONFIG.eccentricOption)
                    curOpt.active = true;
                break;
            case 7250589:   //Металлическая царга
                if (curOpt.active) {
                    PROPS.CONFIG.TSARGA = {TYPE: 'metal', COLOR: 79065}
                } else
                    delete PROPS.CONFIG.TSARGA
                break;
            case 5738924:   //Без дна
                if (curOpt.active) {
                    PROPS.CONFIG.BACKWALL = {COLOR: false, SHOW: false};
                    //PROPS.CONFIG.HORIZONT = 0
                    UM_STORE.onHorizont = false
                    UM_STORE.noBottom = true
                } else {
                    PROPS.CONFIG.BACKWALL = {COLOR: PROPS.CONFIG.MODULE_COLOR, SHOW: true};
                    //PROPS.CONFIG.HORIZONT = 78
                    UM_STORE.onHorizont = true
                    UM_STORE.noBottom = false
                }
                break;
            default:
                break;
        }

        eventBus.emit("A:SelectModelOption")

        return curOpt.active;
    };

    const checkExeptionOptionForFasade = (options, global) => {
        const {PROPS} = modelState.getCurrentModel.userData;
        const {FASADE_PROPS} = PROPS.CONFIG
        const prepareColorId = FASADE_PROPS.map(el => {
            return el.COLOR
        })
        const result = filterGroups(options, prepareColorId, global)

        return result
    }

    const filterOptions = () => {
        const data = appData.getAppData
        const options = data.OPTION
        const optGroup = data.OPTIONS_GROUP
        const {PROPS} = modelState.getCurrentModel.userData;
        const curOptions = PROPS.CONFIG.OPTIONS

        let filtered = []
        const curOptionsList = curOptions
            .map(el => {
                return {...options[el.id], active: el.active, visible: el.visible}
            })
            .filter(Boolean);

        for (const el in optGroup) {

            filtered.push({
                NAME: optGroup[el].NAME,
                CONTANT: curOptionsList.filter(opt => opt.GROUP == el)
            })
        }

        const checkExeption = curOptionsList.filter(el => el.GROUP == null)
        filtered.push({
            NAME: '',
            CONTANT: checkExeption
        })

        filtered = filtered.filter(item => {
            if (item.CONTANT.length > 0) return item

        })

        return filtered
    }

    const filterGroups = (groups, incomingIds, global) => {
        const idStrs = incomingIds.map(id => id.toString());
        const tmp_active_options = global?.slice().filter(item => item.active === true).map(item => {
            return +item.id
        }) || []

        let result = groups.map(group => {
            const contant = group.CONTANT;

            // Проверяем, есть ли в CONTANT хотя бы один элемент с хотя бы одним incomingId в SHOW_ON_FASADE
            const hasMatching = contant.some(item =>
                item.SHOW_ON_FASADE && idStrs.some(idStr => item.SHOW_ON_FASADE.includes(idStr))
            );

            // Маппим CONTANT, создавая новые объекты с обновленным visible
            const modifiedContant = contant.filter(item => item.ID).map(item => {

                let shouldBeVisible;
                if (!hasMatching) {
                    // Если нет совпадений, видимыми остаются только с пустым SHOW_ON_FASADE
                    shouldBeVisible = !item.SHOW_ON_FASADE || item.SHOW_ON_FASADE.length === 0;
                } else {
                    // Если есть совпадения, видимыми только те, где есть хотя бы один incomingId в SHOW_ON_FASADE
                    // и ID элемента не входит в его собственный SHOW_ON_WITH
                    if (item.SHOW_ON_FASADE && idStrs.some(idStr => item.SHOW_ON_FASADE.includes(idStr))) {
                        const myId = item.ID;
                        const showOnWith = item.SHOW_ON_WITH || [];
                        // Очищаем от trailing \t для корректного сравнения
                        const cleanShowOnWith = showOnWith.map(s => s.replace(/\t$/, ''));
                        shouldBeVisible = !cleanShowOnWith.includes(myId);
                    } else {
                        shouldBeVisible = false;
                    }
                }

                if (global) {
                    const curOptionInConfig = global.find(el => el.id === item.ID)

                    if (curOptionInConfig) {
                        curOptionInConfig.visible = shouldBeVisible
                        if (!shouldBeVisible) {
                            curOptionInConfig.active = false
                        }

                        if (item.REQUIRED_OPTIONS.length > 0) {
                            let check = false
                            for(let option of item.REQUIRED_OPTIONS){
                                if(tmp_active_options.includes(+option)) {
                                    check = true
                                    break;
                                }
                            }
                            if(!check){
                                curOptionInConfig.active = item.active = false;
                                curOptionInConfig.visible = shouldBeVisible = false
                                eventBus.emit("A:SelectModelOption")
                            }
                        }


                    } else {
                        return
                    }
                }

                return {
                    ...item,
                    visible: shouldBeVisible
                };
            });


            let visible_contant = modifiedContant.filter(item => item.visible === true)
            if(visible_contant.length) {
                checkNecessaryOptions(visible_contant, global)
                return {
                    ...group,
                    CONTANT: visible_contant
                };
            }
        });

        return result.filter(item => item);
    }

    //Обязательная установка хотя бы одной опции активной
    const checkNecessaryOptions = (contant: any[], global?: any[]) => {
        if(contant.length > 0) {
            contant.forEach((optionCurrent) => {
                if (optionCurrent.CLOSE_OTHER_OPTIONS === '1') {
                    let closeOptions = []

                    contant.forEach(_item2 => {
                        if (_item2.CLOSE_OTHER_OPTIONS === '1' &&
                            (_item2.IBLOCK_SECTION_ID?.[0] === optionCurrent.IBLOCK_SECTION_ID?.[0])) {
                            closeOptions.push(_item2)
                        }
                    });

                    if(!closeOptions.find(item => item.active)) {
                        optionCurrent.active = true
                        if (global) {
                            const curOptionInConfig = global?.find(el => el.id === optionCurrent.ID)
                            curOptionInConfig ? curOptionInConfig.active = optionCurrent.active : false
                        }
                        eventBus.emit("A:SelectModelOption")
                    }
                }
            })
        }
        else if (global?.length) {
            global.forEach((optionCurrent) => {
                if (optionCurrent.close === '1') {
                    let closeOptions = []

                    global.forEach(_item2 => {
                        if (_item2.close === '1' &&
                            (_item2.section === optionCurrent.section)) {
                            closeOptions.push(_item2)
                        }
                    });

                    if(!closeOptions.find(item => item.active)) {
                        optionCurrent.active = true
                        eventBus.emit("A:SelectModelOption")
                    }
                }
            })
        }
    }

    const processVisibility = (groups: any[], incomingIds: any[], global?: any[]) => {
        const idStrs = incomingIds.map(id => id.toString());
        groups.forEach(group => {
            const contant = group.CONTANT;
            // Проверяем, есть ли в CONTANT хотя бы один элемент с хотя бы одним incomingId в SHOW_ON_FASADE
            const hasMatching = contant.some(item =>
                item.SHOW_ON_FASADE && idStrs.some(idStr => item.SHOW_ON_FASADE.includes(idStr))
            );

            contant.forEach(item => {
                let shouldBeVisible: boolean;
                if (!hasMatching) {
                    // Если нет совпадений, видимыми остаются только с пустым SHOW_ON_FASADE
                    shouldBeVisible = !item.SHOW_ON_FASADE || item.SHOW_ON_FASADE.length === 0;
                } else {
                    // Если есть совпадения, видимыми только те, где есть хотя бы один incomingId в SHOW_ON_FASADE
                    // и ID элемента не входит в его собственный SHOW_ON_WITH
                    if (item.SHOW_ON_FASADE && idStrs.some(idStr => item.SHOW_ON_FASADE.includes(idStr))) {
                        const myId = item.ID;
                        const showOnWith = item.SHOW_ON_WITH || [];
                        // Очищаем от trailing \t для корректного сравнения
                        const cleanShowOnWith = showOnWith.map(s => s.replace(/\t$/, ''));
                        shouldBeVisible = !cleanShowOnWith.includes(myId);
                    } else {
                        shouldBeVisible = false;
                    }
                }

                if (global) {
                    const curOptionInConfig = global.find(el => el.id === item.ID)
                    curOptionInConfig.visible = shouldBeVisible
                    if (!shouldBeVisible) {
                        curOptionInConfig.active = false
                    }
                }
            });
        });
    };

    const resetGlobal = () => {
        const {PROPS} = modelState.getCurrentModel.userData;
        const {FASADE_PROPS, OPTIONS} = PROPS.CONFIG
        const prepareColorId = FASADE_PROPS.map(el => {
            return el.COLOR
        })
        const filtered = filterOptions()
        processVisibility(filtered, prepareColorId, OPTIONS)
        PROPS.CONFIG.MECHANISM = null
        PROPS.CONFIG.MECHANISM_TEMP = []

    }

    return {createOptionList, checkActive, resetGlobal}
}