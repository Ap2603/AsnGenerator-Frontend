const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  downloadAsn: (shipmentId, token) => ipcRenderer.invoke('download-asn', shipmentId, token),
  restartApp: () => ipcRenderer.invoke('restart-app'),
  fetchPONumbers: (token) => ipcRenderer.invoke('fetch-po-numbers', token),
  fetchShipmentIDs: (token) => ipcRenderer.invoke('fetch-shipment-ids', token),
  queryBarcode: (gtin, sscc, poNumber, shipmentId, token) => ipcRenderer.invoke('query-barcode', gtin, sscc, poNumber, shipmentId, token),
  loadPageBasedOnRole: (role) => ipcRenderer.invoke('load-page-based-on-role', role)
});
