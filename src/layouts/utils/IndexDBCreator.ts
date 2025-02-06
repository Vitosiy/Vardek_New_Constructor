export function indexDBCreator(fullData: any) {
  let db: IDBDatabase;
  let openRequest = indexedDB.open("storage", 1);

  openRequest.onupgradeneeded = function () {
    db = openRequest.result;
    db.createObjectStore("data", {keyPath: 'name'});
  }; 

  openRequest.onsuccess = function () {
    let transaction = db.transaction('data', "readwrite")
    let data = transaction.objectStore('data')
    let dbData = {...{name: 'db', ...fullData}}
    let request =  data.add(dbData) 
    
    request.onsuccess = function () { // (4)
      let req = data.getAll()
      req.onsuccess = () => {
        console.log(req.result, 'this is data');
      }
      
    };
  
    request.onerror = function () {
      console.log("Ошибка", request.error);
    };
  };
  
  openRequest.onerror = function () {
    console.error("Error", openRequest.error);
  };
}