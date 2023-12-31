import { musicFileExt, tabInfo } from '@main/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMusicListStore = defineStore('musicListStore', () => {
    const tabsList = ref<tabInfo[]>()
    const musicDataList = ref<musicFileExt[]>()
    const panalTabsList = ref<tabInfo[]>()

    return {
        tabsList,
        musicDataList,
        panalTabsList,
    }
})
