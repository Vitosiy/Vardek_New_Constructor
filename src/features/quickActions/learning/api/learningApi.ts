import { client } from '@/api/api';
import type { TabContent, TabNode } from '@/api/types';
import { transformEducationTreeFromMap } from './transform';

export const educationApi = {
  async getTree() {
    // const mocked = { data: mockTabs, error: false  as const }
    // return mocked
    const res = await client.GET('/api/modeller/Education/gettree/');

    //TODO перенести в хук индекса - теперь будем работать с этой структурой
    const envelope: any = res.data as any;
    const map = envelope?.DATA as Record<string, unknown> | undefined;
    if (map && typeof map === 'object') {
      const transformed: TabNode[] = transformEducationTreeFromMap(map);
      return { data: transformed, error: res.error } as { data: TabNode[] | undefined; error: typeof res.error };
    }
    
    return { data: undefined, error: res.error } as { data: TabNode[] | undefined; error: typeof res.error };
  },

  async getById(id: TabContent["id"]) {
    // const mocked = { data: mockTabContent, error: false as const }
    // return mocked
    return client.GET('/api/modeller/Education/getbyid/ID/{id}/', {
      params: { path: { id } },
    });
  },
} as const;