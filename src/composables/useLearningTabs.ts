import { ref } from "vue";
import { client } from "@/api/api";
import { TabContent, TabNode } from "@/api/types";

export interface UseLearningTabs {
    fetchTree: () => Promise<void>;
    getTree: () => TabNode[];

    fetchTabContent: (id: TabNode["id"]) => Promise<void>;
    getTabContent: () => TabContent | undefined;

    hasErrorTree: boolean;
    loadingTree: boolean;
    hasErrorContent: boolean;
    loadingContent: boolean;
}
// TODO: add notifications
export const useLearningTabs = (): UseLearningTabs => {
    const tabs = ref<TabNode[]>([]);
    const tabContent = ref<TabContent>();
    const hasErrorTree = ref<boolean>(false);
    const loadingTree = ref<boolean>(false);
    const hasErrorContent = ref<boolean>(false);
    const loadingContent = ref<boolean>(false);

    const fetchTree = async () => {
        loadingTree.value = true;
        hasErrorTree.value = false;

        const { data, error } = await client.GET("/api/tabs/tree");

        if (error) 
            hasErrorTree.value = true;

        if (data) {
            tabs.value = data
        }

        loadingTree.value = false;
    };
    
    const getTree = () => {
        return tabs.value;
    };

    const fetchTabContent = async (id: TabNode["id"]) => {
        loadingContent.value = true;
        hasErrorContent.value = false;

        const { data, error } = await client.GET("/api/tabs/{id}/content", {
            params: { path: { id } }
        });

        if (error) 
            hasErrorContent.value = true;

        if (data) {
            tabContent.value = data;
        }

        loadingContent.value = false;
        // TODO
        // const foundTab = tabs.value.find(tab => tab.id === id);
        // if (!foundTab) {
        //     throw new Error(`Tab with id ${id} not found`);
        // }
    };

    const getTabContent = (): TabContent | undefined => {
        return tabContent.value;
    };

    return {
        fetchTree,
        getTree,
        fetchTabContent,
        getTabContent,
        hasErrorTree: hasErrorTree.value,
        loadingTree: loadingTree.value,
        hasErrorContent: hasErrorContent.value,
        loadingContent: loadingContent.value,
    };
};