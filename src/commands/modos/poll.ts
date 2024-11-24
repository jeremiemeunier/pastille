import { readFileSync } from "node:fs";
import { cwd } from "process";

const alphabetLetters = JSON.parse(
  readFileSync(cwd() + "/src/data/alphabet.json").toString()
);

const pollOptions = () => {
  let options = [
    {
      name: "question",
      description: "La question que tu souhaite poser",
      type: 3,
      required: true,
    },
  ];

  for (let i = 0; i < 21; i++) {
    let optionContent = {
      name: "choice_" + alphabetLetters[i]["letter"],
      description:
        "Indique un choix. Tu peux mettre un emoji en premier pour changer la réaction du bot.",
      type: 3,
      required: false,
    };
    options.push(optionContent);
  }

  return options;
};

const commands = {
  name: "poll",
  description: "Crée un sondage",
  options: pollOptions(),
  default_member_permissions: 17600775979008,
};

export const data = commands;
