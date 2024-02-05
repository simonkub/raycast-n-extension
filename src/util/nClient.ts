import { spawnSync } from "node:child_process";
import { preferences } from "./preferences";
import * as os from "os";

class NClient {
  public readonly isInstalled: boolean;
  private readonly nPath: string;
  private readonly nDirectory: string;

  constructor(nPath: string, nDirectory: string) {
    console.log(`NClient constructor called with nPath ${nPath} and nDirectory ${nDirectory}.`);

    this.nDirectory = nDirectory;
    this.nPath = nPath;

    this.isInstalled = this.isNInstalled();
  }

  getLocalVersions() {
    const { stdout } = this.runCommand("ls");
    const localVersions = stdout.toString().trim().replaceAll("node/", "").split(os.EOL);

    console.log(`getLocalVersions: ${localVersions}`);

    return localVersions;
  }

  setActiveVersion(version: string): boolean {
    const { status } = this.runCommand(version);

    return status === 0;
  }

  getActiveVersion(): string | undefined {
    const nodeExecutable = `${this.nDirectory}/bin/node`;
    const { stdout, status } = spawnSync(`${nodeExecutable} --version`, { shell: true });

    if (status === 0) {
      // vXX.YY.ZZ\n
      const activeVersion = stdout.toString().replace("v", "").trim();
      console.log(`getActiveVersion: ${activeVersion}`);
      return activeVersion;
    } else {
      console.error("Could not get active version");
    }
  }

  private runCommand(command: string) {
    const { stdout, stderr, error, status } = spawnSync(`${this.nPath} ${command}`, { shell: true });
    return { stdout, stderr, error, status };
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

  deleteVersion(version: string): boolean {
    const { status, stderr, stdout } = this.runCommand(`rm ${version}`);

    console.log(`deleteVersion: stdout: ${stdout};; stderr: ${stderr}`);

    return status === 0;
  }
}

const nClient = new NClient(preferences.path, preferences.directory);

export { nClient };
