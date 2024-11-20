import type { VercelRequest, VercelResponse } from "@vercel/node";

import { Response, getPropertyNameFromReqObject } from "./utils";
import { getPlaylist, getAccessToken } from "./utils/spotify";

//max 9 seconds
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = getPropertyNameFromReqObject(req, "id");
  const offset: number = getPropertyNameFromReqObject(req, "offset", 0);
  const limit: number = getPropertyNameFromReqObject(req, "limit", 15);

  const token = await getAccessToken();

  if (!token) {
    const sendData = new Response(true, "Failed to fetch Bearer token", {});
    return res.status(500).send(sendData);
  }

  try {
    const { data } = await getPlaylist(token.accessToken, id, offset, limit);

    if (data.playlistV2.__typename === "GenericError") {
      throw new Error("Cannot find playlist with ID: " + id);
    }

    const logStr = `[${id}] Successfully fetches playlist data`;
    res.status(200).send(new Response(false, logStr, data));
    // console.log(data);
  } catch (err) {
    const logStr = "Fail to fetches playlist data with ID: " + id;
    const sendData = new Response(true, logStr, {
      id: id,
      error: err.message,
    });
    res.status(400).send(sendData);
  }
}
