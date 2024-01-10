import os from 'os';

function homeDir() {
  const env = process.env;
  const home = env.HOME;
  const user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;

  if (process.platform === 'win32') {
    const HOMEDRIVE = env.HOMEDRIVE ? env.HOMEDRIVE : '';
    const HOMEPATH = env.HOMEPATH ? env.HOMEPATH : '';
    return env.USERPROFILE || HOMEDRIVE + HOMEPATH || home || null;
  }

  if (process.platform === 'darwin') {
    return home || (user ? '/Users/' + user : null);
  }

  if (process.platform === 'linux') {
    return home || (process.getuid() === 0 ? '/root' : user ? '/home/' + user : null);
  }

  return home || null;
}

const osHomeDir = typeof os.homedir === 'function' ? os.homedir : homeDir;

export default osHomeDir;
