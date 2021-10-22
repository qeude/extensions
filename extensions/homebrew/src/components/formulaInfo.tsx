import { Detail } from "@raycast/api";

export default function FormulaInfo(props: {formula: Formula}): Component {
  // TD: We also need actions here...
  return <Detail markdown={formatInfo(props.formula)} />;
}

function formatInfo(formula: Formula): string {
  return `
# ${formula.full_name}
${formula.desc}

[${formula.homepage}](${formula.homepage})

#### License:
 ${formula.license}

${formatVersions(formula)}

${formatDependencies(formula)}
  `;
}

function formatVersions(formula: Formula): string {
  const versions = formula.versions;
  let markdown = `
#### Versions:
Stable: ${versions.stable} ${versions.bottle ? '(bottled)' : ''}

  `;
  if (versions.head) {
    markdown += versions.head;
  }
  return markdown;
}

function formatDependencies(formula: Formula): string {
  let markdown = '';

  if (formula.dependencies.length > 0) {
    markdown += `
Required: ${formula.dependencies.join(', ')}
    `;
  }

  if (formula.build_dependencies.length > 0) {
    markdown += `
Build: ${formula.build_dependencies.join(', ')}
    `;
  }

  if (markdown) {
    return `#### Dependencies
${markdown}
    `;
  } else {
    return '';
  }
}
