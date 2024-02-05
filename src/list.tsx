import { List } from "@raycast/api";
import { nClient } from "./util/nClient";
import { useEffect, useState } from "react";

export default function Command() {
  const [versions, setVersions] = useState<string[] | undefined>();

  useEffect(() => {
    (async () => {
      const versions = nClient.listLocalVersions();
      setVersions(versions);
    })();
  }, []);

  return (
    <List isLoading={versions == undefined}>
      {versions?.map((version) => {
        return <List.Item key={version} title={version} />;
      })}
    </List>
  );
}
