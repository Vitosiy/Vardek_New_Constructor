
//@ts-nocheck
import { useModelState } from "@/store/appliction/useModelState";

export const useFigurePlinth = () => {

    const modelState = useModelState();

    const checkActive = (value: boolean, key: string | number) => {
        const { PROPS } = modelState.getCurrentModel!.userData;
        const { PLINTH_MESH } = PROPS
        const { PLINTH_ACTIONS } = PROPS.CONFIG;

        console.log(PLINTH_MESH.uuid, 'PLINTH_MESH')

        const curMesh = PLINTH_MESH.children.find(el => el.userData.type === key)
        const curOpt = PLINTH_ACTIONS[key];
        if (!curOpt) return

        curOpt.value = value
        curMesh.visible = value

    };

    return { checkActive }

}

