import { Action, ActionPanel, Icon, List, showToast, Toast } from "@raycast/api";
import { nClient } from "./util/nClient";
import { useEffect, useState } from "react";
import Style = Toast.Style;

export default function Command() {
  const [versions, setVersions] = useState<string[] | undefined>();
  const [activeVersion, setActiveVersion] = useState<string | undefined>();

  useEffect(() => {
    setVersions(nClient.getLocalVersions());
    setActiveVersion(nClient.getActiveVersion());
  }, []);

  async function activateVersion(version: string) {
    const toast = await showToast(Style.Animated, `Activating version ${version}`, "Hang on…");
    const success = nClient.setActiveVersion(version);

    if (success) {
      toast.title = `Activated Version ${version}`;
      toast.message = undefined;
      toast.style = Style.Success;
      setActiveVersion(version);
    } else {
      toast.title = `Activating Version ${version} failed`;
      toast.message = undefined;
      toast.style = Style.Failure;
    }
  }

  function getVersionIcon(version: string) {
    return version == activeVersion ? Icon.CheckCircle : Icon.Circle;
  }

  async function deleteVersion(version: string) {
    const toast = await showToast(Style.Animated, `Deleting version ${version}`, "Hang on…");
    const success = nClient.deleteVersion(version);

    if (success) {
      toast.title = `Deleted Version ${version}`;
      toast.message = undefined;
      toast.style = Style.Success;

      setVersions(nClient.getLocalVersions());
      setActiveVersion(nClient.getActiveVersion());
    } else {
      toast.title = `Deleting Version ${version} failed`;
      toast.message = undefined;
      toast.style = Style.Failure;
    }
  }

  return (
    <List isLoading={versions == undefined}>
      {versions?.map((version) => {
        return (
          <List.Item
            key={version}
            title={version}
            icon={getVersionIcon(version)}
            actions={
              <ActionPanel>
                <Action title="Activate Version" icon={Icon.CheckCircle} onAction={() => activateVersion(version)} />
                <Action title="Delete Version" icon={Icon.Trash} onAction={() => deleteVersion(version)} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
