import download from "download";
import path from "path";
import http from "node:http";
import fs from "fs";

export default async function(
  httpUrl: string,
  dest: string,
  options: Record<string, any>
) {
  var downloadOptions = {
    // 解压缩用的是 decompress
    // extract: true, // 如果发现是压缩包，download会自动解压缩
    // strip: 1, // 解压时忽略掉文件的前面几层目录
    mode: "666",
    // 请求用的是got
    ...options,
    headers: {
      accept: "application/zip",
      ...(options.headers || {}),
    },
  };
  await download(httpUrl, dest, downloadOptions);
}

export function customDownload(httpUrl, dest, options: any = {}) {
  return new Promise(function (resolve, reject) {
    http.get(httpUrl, function (res) {
      const file = fs.createWriteStream(dest);
    });
  });
}
