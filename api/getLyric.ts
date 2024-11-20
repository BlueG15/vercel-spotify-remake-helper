import type { VercelRequest, VercelResponse } from "@vercel/node";

import { getPropertyNameFromReqObject, Response } from "./utils";
import { MusixMatch } from "./utils/musix_match_lyric";

//max 9 seconds
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const musix = new MusixMatch();
  const isrc = getPropertyNameFromReqObject(req, "isrc");
  const type = getPropertyNameFromReqObject(req, "type");

  try {
    const data = await musix.main(isrc, type);

    // # Musix match based case failed
    if (!data) {
      const logStr = `Failed to fetch song with ISRC: ${isrc}`;
      const response = new Response(true, logStr, { isrc });
      return res.status(400).send(response);
    }

    // # Self-implemented
    if (data instanceof Response) {
      return res.status(data.status).send(data);
    }

    // # IDK what this is
    const logStr = `Successfully fetches lyrics with ISRC: ${isrc}`;
    const response = new Response(false, logStr, data);
    res.send(response);
  } catch (error) {
    const logStr = `Failed to fetches song with ISRC: ${isrc}`;
    const response = new Response(true, logStr, { isrc, error });
    res.status(400).send(response);
  }
}
