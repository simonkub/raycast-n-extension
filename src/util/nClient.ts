import { spawnSync } from "node:child_process";
import { preferences } from "./preferences";
import * as os from "os";

class NClient {
  public readonly isInstalled: boolean;
  private readonly nPath: string;

  constructor(nPath: string) {
    console.log(`NClient constructor called with nPath ${nPath}.`);

    this.nPath = nPath;

    this.isInstalled = this.isNInstalled();
  }

  listLocalVersions() {
    const { stdout } = this.runCommand("ls");

    return stdout.toString().replaceAll("node/", "").split(os.EOL);
  }

  private runCommand(command: string) {
    const { stdout, stderr, error } = spawnSync(`${this.nPath} ${command}`, { shell: true });
    return { stdout, stderr, error };
  }

  private isNInstalled() {
    const { stdout, stderr } = this.runCommand("--version");

    if (stdout.length === 0) {
      console.error(`n is not installed: ${stderr}`);
      return false;
    }

    console.log(`n is installed: ${stdout}`);
    return true;
  }
}

const nClient = new NClient(preferences.path);

export { nClient };
