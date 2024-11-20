import axios, { AxiosError } from "axios";
import { getENVKey } from ".";

const getArtist = (
  token: string,
  artistID: string
): Promise<any | AxiosError> =>
  new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      url: "https://api-partner.spotify.com/pathfinder/v1/query",
      params: {
        operationName: "queryArtistOverview",
        variables: `{"uri":"spotify:artist:${artistID}","locale":"","includePrerelease":true}`,
        extensions: getENVKey("extensionStr"),
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .request(options)
      .then((res) => resolve(res.data))
      .catch(() => resolve(undefined));
  });

const getPlaylist = (
  token: string,
  playlistID: string,
  offset: number = 0,
  limit: number = 300
) =>
  new Promise((resolve) => {
    const options = {
      method: "GET",
      url: "https://api-partner.spotify.com/pathfinder/v1/query",
      params: {
        operationName: "fetchPlaylist",
        variables: `{"uri":"spotify:playlist:${playlistID}","offset":${offset},"limit":${limit}}`,
        extensions: process.env.extensionStr3,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .request(options)
      .then((res) => resolve(res.data))
      .catch(() => resolve(undefined));
  }) as Promise<Record<string, any> | undefined>;

const getTrack = (token: string, trackID: string) =>
  new Promise((resolve) => {
    const options = {
      method: "GET",
      url: "https://api-partner.spotify.com/pathfinder/v1/query",
      params: {
        operationName: "getTrack",
        variables: `{"uri":"spotify:track:${trackID}"}`,
        extensions: process.env.extensionStr2,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .request(options)
      .then((res) => resolve(res.data))
      .catch(() => resolve(undefined));
  }) as Promise<Record<string, any> | undefined>;

const getAlbum = (token: string, albumID: string) =>
  new Promise((resolve) => {
    const options = {
      method: "GET",
      url: "https://api-partner.spotify.com/pathfinder/v1/query",
      params: {
        operationName: "getAlbum",
        variables: `{"uri":"spotify:album:${albumID}","locale":"","offset":0,"limit":50}`,
        extensions: getENVKey("extensionStr4"),
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .request(options)
      .then((res) => resolve(res.data))
      .catch((err) => resolve({ failed: true, err }));
  }) as Promise<Record<string, any> | { failed: true; err; data: null }>;

const getAlbumTracks = (
  token: string,
  albumID: string,
  offset: number = 0,
  limit: number = 300
) =>
  new Promise((resolve) => {
    const options = {
      method: "GET",
      url: "https://api-partner.spotify.com/pathfinder/v1/query",
      params: {
        operationName: "queryAlbumTracks",
        variables: `{"uri":"spotify:album:${albumID}","locale":"","offset":${offset},"limit":${limit}}`,
        extensions: getENVKey("extensionStr4"),
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .request(options)
      .then((res) => resolve(res.data))
      .catch((err) => resolve({ failed: true, err }));
  }) as Promise<Record<string, any> | { failed: true; err; data: null }>;

interface accessTokenObj {
  clientId: string;
  accessToken: string;
  accessTokenExpirationTimestampMs: number;
  isAnonymous: boolean;
}

const getAccessToken = () =>
  new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      url: "https://open.spotify.com/get_access_token",
    };

    axios
      .request(options)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        resolve(undefined);
      });
  }) as Promise<accessTokenObj | undefined>;

export {
  getArtist,
  getPlaylist,
  getTrack,
  getAlbum,
  getAlbumTracks,
  getAccessToken,
};
