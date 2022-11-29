import os, { homedir } from "os";
import osName from "os-name";

export const convertTime = (unix: number) => {
  const date = new Date(unix * 1000);
  const today = new Date();
  const hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  const minutes = date.getMinutes() < 10 ? date.getMinutes() + "0" : date.getMinutes();
  if (date.getDate() === today.getDate()) {
    return `${hours}:${minutes}`;
  } else if (date.getDate() === today.getDate() - 1) {
    return `Yesterday, ${hours}:${minutes}`;
  } else {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(-2)}, ${hours}:${minutes}`;
  }
};

export const getMailDbPath = () => {
  const name = osName().toLowerCase();
  if (name.includes("ventura")) {
    return [homedir(), "Library", "Mail", "V10", "MailData", "Envelope Index"].join("/");
  } else if (name.includes("monterey")) {
    return [homedir(), "Library", "Mail", "V9", "MailData", "Envelope Index"].join("/");
  } else {
    return [homedir(), "Library", "Mail", "V8", "MailData", "Envelope Index"].join("/");
  }
};
