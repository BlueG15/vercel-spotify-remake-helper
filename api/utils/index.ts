import { VercelRequest, VercelResponse } from "@vercel/node";

class Response<T extends Object> {
  timeStamp: string;
  status: number;
  fail: boolean;
  note: string;
  data: T;

  /**
   * Create a new response object
   * @param fail Response status
   * @param note Response note (for logging purpose)
   * @param data Response data
   * @param _status Status code
   */
  constructor(fail: boolean, note: string, data?: T, _status?: number) {
    let time = new Date().toISOString();

    //# Lol this is funny, might keep this
    switch (fail) {
      case false: {
        console.log(note);
        this.fail = false;
        this.note = note;
        this.timeStamp = time;
        this.data = data ?? ({} as T);
        this.status = _status ? _status : 200;
        break;
      }

      case true: {
        this.fail = true;
        this.note = note;
        this.timeStamp = time;
        this.data = data ?? ({} as T);
        this.status = _status ? _status : 400;
        break;
      }

      default: {
        console.log(
          "You should get this shit checked mate, cause this cannot happened"
        );
      }
    }
  }

  fixAndAppendData(note: string) {
    this.note += " " + note;
  }
}

const CANNOT_FETCH_RESPONSE = new Response(
  true,
  "cannot get lyric for song with this isrc",
  { isrc: "" },
  400
);
const COPRIGHTED_RESPONSE = new Response(
  true,
  "lyrics is copyrighted, musixmatch refused to provide",
  {},
  403
);

/**
 * #### Retrieve environments variables from coressonding to the current .env file
 * If the variable doesn't exist, a warning will be logged out
 * @param key The key of the variable
 * @returns ENV keys (empty string if not found)
 */
function getENVKey(key: string) {
  const value = process.env[key];

  if (typeof value !== "string") {
    console.warn(`Trying to search for env key: '${key}', can't find shit`);
    return "";
  }

  return value;
}

/**
 * #### Get property name from Vercel's request object
 * @param key The key of the variable
 * @returns ENV keys (empty string if not found)
 */
function getPropertyNameFromReqObject(
  req: VercelRequest,
  propertyName: string,
  defaultValue?: any
) {
  let res: any = defaultValue;

  if (req.body && req.body[propertyName]) {
    res = req.body[propertyName];
  } else if (req.query[propertyName]) {
    res = req.query[propertyName];
  } else if (req.cookies[propertyName]) {
    res = req.cookies[propertyName];
  }

  return res;
}

function cors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
}

export {
  Response,
  CANNOT_FETCH_RESPONSE,
  COPRIGHTED_RESPONSE,
  getENVKey,
  getPropertyNameFromReqObject,
  cors,
};
