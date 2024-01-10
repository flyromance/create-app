import match from 'minimatch';
import { evaluate } from './eval';

/**
 * 过滤文件
 *  
 * @param {object} files key是文件路径，value是文件信息
 * @param {object} filters key是glob string，value是用户的答案
 * @param {object} data
 * @param {function} done
 * @returns {undefined}
 */
export default (files, filters, data, done) => {
  if (!filters) {
    return done();
  }
  const fileNames = Object.keys(files);
  Object.keys(filters).forEach((glob) => {
    fileNames.forEach((file) => {
      if (match(file, glob, { dot: true })) {
        const condition = filters[glob];
        if (!evaluate(condition, data)) {
          delete files[file];
        }
      }
    });
  });
  done();
};
