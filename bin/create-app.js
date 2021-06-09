#!/usr/bin/env node

const minimist = require('minimist');
const createProject = require('./lib/index.js');

const { _, ...args } = minimist(process.argv.slice(2), {
    alias: {
        t: 'type', // lib app
        f: 'frame', // react vue none
        m: 'momorepo', // 是否是momorepo
        n: 'name', // npm 包的名字
    },
    default: {
        type: 'app',
        frame: 'none',
        momorepo: false,
        name: `package-name-${new Date.getTime()}`,
    },
    boolean: ['momorepo'],
});

const folderName = _[0];

if (!folderName) {
    process.exit(1);
}

createProject.default({ cwd: process.cwd(), args, });
