// @ts-nocheck
import { useProjectAPI } from "./useProjectAPI";
import { useProjectStore } from "../store/useProjectStore";
import { useSchemeTransition } from "@/store/canvasMerge/schemeTransition";
import { useSceneState } from "@/store/appliction/useSceneState";
import { useRoomState } from "@/store/appliction/useRoomState";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useToast } from "@/features/toaster/useToast";
import { useRouter, useRoute } from "vue-router";
import { ProjectTab } from "../types";

export function useProjectFromQuery() {
  const router = useRouter();
  const route = useRoute();
  const toaster = useToast();

  const loadProject = async (id: string | number) => {
    const schemeTransition = useSchemeTransition();
    const projectAPI = useProjectAPI();
    const projectState = useProjectStore();
    const sceneState = useSceneState();
    const roomState = useRoomState();
    const eventBus = useEventBus();

    if (!id) return;

    const projectData = await projectAPI.loadProject(id.toString());
    if (!projectData) return;

    projectState.resetState();
    projectState.setInitialState(projectData);

    try {
      schemeTransition.clearStore();
      // Очищаем текущую комнату перед загрузкой нового проекта
      roomState.clearCurrentRoomId();
      
      await sceneState.loadProjectFromData(projectData);
      sceneState.updateProjectParams({});
      schemeTransition.setAppData(projectData.rooms);

      projectState.setProjectId(id.toString());

      // Устанавливаем первую комнату как текущую активную
      // Ждем, чтобы комнаты успели загрузиться
      await new Promise(resolve => setTimeout(resolve, 100));
      const rooms = roomState.getRooms;
      if (rooms && rooms.length > 0) {
        // Всегда устанавливаем первую комнату из загруженного проекта
        roomState.setCurrentRoomId(rooms[0].id);
      }

      eventBus.emit("A:ContantLoaded", true);
      toaster.success("Проект загружен");

      window.C2D.layers.planner.init(true);
      window.C2D.layers.doorsAndWindows.init(true);
    } catch (error) {
      console.error("Ошибка применения данных проекта:", error);
    }
  };

  const getAllProjectIds = async (
    tab: ProjectTab = "my",
    filters: { name?: string; id?: number } = {}
  ): Promise<(string | number)[]> => {
    const projectAPI = useProjectAPI();

    try {
      const projects = await projectAPI.loadProjects(tab, filters);
      return projects.map(p => p.id);
    } catch (error) {
      console.error("Ошибка получения ID проектов:", error);
      return [];
    }
  };

  /**
   * Основная логика проверки query-параметра
   */
  const accordCheck = async () => {
    const rawId = route.query?.projectId;

    // Если параметр отсутствует — ничего не делаем
    if (!rawId) return;

    const path = route.path; // нужный путь, куда возвращать

    // 1. Проверяем — является ли значение числом
    const id = Number(rawId);

    if (Number.isNaN(id)) {
      toaster.error("Невалидный ID");
      // Очистка query и возврат на path
      //todo 
      const url = new URL(window.location.href);
      url.searchParams.delete('projectId');
      window.history.replaceState({}, '', url.pathname);
      return;
    }

    // 2. Получение всех id
    const projectIds = await getAllProjectIds();

    // 3. Проверка существования id
    if (!projectIds.includes(rawId)) {
      toaster.error("Проект не найден или ссылка невалидна");
      router.replace({ path, query: {} });
      return;
    }

    // 4. Если id валиден — загружаем проект
    await loadProject(id);

    // 5. Убираем query, чтобы ссылки были чистыми
    router.replace({ path, query: {} });
  };

  return {
    accordCheck,
    getAllProjectIds,
  };
}
