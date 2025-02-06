export function indexDBCreator(fullData: any) {
  let db: IDBDatabase;
  let openRequest = indexedDB.open("storage", 1);


  openRequest.onerror = function () {
    console.error("Error", openRequest.error);
  };

  openRequest.onsuccess = function () {
    // продолжить работу с базой данных, используя объект db
    let transaction = db.transaction('data', "readwrite")
    let data = transaction.objectStore('data')
    // let fullData = { name: 'main', id: 20, long: 80 }
    let dbData = {...{name: 'db', ...fullData}}
    let request =  data.add(dbData) 
    
    request.onsuccess = function () { // (4)
      console.log("Книга добавлена в хранилище", request.result);
      console.log(db, 'this is db');
      let req = data.getAll()
      req.onsuccess = () => {
        console.log(req.result, 'this is data');
      }
      
    };
  
    request.onerror = function () {
      console.log("Ошибка", request.error);
    };
  };

  openRequest.onupgradeneeded = function () {
    db = openRequest.result;
    // срабатывает, если на клиенте нет базы данных
    // ...выполнить инициализацию...
    console.log('upgrade!!!!!!!!!!!!!!!!!!');
    db.createObjectStore("data", {keyPath: 'name'});
  }; 
}