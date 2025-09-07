import { useScreenshotsStore, IScreenshot } from "@/features/store/screenshotsStore/screenshotsStore";

export const usePrint = () => {
  const printPage = async () => {
    try {
      // Получаем store скриншотов
      const screenshotsStore = useScreenshotsStore();
      const screenshots: IScreenshot[] = screenshotsStore.getScreenshots();
      
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
        items: [
          {
            name: 'Пенал низкий с дверью',
            bodyColor: 'Белый W3341',
            facadeColor: 'Без фасада',
            quantity: 1,
            price: 8855,
            amount: 8855,
            amountWithoutDiscount: 11807
          }
        ],
        total: 8855,
        totalWithoutDiscount: 11807
      };

      // Показываем индикатор загрузки
      console.log('Подготовка к печати...');

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
          
          roomScreenshots.forEach((screenshot: IScreenshot, index: number) => {
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
            <div class="cart-items">
              ${cartData.items.map(item => `
                <div class="cart-item">
                  <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-color">Цвет корпуса: ${item.bodyColor}</p>
                    <p class="item-facade">Цвет фасада: ${item.facadeColor}</p>
                  </div>
                  <div class="item-quantity">
                    <span class="quantity-label">Количество:</span>
                    <span class="quantity-value">${item.quantity}</span>
                  </div>
                  <div class="item-price">
                    <span class="price-label">Цена:</span>
                    <span class="price-value">${item.price.toLocaleString()} ₽</span>
                  </div>
                  <div class="item-amount">
                    <span class="amount-label">Сумма:</span>
                    <span class="amount-value">${item.amount.toLocaleString()} ₽</span>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="cart-summary">
              <div class="summary-row">
                <span class="summary-label">Итого без скидки:</span>
                <span class="summary-value total-no-discount">${cartData.totalWithoutDiscount.toLocaleString()} ₽</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Итого со скидкой:</span>
                <span class="summary-value total-price">${cartData.total.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        </div>
      `;

      // Добавляем стили для печати
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
          padding: 20px;
          max-width: 210mm;
          margin: 0 auto;
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
          padding: 15px;
          border-radius: 8px;
          background-color: #f9f9f9;
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
          height: auto;
          max-height: 400px;
          object-fit: contain;
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
        
        .cart-items {
          margin-bottom: 30px;
        }
        
        .cart-item {
          border: 1px solid #ddd;
          padding: 20px;
          margin-bottom: 15px;
          border-radius: 8px;
          background-color: #f9f9f9;
        }
        
        .item-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #333;
        }
        
        .item-color, .item-facade {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .item-quantity, .item-price, .item-amount {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          padding: 8px 0;
          border-top: 1px solid #eee;
        }
        
        .quantity-label, .price-label, .amount-label {
          font-size: 14px;
          color: #555;
          font-weight: 500;
        }
        
        .quantity-value, .price-value, .amount-value {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        
        .cart-summary {
          border-top: 2px solid #333;
          padding-top: 20px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding: 10px 0;
        }
        
        .summary-label {
          font-size: 16px;
          color: #555;
          font-weight: 500;
        }
        
        .summary-value {
          font-size: 18px;
          font-weight: 600;
        }
        
        .summary-value.total-price {
          font-size: 18px;
        }
        
        .summary-value.total-no-discount {
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