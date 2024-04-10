import { useComponentValue } from "@dojoengine/react";
import { Entity } from "@dojoengine/recs";
import { useEffect, useState } from "react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "./dojo/useDojo";
import { Button } from "@/components/ui/button";

function App() {
  const {
    setup: {
      systemCalls: { spawn, move },
      clientComponents: { Moves },
    },
    account,
  } = useDojo();

  const [clipboardStatus, setClipboardStatus] = useState({
    message: "",
    isError: false,
  });

  // entity id we are syncing
  const entityId = getEntityIdFromKeys([
    BigInt(account?.account.address),
  ]) as Entity;

  // get current component values
  const moves = useComponentValue(Moves, entityId);

  console.log(moves);

  const handleRestoreBurners = async () => {
    try {
      await account?.applyFromClipboard();
      setClipboardStatus({
        message: "Burners restored successfully!",
        isError: false,
      });
    } catch (error) {
      setClipboardStatus({
        message: `Failed to restore burners from clipboard`,
        isError: true,
      });
    }
  };

  useEffect(() => {
    if (clipboardStatus.message) {
      const timer = setTimeout(() => {
        setClipboardStatus({ message: "", isError: false });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [clipboardStatus.message]);

  return (
    <>
      <Button onClick={account?.create}>
        {account?.isDeploying ? "deploying burner" : "create burner"}
      </Button>
      {account && account?.list().length > 0 && (
        <Button onClick={async () => await account?.copyToClipboard()}>
          Save Burners to Clipboard
        </Button>
      )}
      <Button onClick={handleRestoreBurners}>
        Restore Burners from Clipboard
      </Button>
      {clipboardStatus.message && (
        <div className={clipboardStatus.isError ? "error" : "success"}>
          {clipboardStatus.message}
        </div>
      )}

      <div className="card">
        <div>{`burners deployed: ${account.count}`}</div>
        <div>
          select signer:{" "}
          <select
            value={account ? account.account.address : ""}
            onChange={(e) => account.select(e.target.value)}
          >
            {account?.list().map((account, index) => {
              return (
                <option value={account.address} key={index}>
                  {account.address}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <Button onClick={() => account.clear()}>Clear burners</Button>
          <p>
            You will need to Authorise the contracts before you can use a
            burner. See readme.
          </p>
        </div>
      </div>
    </>
  );
}

export default App;