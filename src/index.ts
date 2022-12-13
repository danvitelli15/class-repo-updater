import { execSync } from "child_process";
import Enquirer from "enquirer";
import { readdirSync } from "fs";
import { copySync } from "fs-extra";
import { join } from "path";

const ACTIVITIES_DIRECTORY = "01-Activities";
const ALGORITHMS_DIRECTORY = "03-Algorithms";
const PROJECT_MAIN_DIRECTORY = "Main";
const SOLVED_DIRECTORY = "Solved";
const CURICULUM_PATH = join(__dirname, "..", "..", "fullstack-ground", "01-Class-Content");
const CLASS_REPO_PATH = join(__dirname, "..", "..", "UofM-VIRT-FSF-PT-11-2022-U-LOLC");

type Action = "UPDATE_UNSOLVED" | "UPDATE_SOLVED";
const ACTIONS: Action[] = ["UPDATE_UNSOLVED", "UPDATE_SOLVED"];

const gitPullSource = () => {
  console.log("Pulling from curriculum repo");
  const output = execSync(`git pull`, { cwd: CURICULUM_PATH });
};

const gitPullClassRepo = () => {
  console.log("Pulling from class repo");
  const output = execSync(`git pull`, { cwd: CLASS_REPO_PATH });
};

const gitCommitAndPushClassRepo = () => {
  console.log("Committing and pushing to class repo");
  const output = execSync(`git add . && git commit -m "Update class repo" && git push`, { cwd: CLASS_REPO_PATH });
};

const promptShouldCommitAndPush = async () =>
  Enquirer.prompt<{ commit: boolean }>({ type: "confirm", name: "commit", message: "Commit and push to class repo?" });

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
    .filter(
      (dirent) =>
        dirent.isDirectory() &&
        readdirSync(join(CURICULUM_PATH, week, ACTIVITIES_DIRECTORY, dirent.name)).includes("Solved")
    )
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

const copyWeekWithoutSolved = (week: string) => {
  const filterSolved = (src: string, dest: string) => {
    console.log(src);
    return (
      (!src.includes(SOLVED_DIRECTORY) && !src.includes(PROJECT_MAIN_DIRECTORY)) || src.includes(ALGORITHMS_DIRECTORY)
    );
  };
  copySync(join(CURICULUM_PATH, week), join(CLASS_REPO_PATH, week), { filter: filterSolved });
};

const copySolvedForActivieties = (week: string, activities: string[]) => {
  activities
    .filter((activity) => activity.includes("Stu"))
    .forEach((activity) =>
      copySync(
        join(CURICULUM_PATH, week, ACTIVITIES_DIRECTORY, activity, SOLVED_DIRECTORY),
        join(CLASS_REPO_PATH, week, ACTIVITIES_DIRECTORY, activity, SOLVED_DIRECTORY)
      )
    );
};

const main = async () => {
  gitPullSource();
  gitPullClassRepo();

  const action = await promptForAction();
  const week = await promptForWeek();

  if (action === "UPDATE_UNSOLVED") {
    copyWeekWithoutSolved(week);
  } else {
    const activities = await promptForActivities(week);
    copySolvedForActivieties(week, activities);
  }

  if ((await promptShouldCommitAndPush()).commit) {
    gitCommitAndPushClassRepo();
  }
};

main();
