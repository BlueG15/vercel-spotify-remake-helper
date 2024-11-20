import type { VercelRequest, VercelResponse } from "@vercel/node";

import { getPropertyNameFromReqObject, Response } from "./utils";
import { getArtist, getAccessToken } from "./utils/spotify";
import { formatArtist } from "./utils/formatter";

// # Timeout after 9 seconds
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = getPropertyNameFromReqObject(req, "id");
  const bearerData = await getAccessToken();

  if (!bearerData) {
    const sendData = new Response(true, "Failed to fetch Bearer token", {});
    return res.status(500).send(sendData);
  }

  try {
    const data = await getArtist(bearerData.accessToken, id);

    if (data.artistUnion?.__typename === "GenericError" || data.errors) {
      throw new Error("Cannot find artist with ID: " + id);
    }

    const logStr = `[${id}] Successfully fetches artist data`;
    const formatted = formatArtist(data.data);

    res.status(200).send(new Response(false, logStr, formatted));
    // console.log(data);
  } catch (err) {
    console.log(err);

    const logStr = "Fail to fetches artist data with ID: " + id;
    const sendData = new Response(true, logStr, {
      id: id,
      error: err.message,
    });
    res.status(400).send(sendData);
  }
}
