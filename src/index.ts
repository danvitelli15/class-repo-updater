import Enquirer from "enquirer";
import { readdirSync } from "fs";
import { join } from "path";

const ACTIVITIES_DIRECTORY = "01-Activities";
const CURICULUM_PATH = join(__dirname, "..", "..", "fullstack-ground", "01-Class-Content");
const CLASS_REPO_PATH = join(__dirname, "..", "..", "UofM-VIRT-FSF-PT-11-2022-U-LOLC");

type Action = "UPDATE_UNSOLVED" | "UPDATE_SOLVED";
const ACTIONS: Action[] = ["UPDATE_UNSOLVED", "UPDATE_SOLVED"];

const promptForAction = async () =>
  (
    await Enquirer.prompt<{ action: Action }>({
      type: "select",
      name: "action",
      message: "What do you want to update?",
      choices: ACTIONS,
    })
  ).action;

const readWeeks = () =>
  readdirSync(CURICULUM_PATH, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const promptForWeek = async () =>
  (
    await Enquirer.prompt<{ week: string }>({
      type: "select",
      name: "week",
      message: "Which week do you want to update?",
      choices: readWeeks(),
    })
  ).week;

const readActivitiesForWeek = (week: string) =>
  readdirSync(join(CURICULUM_PATH, week, ACTIVITIES_DIRECTORY), { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const promptForActivities = async (week: string) =>
  (
    await Enquirer.prompt<{ activities: string[] }>({
      type: "multiselect",
      name: "activities",
      message: "Which activities would you like to unpdate solved for?",
      choices: readActivitiesForWeek(week),
    })
  ).activities;

const main = async () => {
  const action = await promptForAction();
  const week = await promptForWeek();
  if (action === "UPDATE_UNSOLVED") {
  } else {
    const activities = await promptForActivities(week);
    console.log(activities);
  }
};

main();
