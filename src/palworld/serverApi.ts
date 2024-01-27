import { parseCSV } from "../utils";
import RCONClient from "./rcon/client";

export interface Player {
  name: string;
  playeruid: string;
  steamid: string;
}

export interface RconResponse {
  error?: string;
  players: Player[];
  serverName: string;
  serverVersion: string;
}

export const sendCommand = async (
  options: {
    ipAddress: string;
    port: number;
    password?: string;
  },
  command: string
) => {
  const client = new RCONClient(options.ipAddress, options.port);

  await client.connect(options.password || "");

  const response = await client.sendCommand(command);

  return response.toString().replace(/\u0000/g, "");
};

export const serverInfo = async (options: {
  ipAddress: string;
  port: number;
  password?: string;
}): Promise<RconResponse> => {
  const client = new RCONClient(options.ipAddress, options.port);

  await client.connect(options.password || "");

  const getServerName = await client.sendCommand("Info");

  const message = getServerName.toString();

  const parts = message.split("[");

  const serverVersion = parts[1].split("]")[0];

  const serverName = parts[1]
    .split("]")[1]
    .replace(/[\n\u0000]+$/, "")
    .trim();

  const getplayers = await client.sendCommand("ShowPlayers");

  const playerlist = parseCSV(
    getplayers.toString().replace(/\u0000/g, "")
  ).filter((x: any) => x.playeruid);

  return {
    players: playerlist,
    serverName,
    serverVersion,
  };
};
