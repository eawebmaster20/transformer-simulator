const { contextBridge, ipcRenderer } = require('electron');

// Store the last list of ports to detect changes
let lastPorts = [];

function detectPortChanges(callback) {
  console.log('Starting port monitoring...');
  setInterval(async () => {
    try {
      // Get the current list of ports
      const currentPorts = await ipcRenderer.invoke('list-ports');

      // Find newly added ports
      const addedPorts = currentPorts.filter(
        (port) => !lastPorts.some((p) => p.path === port.path)
      );

      // Find removed ports
      const removedPorts = lastPorts.filter(
        (port) => !currentPorts.some((p) => p.path === port.path)
      );

      // Call the callback if any ports were added or removed
      if (addedPorts.length > 0) {
        callback('connected', addedPorts);
      }
      if (removedPorts.length > 0) {
        callback('disconnected', removedPorts);
      }

      // Update the list of last ports
      lastPorts = currentPorts;
    } catch (error) {
      console.error('Error detecting port changes:', error);
    }
  }, 1000); // Poll every second
}

function writeDataToPort(portPath, data) {
  const port = ipcRenderer.invoke('open-port');
  port.write(data, (err) => {
    if (err) {
      console.error('Error writing to port:', err);
    } else {
      console.log('Data written to port successfully');
    }
  });
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('serialportAPI', {
  listPorts: () => ipcRenderer.invoke('list-ports'),
  openPort: (options) => ipcRenderer.invoke('open-port', options),
  startReading: (delimiter) => ipcRenderer.send('start-reading', delimiter),
  onSerialData: (callback) => ipcRenderer.on('serial-data', (event, data) => callback(data)),
  onDisconnect: (callback) => ipcRenderer.on('serial-disconnect', (event) => callback(event)),

  startPortMonitoring: () => ipcRenderer.send('start-port-monitoring'),
  stopPortMonitoring: () => ipcRenderer.send('stop-port-monitoring'),
  onPortAvailable: (callback) => ipcRenderer.on('port-available', (event, port) => callback(port)),
  onPortUnavailable: (callback) => ipcRenderer.on('port-unavailable', (event, port) => callback(port)),
  monitorPorts: (callback) => detectPortChanges(callback),
  writeToPort: (portPath, data) => writeDataToPort(portPath, data),
  connectToPort: (portName, baudRate) =>
    ipcRenderer.send('connect-to-port', portName, baudRate),
  sendData: (data) => ipcRenderer.send('send-data', data),
});
