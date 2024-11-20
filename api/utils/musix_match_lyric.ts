import * as util from "util";
import axios from "axios";

import { CANNOT_FETCH_RESPONSE, COPRIGHTED_RESPONSE, getENVKey } from ".";

interface MusixmatchLyricResponse {
  message: {
    header: {
      status_code: number;
      execute_time: number;
      available: number;
    };
    body: any;
  };
}

interface MusixmatchLyrics {
  type: string;
  action_requested: string;
  backlink_url: string;
  can_edit: number;
  explicit: number;
  html_tracking_url: string;
  instrumental: number;
  locked: number;
  lyrics_body: MusixmatchLyric[];
  subtitle_body: MusixmatchSubtitle[];
  richsync_body: MusixmatchRichsync[];
  lyrics_copyright: string;
  lyrics_id: number;
  lyrics_language: string;
  lyrics_language_description: string;
  pixel_tracking_url: string;
  published_status: number;
  publisher_list: any[];
  restricted: number;
  script_tracking_url: string;
  updated_time: string;
  verified: number;
}

interface MusixmatchLyric {
  text: string;
}

interface MusixmatchSubtitle {
  text: string;
  time: {
    total: number;
    minutes: number;
    seconds: number;
    hundredths: number;
  };
}

interface MusixmatchRichsync {
  start: number;
  end: number;
  body: MusixmatchRichsyncBody[];
  text: string;
}

interface MusixmatchRichsyncBody {
  text: string;
  offset: number;
}

enum MusixmatchLyricTypes {
  "LYRICS" = "track.lyrics.get",
  "SUBTITLES" = "track.subtitles.get",
  "RICHSYNC" = "track.richsync.get",
}

type MusixmatchLyricType = MusixmatchLyricTypes[keyof MusixmatchLyricTypes];

class MusixMatch {
  //LYRIC_TYPES: MusixmatchLyricTypes;
  protected tokens: string[] = [];

  private get api_base() {
    return "https://curators.musixmatch.com/ws/1.1/";
  }

  private get token() {
    return this.tokens[Math.floor(Math.random() * this.tokens.length)];
  }

  addToken(...token: string[]): void {
    this.tokens.push(...token);
  }

  constructor() {
    const concatstr = getENVKey("key_concat_string");
    const num = Number(getENVKey("key_length"));

    let i = 0;
    while (i < concatstr.length) {
      const substr = concatstr.slice(i, i + num);
      this.addToken(substr);
      i += num;
    }
  }

  /**
   * #### Lyrics without time synced
   * @param isrc The track's ISRC code
   * @returns Unsynced lyrics
   */
  private getLyrics(isrc: string): Promise<MusixmatchLyrics> {
    //just lyrics, no time signature, no nothing
    return new Promise(async (res, rej) => {
      this.requestLyrics(isrc, MusixmatchLyricTypes.LYRICS)
        .then((req) => {
          const lyric = req.message.body.lyrics;
          lyric.lyrics_body = this.processLyrics(lyric.lyrics_body.toString());
          lyric.type = "LYRICS";
          res(lyric);
        })
        .catch((e) => {
          rej(e);
        });
    });
  }

  /**
   * #### Time signatured lyrics to the sentences level
   * @param isrc The track's ISRC code
   * @returns Richsynced lyrics
   */
  private getSubtitleLyrics(isrc: string): Promise<MusixmatchLyrics> {
    return new Promise((res, rej) => {
      this.requestLyrics(isrc, MusixmatchLyricTypes.SUBTITLES)
        .then((req) => {
          const lyric = req.message.body.subtitle_list[0].subtitle;
          lyric.subtitle_body = this.processSubtitles(
            lyric.subtitle_body.toString()
          );
          lyric.type = "SUBTITLES";
          res(lyric);
        })
        .catch((e) => {
          rej(e);
        });
    });
  }

  /**
   * #### Time signatured lyrics to the word level
   * @param isrc The track's ISRC code
   * @returns Richsynced lyrics
   */
  private getRichsyncLyrics(isrc: string): Promise<MusixmatchLyrics> {
    return new Promise((res, rej) => {
      this.requestLyrics(isrc, MusixmatchLyricTypes.RICHSYNC)
        .then((req) => {
          const lyric = req.message.body.richsync;
          lyric.richsync_body = this.processRichsync(
            lyric.richsync_body.toString()
          );
          lyric.type = "RICHSYNC";
          res(lyric);
        })
        .catch((e) => {
          rej(e);
        });
    });
  }

  /**
   * #### Get request's search parameters
   * @param isrc The track's ISRC code
   * @returns Search Parameter
   */
  protected buildSearchParams(isrc: string): URLSearchParams {
    const params = {
      format: "json",
      track_isrc: isrc,
      tags: "nowplaying",
      user_language: "en",
      subtitle_format: "mxm",
      app_id: "web-desktop-app-v1.0",
      usertoken: this.token,
    };

    return new URLSearchParams(params);
  }

  /**
   * Auto fecth the top most prioritized lyrics type
   * * Auto in this priority:
   *   Richsync -> Subtitle -> Lyrics
   * @param isrc The track's ISRC code
   * @returns Lyrics (Richsync -> Subtitle -> Lyrics)
   */
  private async requestLyricsAuto(isrc: string): Promise<MusixmatchLyrics> {
    // # Auto in this priority:
    // # Richsync -> Subtitle -> Lyrics

    return new Promise((resolve, reject) => {
      const arr = [
        this.getRichsyncLyrics(isrc),
        this.getSubtitleLyrics(isrc),
        this.getLyrics(isrc),
      ];

      Promise.allSettled(arr).then((results) => {
        for (const result of results) {
          if (!result) continue;
          if (result.status === "rejected") continue;

          return resolve(result.value);
        }

        const failed = CANNOT_FETCH_RESPONSE;
        failed.data.isrc = isrc;
        reject(failed);
      });
    });
  }

  /**
   * #### Fetch the lyrics from MUSIXMATCH
   * @param isrc Retrieved the lyrics from musix match
   * @param type The type of the lyrics
   * @returns Requested lyrics
   */
  private requestLyrics(
    isrc: string,
    type?: MusixmatchLyricType
  ): Promise<MusixmatchLyricResponse> {
    // # Ping musixmatch
    // # Rewritten by me to use axios instead

    return new Promise((res, rej) => {
      const URL = `${this.api_base}/${type}?${this.buildSearchParams(
        isrc
      ).toString()}`;
      const config = {
        headers: {
          Cookie: "x-mxm-user-id=",
        },
      };
      axios
        .get(URL, config)
        .then((axiosRes) => {
          if (axiosRes.status != 200) {
            let a = CANNOT_FETCH_RESPONSE;
            a.data.isrc = isrc;
            rej(a);
          }
          const data = axiosRes.data as MusixmatchLyricResponse;
          if (data.message.header.status_code != 200) {
            let a = CANNOT_FETCH_RESPONSE;
            a.data.isrc = isrc;
            rej(a);
          }
          res(data);
        })
        .catch((err) => {
          let a = CANNOT_FETCH_RESPONSE;
          a.data.isrc = isrc;
          a.fixAndAppendData(util.format(err));
          rej(a);
        });
    });
  }

  // ? Processing function (I'm guessing clean up functions)

  protected processLyrics(lyrics_body: string): MusixmatchLyric[] {
    const body = lyrics_body.split("\n");
    return body.map((item) => ({
      text: item,
    }));
  }

  protected processSubtitles(subtitle_body: string): MusixmatchSubtitle[] {
    try {
      let a = JSON.parse(subtitle_body);
      return a;
    } catch (err) {
      return [];
    }
  }

  protected processRichsync(richsync_body: string): MusixmatchRichsync[] {
    const body = JSON.parse(richsync_body);
    return body.map((item) => ({
      start: item.ts * 1000, //ms
      end: item.te * 1000, //ms
      body: item.l.map((item2) => ({
        text: item2.c,
        offset: item2.o,
      })),
      text: item.x,
    }));
  }

  // ? main? What is this? Complied language?

  async main(isrc: string, type?: string) {
    let res: MusixmatchLyrics;

    if (type == "RICHSYNC") {
      res = await this.getRichsyncLyrics(isrc);
    } else if (type == "SUBTITLES") {
      res = await this.getSubtitleLyrics(isrc);
    } else if (type == "LYRICS") {
      res = await this.getLyrics(isrc);
    } else res = await this.requestLyricsAuto(isrc);

    if (res.restricted) {
      let x = COPRIGHTED_RESPONSE;
      x.data = res;
      return x;
    }

    return res;
  }
}

export { MusixMatch };
