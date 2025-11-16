type Label =
  | "error"
  | "success"
  | "warning"
  | "start"
  | "sql"
  | "req"
  | "cron"
  | null;
type Logs = ({
  node,
  state,
  content,
  details,
  devOnly,
}: {
  node: string[];
  state: Label;
  content: string | {};
  details?: string;
  devOnly?: boolean;
}) => void;

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
    case "sql":
    case "req":
      string.push("\x1b[35m");
      break;
    default:
      string.push("\x1b[34m");
      break;
  }

  if (!data) string.push("INFO".padEnd(8, " "));
  else string.push(data.toUpperCase().padEnd(8, " "));

  if (data !== "cron" && data !== "sql" && data !== "req")
    string.push("\x1b[0m");

  return string.join("");
};

const composeNode = (node: string[]): string => {
  return `${node.join(".").padEnd(30, " ")}`;
};

const composeDetails = (details: string | undefined): string => {
  return `\n└───    (${details})`.padEnd(39, " ");
};

const Logs: Logs = ({ node, state, content, details, devOnly }) => {
  const string: string[] = [
    composeState(state),
    composeNode(node),
    composeTime(),
  ];

  // add " » "
  string.push(" » ");

  if (content instanceof Error) {
    string.push(content.message);
  } else {
    string.push(
      typeof content === "string" ? content : JSON.stringify(content)
    );
  }

  if (details) string.push(composeDetails(details));

  // logging to console
  // Only log if explicitly meant for all environments (!devOnly === true)
  // or if in dev mode and devOnly === true
  if (devOnly === true && process.env.DEV === "1") {
    // Dev-only logs: only show in development
    console.log(string.join(""));
  } else if (devOnly === false || devOnly === undefined) {
    // Production logs: show in all environments (default behavior)
    console.log(string.join(""));
  }
  // If devOnly === true but not in dev mode, don't log anything
};

export default Logs;
