export const _URL = 'https://dev.vardek.online'
// export const _POST_URL ='/local/templates/constructor'
export const _POST_URL = 'https://dev.vardek.online/api/modeller/projectq/SaveProject/'
export const _GET_URL='https://dev.vardek.online/api/modeller/projectq/getprojectlist/'
export const _GET_PROJECT='https://dev.vardek.online/api/modeller/projectq/getprojectbyid/'
export const _UPDATE_PROJECT='https://dev.vardek.online/api/modeller/projectq/updateprojectbyid/'
// export const devHash = '08a57654db94bdcfe44a9ee10b2f0778'
/**
 * Универсальная функция для отправки POST-запросов через fetch
 * @param url - адрес запроса
 * @param data - тело запроса (объект, FormData или Blob)
 * @param isJson - если true, тело будет сериализовано как JSON
 * @param extraHeaders - дополнительные заголовки, если нужно
 * @returns Ответ сервера или ошибка
 */
export async function postRequest(
    url: string,
    data: any,
    isJson: boolean = true,
    extraHeaders: Record<string, string> = {}
): Promise<any> {
    try {
        const headers: Record<string, string> = { ...extraHeaders };

        let body: BodyInit;

        if (isJson) {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(data);
        } else if (data instanceof FormData || data instanceof Blob) {
            // Content-Type будет установлен автоматически
            body = data;
        } else {
            throw new Error('Unsupported data type');
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Ошибка ${response.status}: ${text}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error('POST-запрос не удался:', error);
        throw error;
    }
}

//user_hash:'08a57654db94bdcfe44a9ee10b2f0778',
//city:17281
//designer: '14240' || 'L'
//page: 1,
//config: 43830,
//type: "user"

/** _______________ */
// type: "SaveProject",
// data: {
//   file: "data:image/jpeg;base64,",
//   provider: "vardek",
//   name: "test_new_constructor",
//   user_hash: "08a57654db94bdcfe44a9ee10b2f0778",
//   city: 17281,
//   project: project,
//   style: "689680",
//   projectId: Date.now().toString(),
//   user_id: "14240",
// },
