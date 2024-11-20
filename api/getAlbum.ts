import type { VercelRequest, VercelResponse } from "@vercel/node";

import { Response, cors, getPropertyNameFromReqObject } from "./utils";
import { getAlbum, getAccessToken, getAlbumTracks } from "./utils/spotify";
import { formatAlbum, formatAlbumTracks } from "./utils/formatter";

//max 9 seconds
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = getPropertyNameFromReqObject(req, "id");
  const type = getPropertyNameFromReqObject(req, "type");

  const token = await getAccessToken();

  if (!token) {
    const sendData = new Response(true, "Failed to fetch Bearer token", {});
    return res.status(500).send(sendData);
  }

  try {
    let fetchFunction = getAlbum;
    let formatFunction: (a: any) => any = formatAlbum;
    let dataTag = "album's info";

    if (type === "tracks") {
      fetchFunction = getAlbumTracks;
      formatFunction = formatAlbumTracks;
      dataTag = "album's tracks";
    }

    const { data, failed, err } =
      (await fetchFunction(token.accessToken, id)) || {};

    if (failed) {
      throw new Error(err);
    }

    if (!data || data?.albumUnion?.__typename === "GenericError") {
      throw new Error("Cannot find album with ID: " + id);
    }

    const formattedData = formatFunction(data.albumUnion);
    const logStr = `[${id}] Successfully retrieved ${dataTag}`;

    //# Handle CORS
    cors(res);
    //# Allow caching upto 1 hour
    res.setHeader("Cache-Control", "max-age=3600, public");
    res.setHeader("vary", "Accept");

    res.status(200).send(new Response(false, logStr, formattedData));
  } catch (err) {
    const logStr = "Fail to fetches album data with ID: " + id;
    const sendData = new Response(true, logStr, {
      id: id,
      error: err.message,
    });

    console.error(err);
    res.status(400).send(sendData);
  }
}
