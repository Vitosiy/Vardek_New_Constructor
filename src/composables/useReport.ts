import { ref } from "vue";
import { client } from "@/api/api";

export interface UseReport {
    sendReport: (text: string) => Promise<void>;
    hasError: boolean;
    loading: boolean;
}

// TODO: add notifications
export const useReport = (): UseReport => {
    const hasError = ref<boolean>(false);
    const loading = ref<boolean>(false);

    const sendReport = async (text: string) => {
        loading.value = true;
        hasError.value = false;

        const { error } = await client.POST("/api/tabs/report", {
            body: { text }
        });

        if (error) 
            hasError.value = true;

        loading.value = false;
    };

    return {
        sendReport,
        hasError: hasError.value,
        loading: loading.value,
    };
};
