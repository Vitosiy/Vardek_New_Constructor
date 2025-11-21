
//@ts-nocheck
import { useModelState } from "@/store/appliction/useModelState";
import { useEventBus } from "@/store/appliction/useEventBus";

export const useFigurePlinth = () => {

    const modelState = useModelState();
    const eventBus = useEventBus();

    const checkActive = (value: boolean, key: string | number) => {
        const { PROPS } = modelState.getCurrentModel!.userData;
        const { PLINTH_MESH } = PROPS
        const { PLINTH_ACTIONS } = PROPS.CONFIG;


        const curMesh = PLINTH_MESH.children.find(el => el.userData.type === key)
        const curOpt = PLINTH_ACTIONS[key];
        if (!curOpt) return

        curOpt.value = value;
        curMesh.visible = value;

        eventBus.emit("A:SelectPlinth");
    };

    return { checkActive }

}

