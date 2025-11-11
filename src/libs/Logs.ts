type Label =
  | "error"
  | "success"
  | "warning"
  | "start"
  | "sql"
  | "req"
  | "cron"
  | null;
type Logs = (
  node: string[],
  state: Label,
  content: string | {},
  details?: string
) => void;

const composeTime: () => string = () => {
  const now = new Date();
  const miliseconds = now.getMilliseconds().toString().padStart(3, "0");

  return `[${now.toLocaleDateString("fr-FR")}][${now.toLocaleTimeString(
    "fr-FR"
  )}.${miliseconds}]`;
};

const composeState: (data: Label) => string = (data) => {
  const string: string[] = [];

  switch (data) {
    case "error":
      string.push("\x1b[31m");
      break;
    case "success":
      string.push("\x1b[32m");
      break;
    case "warning":
      string.push("\x1b[33m");
      break;
    case "start":
      string.push("\x1b[32m");
      break;
    case "cron":
      string.push("\x1b[32m");
      break;
    case "sql":
      string.push("\x1b[32m");
      break;
    default:
      string.push("\x1b[34m");
      break;
  }

  if (!data) string.push("INFO".padEnd(8, " "));
  else string.push(data.toUpperCase().padEnd(8, " "));

  string.push("\x1b[0m");

  return string.join("");
};

const composeNode = (node: string[]): string => {
  return `${node.join(".").padEnd(30, " ")}`;
};

const composeDetails = (details: string | undefined): string => {
  return `\n└───    (${details})`.padEnd(39, " ");
};

const Logs: Logs = (node, state, content, details) => {
  const string: string[] = [
    composeState(state),
    composeNode(node),
    composeTime(),
  ];

  // add " » "
  string.push(" » ");

  if (content instanceof Error) {
    console.log("error object detected");
  }

  string.push(
    typeof content === "string" ? content : JSON.stringify(content, null, 2)
  );

  if (details) string.push(composeDetails(details));

  console.log(string.join(""));
};

export default Logs;
