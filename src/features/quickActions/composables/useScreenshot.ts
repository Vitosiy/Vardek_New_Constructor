export const useScreenshot = () => {
  const makeScreen = async () => {
    // Берём PixiJS Application из window
    const app = (window as any)?.C2D?.app2d;
    if (!app) {
      console.error('PixiJS app не найден в window.C2D.app2d');
      return;
    }

    try {
      // Получаем base64 текущего кадра (Promise<string>)
      const base64 = await app.renderer.extract.base64(app.stage);

      // Преобразуем base64 в Blob
      const byteString = atob(base64.split(',')[1]);
      const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];

      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeString });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'pixi-screenshot.png';
      a.click();
      URL.revokeObjectURL(a.href);

    } catch (err) {
      console.error('Ошибка при создании скрина:', err);
    }
  };

  return { makeScreen };
};
