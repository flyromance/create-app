import BaseAppGenerator from "./generator";
import * as path from "path";

class AppGenerator extends BaseAppGenerator {
  async writing() {
    const { type, frame, momorepo, name } = this.args;

    let tempateName = "";

    if (momorepo) {
      tempateName = "monorepo";
    } else {
      if (type === "lib") {
        if (frame === "react") {
          tempateName = "react-lib";
        } else if (frame === "vue") {
          tempateName = "vue-lib";
        } else {
          // none
          tempateName = "pure-lib";
        }
      } else if (type === "app") {
        if (frame === "react") {
          tempateName = "react-app";
        } else if (frame === "vue") {
          tempateName = "vue-app";
        } else {
          // none
          tempateName = "pure-app";
        }
      }
    }

    this.copyDirectory({
      context: {
        name: name,
      },
      path: path.join(__dirname, `../templates/${tempateName}`),
      target: this.cwd,
    });
  }
}

export default async ({
  cwd,
  args,
}: {
  cwd: string;
  args: { [key: string]: any };
}) => {
  const generator = new AppGenerator({
    cwd,
    args,
  });
  await generator.run();
};
