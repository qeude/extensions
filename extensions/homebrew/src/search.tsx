import {
  ActionPanel,
  ActionPanelItem,
  List,
  render,
  showToast,
  ToastStyle,
  OpenInBrowserAction,
  CopyToClipboardAction,
  Icon,
  Color,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { brewSearchFormula, brewInstalled, brewInstall } from "./brew";

/// Main

function Main() {
  const [formulae, setFormulae] = useState([]);
  const [installed, setInstalled] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(async () => {
    setIsLoading(true);
    if (installed == undefined) {
      setInstalled(await listInstalled());
      return;
    }
    try {
      const formulae = await brewSearchFormula(query.trim());
      await updateInstalled(formulae, installed);
      setFormulae(formulae);
    } catch (err) {
      setFormulae([]);
      showToast(ToastStyle.Failure, "Package search error", err);
      console.log("brewSearchFormula error:", err);
    }
    setIsLoading(false);
  }, [query, installed]);

  function FormulaListItem(props: { formula: Formula }) {
    const formula = props.formula;
    let version = formula.versions.stable;
    let tintColor = Color.SecondaryText;
    if (formula.installed.length > 0) {
      version = formula.installed[0].version;
      tintColor = Color.Green;
    }
    return (
      <List.Item
        id={formula.name}
        title={formula.full_name}
        subtitle={formula.desc}
        accessoryTitle={version}
        icon={ {source: Icon.Checkmark, tintColor: tintColor} }
        actions={
          <ActionPanel>
            <ActionPanel.Section>
              <ActionPanelItem title="Install"
                               icon={Icon.Plus}
                               shortcut={{ modifiers:["cmd"], key: "i" }}
                               onAction={async () => {
                                 await install(formula);
                                 installed.set(formula.name, formula);
                                 setInstalled(new Map(installed));
                               }}
              />
            </ActionPanel.Section>
            <ActionPanel.Section>
              <OpenInBrowserAction url={formula.homepage} />
              <CopyToClipboardAction title="Copy URL" content={formula.homepage} />
            </ActionPanel.Section>
          </ActionPanel>
        }
      />
    );
  }

  function ForumulaList(props: { formulae: Formula[], isLoading: bool, onSearchTextChange: () => void }) {
    const results = props.formulae ? props.formulae.slice(0, 200) : [];
    return (
      <List searchBarPlaceholder="Search formula by name..." isLoading={props.isLoading} onSearchTextChange={props.onSearchTextChange} >
        {results.map((formula) => (
          <FormulaListItem key={formula.name} formula={formula} />
        ))}
      </List>
    );
  }

  return <ForumulaList formulae={formulae} isLoading={isLoading} onSearchTextChange={setQuery} />;
}

async function main() {
  render(<Main />);
}
main();

/// Private

async function install(formula: Formula) {
  showToast(ToastStyle.Animated, `Installing ${formula.full_name}`);
  try {
    await brewInstall(formula);
    formula.installed = [{version: formula.versions.stable}];
    showToast(ToastStyle.Success, `Installed ${formula.full_name}`);
  } catch (error) {
    console.error(error);
    showToast(ToastStyle.Failure, "Install failed");
  }
}

async function listInstalled(): Map<string, Formula> {
  const installed = await brewInstalled(true);
  const dict = new Map<string, Formula>();
  for (const formula of installed) {
    dict.set(formula.name, formula);
  }
  return dict;
}

async function updateInstalled(formulae: Formula[], installed: Map<string, Formula>) {
  for (formula of formulae) {
    const info = installed.get(formula.name);
    formula.installed = info ? info.installed : [];
  }
}
