import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getENVKey } from "./utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).send({
    test: [
      "APP_VERSION",
      "extensionStr",
      "extensionStr2",
      "extensionStr3",
      "extensionStr4",
      "key_concat_string",
      "key_length",
      "total_key_number",
    ].map((a) => getENVKey(a)),
  });
}
