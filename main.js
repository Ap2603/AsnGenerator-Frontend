const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const backendIp = '192.168.1.73'; // Replace with the IP address of your backend server

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.on('focus', () => {
    console.log('Main window focused');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Main window finished loading');
  });

  mainWindow.on('blur', () => {
    console.log('Main window blurred');
  });
}

function loadPageBasedOnRole(role) {
  if (role === 'admin') {
    mainWindow.loadFile('dashboard.html');
  } else {
    mainWindow.loadFile('barcodes.html');
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('download-asn', async (event, shipmentId, token) => {
  const fetch = await import('node-fetch').then(module => module.default);

  try {
    console.log(`Fetching ASN for shipment ID: ${shipmentId}`);
    const response = await fetch(`http://${backendIp}:8080/api/exportASN?shipment_id=${shipmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    const filePath = dialog.showSaveDialogSync({
      title: 'Save ASN File',
      defaultPath: `${shipmentId}-ASN.xlsx`,
      buttonLabel: 'Save',
      filters: [
        { name: 'Excel Files', extensions: ['xlsx'] },
      ],
    });

    if (filePath) {
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`File saved to: ${filePath}`);
      return { success: true, filePath };
    } else {
      console.log('File save cancelled');
      return { success: false, message: 'File save cancelled' };
    }
  } catch (error) {
    console.error('Error downloading ASN:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('restart-app', () => {
  app.relaunch();
  app.exit();
});

ipcMain.handle('fetch-po-numbers', async (event, token) => {
  const fetch = await import('node-fetch').then(module => module.default);

  try {
    const response = await fetch(`http://${backendIp}:8080/api/getPONumbers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const poNumbers = await response.json();
    return { success: true, poNumbers };
  } catch (error) {
    console.error('Error fetching PO numbers:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('fetch-shipment-ids', async (event, token) => {
  const fetch = await import('node-fetch').then(module => module.default);

  try {
    const response = await fetch(`http://${backendIp}:8080/api/getShipmentIDs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const shipmentIDs = await response.json();
    return { success: true, shipmentIDs };
  } catch (error) {
    console.error('Error fetching shipment IDs:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('query-barcode', async (event, gtin, sscc, poNumber, shipmentId, token) => {
  const fetch = await import('node-fetch').then(module => module.default);

  try {
    const response = await fetch(`http://${backendIp}:8080/api/queryBarcode`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ gtin, sscc, poNumber, shipmentId })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('Error querying barcode:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('load-page-based-on-role', (event, role) => {
  loadPageBasedOnRole(role);
});

ipcMain.handle('fetch-asn-status', async (event, shipmentId, token) => {
  const fetch = await import('node-fetch').then(module => module.default);

  try {
    const response = await fetch(`http://${backendIp}:8080/api/viewASN?shipmentId=${shipmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      if (response.status === 204) {
        return { success: true, asnStatus: [] };
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const asnStatus = await response.json();
    return { success: true, asnStatus };
  } catch (error) {
    console.error('Error fetching ASN status:', error);
    return { success: false, message: error.message };
  }
});
ipcMain.handle('add-shipment-id', async (event, shipmentId, token) => {
  const fetch = await import('node-fetch').then(module => module.default);

  try {
    const response = await fetch(`http://${backendIp}:8080/api/addShipmentID`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ shipment_id: shipmentId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('Error adding shipment ID:', error);
    return { success: false, message: error.message };
  }
});


