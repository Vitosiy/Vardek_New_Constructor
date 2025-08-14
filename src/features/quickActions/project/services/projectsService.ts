import { postRequest, _GET_URL, _POST_URL, _GET_PROJECT, _UPDATE_PROJECT } from '@/types/constants'

export const projectsService = {
  async getProjects(): Promise<any> {
    const data = {
      user_hash: '08a57654db94bdcfe44a9ee10b2f0778',
      city: 17281,
      designer: '14240',
      page: 1,
      config: 43830,
      type: 'user',
    }
    return await postRequest(`${_GET_URL}`, data)
  },

  async getProject(id: string): Promise<any> {
    const data = { id }
    return await postRequest(`${_GET_PROJECT}`, data)
  },

  async saveProject(payload: any): Promise<any> {
    const data = { data: payload }
    return await postRequest(`${_POST_URL}`, data)
  },

  async updateProject(id: string, project: any): Promise<any> {
    const data = { id, project }
    return await postRequest(`${_UPDATE_PROJECT}`, data)
  },
}


