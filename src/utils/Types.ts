import { ObjectId } from "mongodb";

export interface dbGuild {
  _id?: ObjectId;
  id: string;
  name: string;
  thumbnail: string;
  channel?: string;
  role?: string;
}

export interface dbChannel {
  channel: string;
}

export type WithChannel<dbGuild> = dbGuild & dbChannel;

export interface dbDocument {
  _id?: ObjectId;
  title: string;
  url: string;
  date: number;
  img: string;
  event: string;
  notified: boolean;
}

export interface dbEvent {
  _id?: ObjectId;
  name: string;
  year: number;
}

export interface dbThread {
  _id?: ObjectId;
  guild: string;
  id: string;
  event: string;
}
