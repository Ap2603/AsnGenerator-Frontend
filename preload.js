const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  downloadAsn: (shipmentId, token) => ipcRenderer.invoke('download-asn', shipmentId, token),
  restartApp: () => ipcRenderer.invoke('restart-app'),
  fetchPONumbers: (token) => ipcRenderer.invoke('fetch-po-numbers', token),
  fetchShipmentIDs: (token) => ipcRenderer.invoke('fetch-shipment-ids', token),
  queryBarcode: (gtin, sscc, poNumber, shipmentId, role, override, token) => ipcRenderer.invoke('query-barcode', gtin, sscc, poNumber, shipmentId, role, override, token),
  loadPageBasedOnRole: (role) => ipcRenderer.invoke('load-page-based-on-role', role),
  fetchASNStatus: (shipmentId, token) => ipcRenderer.invoke('fetch-asn-status', shipmentId, token),
  removeASNEntry: (sscc, poNumber, itemCode, lineNumber, token) => ipcRenderer.invoke('remove-asn-entry', sscc, poNumber, itemCode, lineNumber, token),
  addShipmentID: (shipmentId, token) => ipcRenderer.invoke('add-shipment-id', shipmentId, token)
});
