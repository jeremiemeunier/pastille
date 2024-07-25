const tag = `pastille`;

export const composeTime: () => string = () => {
  const now = new Date();

  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();

  const hours = (now.getHours() + 2).toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const miliseconds = now.getMilliseconds().toString().padStart(3, "0");

  return `[${day}/${month}/${year} ${hours}:${minutes}:${seconds}.${miliseconds}]`;
};

const composeService: (data: string) => string = (data: string) => {
  return data.padEnd(24, "_");
};

const composeState: (
  data: "error" | "success" | "warning" | "start" | null
) => string = (data: "error" | "success" | "warning" | "start" | null) => {
  switch (data) {
    case "error":
      return "[ ERROR ]";
    case "success":
      return "[SUCCESS]";
    case "warning":
      return "[WARNING]";
    case "start":
      return "[ START ]";
    default:
      return "[ INFOS ]";
  }
};

const logs: (
  state: "error" | "success" | "warning" | "start" | null,
  service: string,
  content: string,
  guild?: string
) => void = async (
  state: "error" | "success" | "warning" | "start" | null,
  service: string,
  content: string,
  guild?: string
) => {
  if (guild) {
    console.log(
      `${composeTime()}[${tag}]${composeState(state)}[${composeService(
        service
      )}][${guild.padEnd(20, " ")}] » ${content}`
    );
  } else {
    console.log(
      `${composeTime()}[${tag}]${composeState(state)}[${composeService(
        service
      )}] » ${content}`
    );
  }
};

export default logs;
