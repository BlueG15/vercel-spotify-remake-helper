import type { VercelRequest, VercelResponse } from "@vercel/node";

import { getPropertyNameFromReqObject, Response, cors } from "./utils";
import { getAccessToken, getTrack } from "./utils/spotify";
import { formatTrack } from "./utils/formatter";

//max 9 seconds
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = getPropertyNameFromReqObject(req, "id");

  req.on("close", () => {
    console.log(`[${id}] Request canceled by client`);
  });

  const token = await getAccessToken();
  if (!token) {
    const sendData = new Response(true, "Failed to fetch Bearer token", {});
    return res.status(500).send(sendData);
  }

  try {
    if (req.closed) return;

    const { data } = await getTrack(token.accessToken, id);

    if (data.trackUnion?.__typename === "GenericError") {
      throw new Error("Cannot find track with ID: " + id);
    }

    const logStr = `[${id}] Successfully fetches track data`;

    const formattedData = formatTrack(data.trackUnion);

    //# Hande CORS
    cors(res);

    //# Allow caching upto 1 hour
    res.setHeader("Cache-Control", "max-age=3600, public");
    res.setHeader("vary", "Accept");

    res.status(200).send(new Response(false, logStr, formattedData));
    // console.log(data);
  } catch (err) {
    const logStr = "Fail to fetches track data with ID: " + id;
    const sendData = new Response(true, logStr, {
      id: id,
      error: err.message,
    });
    res.status(400).send(sendData);
  }
}
