//@ts-nocheck
import {useAppData} from "@/store/appliction/useAppData";
import {useModelState} from "@/store/appliction/useModelState";
import {useEventBus} from "@/store/appliction/useEventBus";
import {useMechanism} from "./Mechanism/useMechanism";

const mechanism = useMechanism()


export const useRailsRightPage = () => {

    const appData = useAppData();
    const modelState = useModelState();
    const eventBus = useEventBus();
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

        }
        eventBus.emit("A:SelectModelOption")

        if (!curOpt) return;

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
                                PROPS.CONFIG.HORIZONT = 78
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
            case 7250589:   //Металлическая царга
                if (curOpt.active) {
                    PROPS.CONFIG.TSARGA = {TYPE: 'metal', COLOR: 79065}
                } else
                    delete PROPS.CONFIG.TSARGA
                break;
            case 5738924:   //Без дна
                if (curOpt.active) {
                    PROPS.CONFIG.BACKWALL = {COLOR: false, SHOW: false};
                    PROPS.CONFIG.HORIZONT = 0
                } else {
                    PROPS.CONFIG.BACKWALL = {COLOR: PROPS.CONFIG.MODULE_COLOR, SHOW: true};
                    PROPS.CONFIG.HORIZONT = 78
                }
                break;
            default:
                break;
        }

        eventBus.emit("A:SelectModelOption")

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
        return groups.map(group => {
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
                    } else {
                        return
                    }
                }

                return {
                    ...item,
                    visible: shouldBeVisible
                };
            });

            return {
                ...group,
                CONTANT: modifiedContant
            };
        });
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