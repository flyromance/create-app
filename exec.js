const { exec, execSync, execFile, execFileSync, spawn, spawnSync, ChildProcess } = require('child_process');

// console.log(obj instanceof ChildProcess); // true
const obj = exec('node x.js', (err, stdout, stderr) => {
  //   if (err) {
  //     console.log(err.toString());
  //   } else {
  //     console.log(typeof stdout); // string
  //     console.log(stdout);
  //     console.log(stderr);
  //   }
});
obj.on('exit', (code) => {
  // console.log(`child process exited with code ${code}`);
});
obj.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
obj.stderr.on('data', (data) => {
  console.log(data.toString());
});
obj.stdout.on('data', (data) => {
  console.log('xxx', typeof data); // string
  console.log(data.toString());
});
// console.log(obj.stdout, obj.stderr)

// 标准输出的 buffer
const obj1 = execSync('ls -l');
console.log(Buffer.isBuffer(obj1));
