import { Action, ActionPanel, Icon, List, showToast, Toast } from "@raycast/api";
import { nClient, VersionInformation, Versions, VersionSource } from "./util/nClient";
import { useEffect, useState } from "react";
import Style = Toast.Style;

enum VersionSourceDropdownValue {
  Installed = "installed",
  All = "all",
}

function VersionSourceDropdown(props: {
  filter: VersionSourceDropdownValue;
  onFilterUpdated: (newValue: VersionSourceDropdownValue) => void;
}) {
  return (
    <List.Dropdown
      tooltip="Filter Versions"
      value={props.filter}
      onChange={(newValue) => {
        props.onFilterUpdated(newValue as VersionSourceDropdownValue);
      }}
    >
      <List.Dropdown.Item title="Installed" value={VersionSourceDropdownValue.Installed} />
      <List.Dropdown.Item title="Installed and Available" value={VersionSourceDropdownValue.All} />
    </List.Dropdown>
  );
}

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [localVersions, setLocalVersions] = useState<Versions>({});
  const [activeVersion, setActiveVersion] = useState<string | undefined>();
  const [availableVersions, setAvailableVersions] = useState<Versions>({});
  const [versionSourceFilter, setVersionSourceFilter] = useState<VersionSourceDropdownValue>(
    VersionSourceDropdownValue.Installed,
  );

  useEffect(() => {
    loadActiveAndLocalVersions()
      .then(() => setIsLoading(false))
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (versionSourceFilter === VersionSourceDropdownValue.All) {
      loadAvailableVersions().catch((e) => console.error(e));
    } else {
      setAvailableVersions({});
    }
  }, [versionSourceFilter]);

  const versionInformation: Versions = Object.assign(availableVersions, { ...localVersions });

  async function loadAvailableVersions() {
    const availableVersions = await nClient.getAvailableVersions();
    setAvailableVersions(availableVersions);
  }

  async function loadActiveAndLocalVersions() {
    const localVersionsPromise = nClient.getLocalVersions();
    const activeVersionPromise = nClient.getActiveVersion();

    const [localVersions, activeVersion] = await Promise.all([localVersionsPromise, activeVersionPromise]);

    setLocalVersions(localVersions);
    setActiveVersion(activeVersion);
  }

  async function activateVersion(version: string) {
    const toast = await showToast(Style.Animated, `Activating version ${version}`, "Hang on…");
    const success = await nClient.activateOrDownloadVersion(version);

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

  function getVersionIcon(version: VersionInformation): Icon {
    if (version.version === activeVersion) {
      return Icon.CheckCircle;
    }

    switch (version.type) {
      case VersionSource.Local:
        return Icon.Circle;
      case VersionSource.Network:
        return Icon.Download;
    }
  }

  async function deleteVersion(version: string) {
    const toast = await showToast(Style.Animated, `Deleting version ${version}`, "Hang on…");
    const success = await nClient.deleteVersion(version);

    if (success) {
      toast.title = `Deleted Version ${version}`;
      toast.message = undefined;
      toast.style = Style.Success;

      await loadActiveAndLocalVersions();
    } else {
      toast.title = `Deleting Version ${version} failed`;
      toast.message = undefined;
      toast.style = Style.Failure;
    }
  }

  async function downloadAndActivateVersion(version: string) {
    const toast = await showToast(Style.Animated, `Downloading version ${version}`, "Hang on…");
    const success = await nClient.activateOrDownloadVersion(version);

    if (success) {
      toast.title = `Downloaded and Activated Version ${version}`;
      toast.message = undefined;
      toast.style = Style.Success;

      await loadActiveAndLocalVersions();
    } else {
      toast.title = `Download of Version ${version} failed`;
      toast.message = undefined;
      toast.style = Style.Failure;
    }
  }

  return (
    <List
      isLoading={isLoading}
      searchBarAccessory={
        <VersionSourceDropdown
          filter={versionSourceFilter}
          onFilterUpdated={(newValue) => setVersionSourceFilter(newValue)}
        />
      }
    >
      {Object.keys(versionInformation).map((key) => {
        const version = versionInformation[key];
        return (
          <List.Item
            key={version.version}
            title={version.version}
            icon={getVersionIcon(version)}
            actions={
              <ActionPanel>
                {version.type == VersionSource.Local && (
                  <>
                    <Action
                      title="Activate Version"
                      icon={Icon.CheckCircle}
                      onAction={() => activateVersion(version.version)}
                    />
                    <Action title="Delete Version" icon={Icon.Trash} onAction={() => deleteVersion(version.version)} />
                  </>
                )}
                {version.type == VersionSource.Network && (
                  <Action
                    title="Download and Activate Version"
                    icon={Icon.Download}
                    onAction={() => downloadAndActivateVersion(version.version)}
                  />
                )}
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
