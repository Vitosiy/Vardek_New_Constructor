import { useScreenshotsStore, IScreenshot } from "@/features/store/screenshotsStore/screenshotsStore";
import { useBasketStore } from "@/store/appStore/useBasketStore";
import { useRoomState } from "@/store/appliction/useRoomState";
import { _URL } from "@/types/constants";
import { useAppData } from "@/store/appliction/useAppData";

export const usePrint = () => {
  const printPage = async () => {
    try {
      // Получаем store скриншотов
      const screenshotsStore = useScreenshotsStore();
      const screenshots: IScreenshot[] = screenshotsStore.getScreenshots();

      const basketStore = useBasketStore();
      const roomState = useRoomState();

      // Для печати используем те же данные, что и во вкладке "Все комнаты": объединённая корзина всех комнат
      const rooms = roomState.getRooms || [];
      const mergedBasketItems = rooms.flatMap((room: { basket?: string | unknown }) => {
        try {
          const raw = room.basket;
          const roomBasket =
            typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? { scene: raw, catalog: [] } : { scene: [], catalog: [] };
          return [
            ...(roomBasket.scene || []),
            ...(roomBasket.catalog || []),
          ];
        } catch {
          return [];
        }
      });

      if (mergedBasketItems.length > 0) {
        await basketStore.syncBasketMulti(mergedBasketItems);
      }

      const basketData = basketStore.basketData;
      
      // Получаем данные приложения для доступа к названиям цветов
      const appDataStore = useAppData();
      const appData = appDataStore.getAppData;
      
      // Функция для получения названия цвета корпуса
      const getBodyColorName = (colorId: any): string => {
        if (!colorId) return '—';
        if (appData?.COLOR && appData.COLOR[colorId]) {
          return appData.COLOR[colorId].NAME || `Цвет ${colorId}`;
        }
        if (appData?.FASADE && appData.FASADE[colorId]) {
          return appData.FASADE[colorId].NAME || `Цвет ${colorId}`;
        }
        return `Цвет ${colorId}`;
      };
      
      // Функция для получения названия цвета фасада
      const getFacadeColorName = (colorId: any): string => {
        if (!colorId) return 'Без фасада';
        if (appData?.FASADE && appData.FASADE[colorId]) {
          return appData.FASADE[colorId].NAME || `Фасад ${colorId}`;
        }
        return `Фасад ${colorId}`;
      };
      
      console.log('Найдено скриншотов для печати:', screenshots.length);
      if (screenshots.length > 0) {
        console.log('Детали скриншотов:', screenshots.map(s => ({
          room: s.roomLabel,
          mode: s.mode,
          timestamp: new Date(s.timestamp).toLocaleString()
        })));
      }
      
      // Данные корзины (можно передавать как параметр)
      const cartData = {
        items: basketData?.products?.map((item: any) => {
          // Парсим форматированные строки в числа для расчетов
          const parsePrice = (priceStr: string | undefined): number => {
            if (!priceStr) return 0;
            // Убираем все символы кроме цифр и запятой/точки
            const cleaned = priceStr.replace(/[^\d,.-]/g, '').replace(',', '.');
            return parseFloat(cleaned) || 0;
          };

          const unitPrice = parsePrice(item.product?.unitPriceFormat);
          const allPrice = parsePrice(item.product?.allPriceFormat);
          const allPriceOld = parsePrice(item.product?.allPriceOldFormat);
          const quantity = item.product?.quantity || 1;

          return {
            name: item.product?.NAME || 'Неизвестный товар',
            bodyColor: getBodyColorName(item.product?.PROPS?.BODY?.COLOR),
            facadeColor: getFacadeColorName(item.product?.PROPS?.FASADE?.[0]?.COLOR),
            quantity: quantity,
            price: unitPrice,
            amount: allPrice,
            amountWithoutDiscount: allPriceOld,
            previewPicture: item.product?.PREVIEW_PICTURE || null
          };
        }) || [],
        total: basketData?.basket?.sum || 0,
        totalWithoutDiscount: basketData?.basket?.sumOld || 0
      };

      // Показываем индикатор загрузки
      console.log('Подготовка к печати...');

      // Удаляем старые элементы печати, если они существуют
      const existingPrintDiv = document.getElementById('print-content');
      if (existingPrintDiv) {
        // Очищаем созданные URL для Blob объектов перед удалением
        const existingImages = existingPrintDiv.querySelectorAll('img');
        existingImages.forEach(img => {
          if (img.src.startsWith('blob:')) {
            URL.revokeObjectURL(img.src);
          }
        });
        document.body.removeChild(existingPrintDiv);
      }

      // Создаём скрытый div с печатным содержимым
      const printDiv = document.createElement('div');
      printDiv.id = 'print-content';
      
      // Добавляем каждую комнату на отдельную страницу
      if (screenshots.length > 0) {
        // Группируем скриншоты по комнатам
        const roomGroups = new Map<string, IScreenshot[]>();
        screenshots.forEach((screenshot: IScreenshot) => {
          if (!roomGroups.has(screenshot.roomId)) {
            roomGroups.set(screenshot.roomId, []);
          }
          roomGroups.get(screenshot.roomId)!.push(screenshot);
        });
        
        let isFirstRoom = true;
        roomGroups.forEach((roomScreenshots: IScreenshot[], roomId: string) => {
          const roomLabel = roomScreenshots[0]?.roomLabel || `Комната ${roomId}`;
          
          let roomHTML = `
            <div class="a4-page">
              <div class="screenshot-container">
          `;
          
          // Добавляем заголовок только на первую страницу
          if (isFirstRoom) {
            roomHTML += `<h2 class="print-title">3D Скриншоты проекта</h2>`;
            isFirstRoom = false;
          }
          
          roomHTML += `
                <div class="room-section">
                  <h3 class="room-title">${roomLabel}</h3>
                  <div class="room-screenshots">
          `;
          
          roomScreenshots.forEach((screenshot: IScreenshot) => {
            const modeText = screenshot.mode === 'drawing' ? 'Режим чертежа' : 'Обычный режим';
            const blobUrl = URL.createObjectURL(screenshot.blob);
            
            roomHTML += `
              <div class="screenshot-item">
                <h4 class="screenshot-mode">${modeText}</h4>
                <img src="${blobUrl}" alt="${screenshot.fileName}" class="screenshot-image" />
                <p class="screenshot-info">Создан: ${new Date(screenshot.timestamp).toLocaleString()}</p>
              </div>
            `;
          });
          
          roomHTML += `
                  </div>
                </div>
              </div>
            </div>
          `;
          
          printDiv.innerHTML += roomHTML;
        });
      }

            // Добавляем данные корзины
            printDiv.innerHTML += `
            <div class="a4-page">
              <div class="cart-section">
                <h2 class="print-title">Данные корзины</h2>
                ${cartData.items.length > 0 ? `
                <table class="cart-table">
                  <thead>
                    <tr>
                      <th>Фото</th>
                      <th>Наименование</th>
                      <th>Количество</th>
                      <th>Цена</th>
                      <th>Сумма</th>
                      <th>Сумма без скидки</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${cartData.items.map(item => `
                  <tr>
                    <td class="item-photo">
                      ${item.previewPicture ? `<img src="${_URL}${item.previewPicture}" alt="${item.name}" class="item-photo-img" />` : '—'}
                    </td>
                    <td class="item-name">
                      ${item.name}<br/>
                      <small style="color: #666;">Цвет корпуса: ${item.bodyColor}</small><br/>
                      <small style="color: #666;">Фасад: ${item.facadeColor}</small>
                    </td>
                    <td class="item-quantity">${item.quantity}</td>
                    <td class="item-price">${item.price.toLocaleString('ru-RU')} ₽</td>
                    <td class="item-amount">${item.amount.toLocaleString('ru-RU')} ₽</td>
                    <td class="item-amount-no-discount">${item.amountWithoutDiscount.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                `).join('')}
                  </tbody>
                  <tfoot>
                    <tr class="summary-row">
                      <td colspan="4" class="summary-label">Итого без скидки:</td>
                      <td colspan="2" class="summary-value total-no-discount">${cartData.totalWithoutDiscount.toLocaleString('ru-RU')} ₽</td>
                    </tr>
                    <tr class="summary-row">
                      <td colspan="4" class="summary-label">Итого со скидкой:</td>
                      <td colspan="2" class="summary-value total-price">${cartData.total.toLocaleString('ru-RU')} ₽</td>
                    </tr>
                  </tfoot>
                </table>
                ` : '<p>Корзина пуста</p>'}
              </div>
            </div>
          `;

      // Добавляем стили для печати
      // Удаляем старые стили печати, если они существуют
      const existingStyles = Array.from(document.head.querySelectorAll('style')).find(
        style => style.textContent?.includes('#print-content')
      );
      if (existingStyles) {
        document.head.removeChild(existingStyles);
      }

      const printStyles = document.createElement('style');
      printStyles.textContent = `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content, #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        
        .a4-page {
          page-break-after: always;
          padding: 0px;
          margin: 0;
          max-width: 100%;
        }
        
        .print-title {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 30px;
          color: #333;
        }
        
        .room-section {
          margin-bottom: 30px;
        }
        
        .room-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #444;
          text-align: center;
        }
        
        .room-screenshots {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        .screenshot-item {
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .screenshot-mode {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #555;
          text-align: center;
        }
        
        .screenshot-image {
          width: 100%;
          max-height: 36vh;
          height: auto;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .screenshot-info {
          font-size: 12px;
          color: #666;
          text-align: center;
          margin-top: 10px;
        }
        
        .cart-section {
          margin-top: 30px;
        }
        
        .cart-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .cart-table thead {
          background-color: #f5f5f5;
        }
        
        .cart-table th {
          padding: 12px 8px;
          text-align: left;
          border: 1px solid #ddd;
          font-weight: 600;
          font-size: 14px;
          color: #333;
          background-color: #f5f5f5;
        }
        
        .cart-table th:first-child {
          width: 110px;
          text-align: center;
        }
        
        .cart-table th:nth-child(2) {
          min-width: 200px;
        }
        
        .cart-table th:nth-child(3),
        .cart-table th:nth-child(4),
        .cart-table th:nth-child(5),
        .cart-table th:nth-child(6) {
          width: 100px;
          text-align: right;
        }
        
        .cart-table td {
          padding: 12px 8px;
          border: 1px solid #ddd;
          font-size: 14px;
          color: #555;
          vertical-align: top;
        }
        
        .cart-table tbody tr:nth-child(even) {
          background-color: #fafafa;
        }
        
        .cart-table tbody tr:hover {
          background-color: #f0f0f0;
        }
        
        .item-photo {
          text-align: center;
          color: #999;
          width: 110px;
        }
        
        .item-photo-img {
          max-width: 90px;
          max-height: 90px;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .item-name {
          font-weight: 600;
          color: #333;
        }
        
        .item-quantity {
          text-align: right;
        }
        
        .item-price {
          text-align: right;
        }
        
        .item-amount {
          text-align: right;
          font-weight: 600;
          color: #333;
        }
        
        .item-amount-no-discount {
          text-align: right;
          color: #999;
          text-decoration: line-through;
        }
        
        .cart-table tfoot {
          border-top: 2px solid #333;
          background-color: #f9f9f9;
        }
        
        .cart-table tfoot .summary-row {
          font-weight: 600;
        }
        
        .cart-table tfoot .summary-label {
          text-align: right;
          font-size: 16px;
          color: #555;
          font-weight: 600;
        }
        
        .cart-table tfoot .summary-value {
          text-align: right;
          font-size: 18px;
          font-weight: 600;
        }
        
        .cart-table tfoot .summary-value.total-price {
          color: #333;
        }
        
        .cart-table tfoot .summary-value.total-no-discount {
          color: #999;
          text-decoration: line-through;
        }
      `;

      document.head.appendChild(printStyles);
      document.body.appendChild(printDiv);

      // Ждём загрузки всех изображений перед печатью
      const images = printDiv.querySelectorAll('img');
      if (images.length > 0) {
        console.log(`Ожидаем загрузки ${images.length} изображений...`);
        
        const imagePromises = Array.from(images).map((img, index) => {
          return new Promise<void>((resolve, reject) => {
            // Если изображение уже загружено
            if (img.complete && img.naturalWidth > 0) {
              console.log(`Изображение ${index + 1} уже загружено`);
              resolve();
              return;
            }

            // Обработчики событий
            img.onload = () => {
              console.log(`Изображение ${index + 1} загружено успешно`);
              resolve();
            };
            img.onerror = () => {
              console.warn(`Ошибка загрузки изображения ${index + 1}`);
              reject(new Error(`Ошибка загрузки изображения ${index + 1}`));
            };

            // Таймаут для предотвращения бесконечного ожидания
            const timeout = setTimeout(() => {
              if (img.complete && img.naturalWidth > 0) {
                console.log(`Изображение ${index + 1} загружено по таймауту`);
                resolve();
              } else {
                reject(new Error(`Таймаут загрузки изображения ${index + 1}`));
              }
            }, 5000);

            // Очистка таймаута при успешной загрузке
            img.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
          });
        });

        try {
          await Promise.all(imagePromises);
          console.log('Все изображения успешно загружены, открываю диалог печати...');
        } catch (error) {
          console.warn('Некоторые изображения не загрузились, но продолжаем печать:', error);
        }
      }

      // Печатаем
      window.print();

      // Убираем временные элементы после печати
      window.addEventListener('afterprint', function cleanup() {
        // Очищаем созданные URL для Blob объектов
        const images = printDiv.querySelectorAll('img');
        images.forEach(img => {
          if (img.src.startsWith('blob:')) {
            URL.revokeObjectURL(img.src);
          }
        });
        
        document.head.removeChild(printStyles);
        document.body.removeChild(printDiv);
        window.removeEventListener('afterprint', cleanup);
      });

    } catch (error) {
      console.error('Ошибка при печати:', error);
      window.print?.();
    }
  };

  return { printPage };
};
