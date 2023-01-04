import os from 'os'


export function getLocalIP() {
  const netInfo = os.networkInterfaces()
  let ip = ''

  switch (os.type()) {
    case 'Windows_NT':
      for (let netName in netInfo) {
        if (netName === '本地连接' || netName === '以太网') {
          for (let j = 0; j < netInfo[netName].length; j++) {
            if (netInfo[netName][j].family === 'IPv4') {
              ip = netInfo[netName][j].address
              break;
            }
          }
        }
      }
      break
    case 'Darwin':
      for (let i = 0; i < netInfo.en0.length; ++i) {
        if (netInfo.en0[i].family == 'IPv4') {
          ip = netInfo.en0[i].address
        }
      }
      break
    case 'Linux':
      ip = netInfo.eth0[0].address
      break
  }
  return ip
}