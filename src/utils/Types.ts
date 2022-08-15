export interface dbGuild {
  id: string;
  name: string;
  thumbnail: string;
  channel?: string;
}

export interface dbChannel {
  channel: string;
}

export type WithChannel<dbGuild> = dbGuild & dbChannel;

export interface dbDocument {
  title: string;
  url: string;
  date: number;
  img: string;
  event: string;
  notified: boolean;
}

export interface dbEvent {
  name: string;
  year: number;
}

export interface dbThread {
  guild: string;
  id: string;
  event: string;
}
