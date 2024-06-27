import path from 'path';
import ora from 'ora';
import inquirer from 'inquirer';
import { existsSync } from 'fs';
import { sync as rm } from 'rimraf';

import osHomeDir from './os-homedir';
import * as logger from './logger';
import { sourceConfigs, repoConfigs } from './config';
import { getProjects, downloadProject } from './utils';


interface InitOption {
  templateName: string;
  projectName?: string; // undefined  '.'  'xxx'
  offline?: boolean;
  clone?: boolean;
  source?: string;
}

export default async (option: InitOption) => {

  let projectExisted = false;
  let answers: Record<string, any> = {};
  let sourceOption: any = null;
  let repoOption: any = null;

  try {
    answers = await inquirer.prompt([
      {
        name: 'projectName',
        type: 'input',
        message: '项目名称',
        filter(input) {
          return input.trim();
        },
        validate(input, answers) {
          // 传入的input是filter过滤后的值
          if (input) {
            return true;
          } else {
            return '请输入项目名称';
          }
        }
      },
      {
        when(args) {
          projectExisted = existsSync(path.resolve(args.projectName));
          if (projectExisted) {
            return true;
          }
          return false;
        },
        name: 'removeAndContinue',
        type: 'confirm',
        message: '当前工作目录已存在同名文件夹，删除已存在的文件夹，并且继续？'
      },
      {
        when(args) {
          // 如何做到，如果是false，直接退出进程，应该有更优雅的方法。
          if (projectExisted && args.removeAndContinue === false) {
            console.log('终止');
            process.exit();
          }
          return true;
        },
        name: 'source',
        type: 'list',
        message: '请选择下载源？',
        choices: sourceConfigs
          .filter((item) => !item.disabled)
          .map((item) => {
            return {
              name: item.name,
              value: item.key
            };
          })
      },
      {
        name: 'templateName',
        type: 'list',
        message: '请选择模板',
        choices: async (answer) => {
          sourceOption = sourceConfigs.find((item) => item.key === answer.source);
          repoOption = repoConfigs[sourceOption.repoType];
          const arr = await getProjects({
            ...repoOption.getProjects({
              ...sourceOption
            })
          });
          return arr.filter(sourceOption.filterProjects ?? (() => true)).map((item: any) => {
            const hasDesp = !!item.description;
            const isOverLen = hasDesp && item.description.length > 30;
            return {
              name: `${item.name} ${
                hasDesp
                  ? `（${isOverLen ? item.description.slice(0, 30) + '...' : item.description}）`
                  : ''
              }`,
              value: item.name
            };
          });
        }
      },
      {
        when(answer) {
          return repoOption.type === 'git';
        },
        name: 'branch',
        type: 'input',
        message: '请输入分支或tag名称',
        default: 'master',
        filter(input) {
          return input.trim();
        },
        validate(input, answers) {
          return input ? true : false;
        }
      }
    ]);
  } catch (e) {
    logger.fatal(e);
  }

  // 如果有，并且需要删除
  if (projectExisted && answers.removeAndContinue) {
    rm(path.resolve(answers.projectName));
  }

  try {
    const spinner = ora('正在下载模板...');
    spinner.start();
    await downloadProject({
      ...repoOption.getDownloadOption({
        group: sourceOption.group,
        templateName: answers.templateName,
        branch: answers.branch
      }),
      dest: path.resolve(answers.projectName)
    });
    spinner.stop();
    logger.success('初始化完成!');
  } catch (e) {
    logger.fatal('下载失败！');
  } finally {
    //
  }
};
