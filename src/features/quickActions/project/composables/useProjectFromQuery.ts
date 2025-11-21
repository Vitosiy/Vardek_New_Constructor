// @ts-nocheck
import { useProjectAPI } from "./useProjectAPI";
import { useProjectStore } from "../store/useProjectStore";
import { useSchemeTransition } from "@/store/canvasMerge/schemeTransition";
import { useSceneState } from "@/store/appliction/useSceneState";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useToast } from "@/features/toaster/useToast";
import { useRouter, useRoute } from "vue-router";

export function useProjectFromQuery() {
    const loadProject = async (id: string | number) => {
        const schemeTransition = useSchemeTransition()
        const projectAPI = useProjectAPI()
        const projectState = useProjectStore();
        const sceneState = useSceneState();
        const eventBus = useEventBus();
        const toaster = useToast();
        const router = useRouter();
        if (!id) return;
      
        const projectData = await projectAPI.loadProject(id.toString());
        if (projectData) {
          projectState.resetState();
          projectState.setInitialState(projectData);
          console.log(projectData, "----PROD");
      
          try {
            schemeTransition.clearStore();
            // 1. Обновляем данные проекта в sceneState
            await sceneState.loadProjectFromData(projectData);
            sceneState.updateProjectParams({});
            schemeTransition.setAppData(projectData.rooms);
      
            // 2. Устанавливаем ID проекта в store
            projectState.setProjectId(id.toString());
      
            // 4. Уведомляем о загрузке контента
            eventBus.emit("A:ContantLoaded", true);
      
            toaster.success("Проект загружен");
      
            // 5. Переходим на 2D конструктор
            // await router.push("/2d");
            window.C2D.layers.planner.init(true);
            window.C2D.layers.doorsAndWindows.init(true);
          } catch (error) {
            console.error("Ошибка применения данных проекта:", error);
          }
        }
      };
    
    function accordCheck() {
        const router = useRouter();
        const route = useRoute()
        console.log(route)
       
        const id = route?.query?.projectId 
        if (id) {
            loadProject(id)
        } else {
            router.push({
                path: '/'
            })
        }
    }
    
    return {
        accordCheck
    }
} 
