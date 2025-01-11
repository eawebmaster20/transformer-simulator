const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const { SerialPort } = require('serialport');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, 'src/assets/icons/favicon.ico')
  });


  // Load the Angular app
  const indexPath = path.join(__dirname, 'dist/transformer-pwa-app/browser/index.html');
  mainWindow.loadFile(indexPath);
  Menu.setApplicationMenu(null);
  // mainWindow.webContents.openDevTools();


  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);


ipcMain.handle('list-ports', async () => {
  const ports = await SerialPort.list();
  // console.log('Listening on port', ports)
  return ports.map(port => ({ path: port.path, manufacturer: port.manufacturer }));
});

ipcMain.handle('open-port', async (event, data) => {
   const currentPort = new SerialPort(data);
    await currentPort.open();
    return 'Port opened successfully';
});

ipcMain.on('connect-to-port', async (event, portName, baudRate) => {
  try {
    port = new SerialPort({
      path: portName,
      baudRate: baudRate || 9600,
    });

    port.on('open', () => {
      console.log(`Port ${portName} is now open.`);
      event.reply('port-status', 'connected');
    });

    port.on('error', (err) => {
      console.error('Error: ', err.message);
      event.reply('port-status', `error: ${err.message}`);
    });

    port.on('data', (data) => {
      console.log('Data received:', data.toString());
      event.reply('data-received', data.toString());
    });
  } catch (err) {
    event.reply('port-status', `error: ${err.message}`);
  }
});

ipcMain.on('send-data', (event, data) => {
  if (port && port.isOpen) {
    port.write(data, (err) => {
      if (err) {
        console.error('Error on write:', err.message);
        event.reply('data-status', `error: ${err.message}`);
      } else {
        console.log('Data sent:', data);
        event.reply('data-status', 'success');
      }
    });
  } else {
    event.reply('data-status', 'error: port not open');
  }
});
// Handle writing data to the serial port
// ipcMain.on('write-to-port', (event, data) => {
//   if (currentPort && currentPort.isOpen) {
//     currentPort.write(data, (err) => {
//       if (err) {
//         console.error('Error writing to port:', err);
//         event.reply('write-error', 'Failed to write to port');
//       } else {
//         event.reply('write-success', 'Data written to port');
//       }
//     });
//   } else {
//     event.reply('write-error', 'Port is not open');
//   }
// });


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
