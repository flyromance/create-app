const { Command } = require("commander");
const chalk = require("chalk");

function requireDefault(m) {
  return m.default ? m.default : m;
}

const logger = require("./logger");
const { checkNodeVersion, checkPkgVersion } = require("./check-version");
const { CMD_NAME, VERSION } = requireDefault(require("./config"));

start();
// bootstrap();

async function bootstrap() {
  try {
    await checkNodeVersion();
    await checkPkgVersion();
  } catch (e) {
    logger.fatal(e);
  }
}

async function start() {
  process.on("exit", (e) => {
    //
  });

  try {
    await checkNodeVersion();
    await checkPkgVersion();
  } catch (e) {
    logger.fatal(e);
  }
  const program = new Command();

  program.version(VERSION, "-v, -V, --version", "版本号");
  program.name(CMD_NAME);
  program.usage("command [option...]");
  // program.option('-d', '全局的配置');
  program.on("--help", () => {
    // 最后打印该帮助信息
    console.log("123");
  });

  program
    .command("init <template-name> <project-name>") // 不写init有什么问题吗
    .usage("<template-name> [project-name]")
    .option("--offline", "使用本地缓存中的模板")
    // .option("-c, --clone", "使用 git clone 方式获取项目") // TODO:
    // .option('--source', '模板来源，longfor(默认) | github') // TODO:
    .action((templateName, projectName, params = {}) => {
      console.log(templateName, projectName, params);
      require("../lib/cmds/init").default({
        templateName,
        projectName,
        ...params,
      });
    })
    .on("--help", () => {
      console.log();
      console.log("Examples:");
      console.log();
      console.log(chalk.gray("    # 从龙湖官方模板创建项目"));
      console.log(`    $ ${CMD_NAME} init webpack my-project`);
      console.log();
      console.log(chalk.gray("    # 从龙湖gitlab仓库创建项目"));
      console.log(`    $ ${CMD_NAME} username/repo my-project`);
      console.log();
    });

  // program
  //   .command('list [username]')
  //   .usage('[username]')
  //   .action((username) => {
  //     require('../lib/cmds/list').default({ username });
  //   });

  program.parse(process.argv);
}
