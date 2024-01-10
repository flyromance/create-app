import chalk from 'chalk';

/**
 * Evaluate an expression in meta.json in the context of
 * prompt answers data.
 *
 * eg: 'useNpm && useEslint' 转为 () => { return useNpm && userEslint }
 */
export function evaluate(exp: string, data: any) {
  /* eslint-disable no-new-func */
  const fn = new Function('data', 'with (data) { return ' + exp + '}');
  try {
    return fn(data);
  } catch (e) {
    console.error(chalk.red('执行过滤条件时发生错误: ' + exp));
  }
};
