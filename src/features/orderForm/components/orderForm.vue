<script lang="ts" setup>
    import { useProjectAPI } from '@/features/quickActions/project/composables/useProjectAPI';
    import { normalizer } from '../utils/normalizeFields';

    const { getOrderFormData } = useProjectAPI()
    
    const response = await getOrderFormData()

    if (!response.success || !response.data) {
        console.error('Ошибка загрузки', response.error)
    } else {
        const raw = response.data
        const normalized = normalizer(raw)

        console.log('RAW: ', raw)
        console.log('NORMALIZED: ', normalized)

        console.table(
            normalized.map((f) => ({
            CODE: f.CODE,
            TYPE: f.TYPE,
            REQUIED: f.REQUIED,
            MULTIPLE: f.MULTIPLE,
            MIN: f.MIN,
            MAX: f.MAX,
            DEFAULT_VALUE: f.DEFAULT_VALUE
            }))
        )
    }
</script>

<template> 
    <button @click="getOrderFormData">X</button>
</template>
