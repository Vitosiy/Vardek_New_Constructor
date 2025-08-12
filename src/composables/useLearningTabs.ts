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

type NodeState = TabNode & { open: boolean }
// TODO: add notifications
export const useLearningTabs = (): UseLearningTabs => {
    //TODO to reactive?
    const tabs = ref<TabNode[]>([]);
    const treeState = ref<NodeState[]>([]);
    const tabContent = ref<TabContent>();
    const hasErrorTree = ref<boolean>(false);
    const loadingTree = ref<boolean>(false);
    const hasErrorContent = ref<boolean>(false);
    const loadingContent = ref<boolean>(false);

    // Моки для дерева (3 уровня)
    const mockTabs: TabNode[] = [
        {
            id: 1,
            title: 'Кухонные шкафы',
            children: [
                {
                    id: 11,
                    title: 'Верхние шкафы',
                    children: [
                        { id: 111, title: 'Шкаф 60 см', children: [] },
                        { id: 112, title: 'Шкаф 80 см', children: [] },
                    ],
                },
                {
                    id: 12,
                    title: 'Нижние шкафы',
                    children: [
                        { id: 121, title: 'Шкаф под мойку', children: [] },
                    ],
                },
            ],
        },
        {
            id: 2,
            title: 'Столешница',
            children: [
                {
                    id: 21,
                    title: 'Материалы',
                    children: [
                        { id: 211, title: 'ЛДСП', children: [] },
                        { id: 212, title: 'Камень', children: [] },
                    ],
                },
            ],
        },
        {
            id: 3,
            title: 'Бытовая техника',
            children: [
                {
                    id: 31,
                    title: 'Встраиваемая',
                    children: [
                        { id: 311, title: 'Духовой шкаф', children: [] },
                    ],
                },
            ],
        },
    ];

    // Мок для контента таба
    const mockTabContent: TabContent = {
        id: 1,
        title: 'Моковый таб',
        content: {
            text: 'Это моковый контент для выбранного таба.',
            images: ['https://via.placeholder.com/100'],
            videos: [],
            links: [
                { label: 'Google', url: 'https://google.com' },
            ],
        },
    };

    const fetchTree = async () => {
        loadingTree.value = true;
        hasErrorTree.value = false;

        const { data, error } = await client.GET("/api/tabs/tree");

        if (error) {
            hasErrorTree.value = true;
        }

        if (data) {
            tabs.value = data;
        }

        // TODO
        console.log('mockTabs', mockTabs);
        tabs.value = mockTabs;
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

        if (error) {
            hasErrorContent.value = true;
            tabContent.value = { ...mockTabContent, id, title: `Моковый таб ${id}` };
        }

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

    const getTreeState = () => {
        return treeState.value;
    };

    const toggleNode = (id: TabNode["id"], open: boolean) => {
        const node = treeState.value.find(node => node.id === id);
        if (node) {
            node.open = open;
        }
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