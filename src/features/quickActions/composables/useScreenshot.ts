import { useRouter } from 'vue-router'

const SCENE_ID_2D = 'constructor2D'
const SCENE_SELECTOR_3D = '.scene-container'

export const useScreenshot = () => {
  const router = useRouter()

  const makeScreen = () => {
    console.log('makeScreen')
  }


  return { makeScreen }
} 