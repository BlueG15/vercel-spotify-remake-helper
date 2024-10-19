import util from "util"
import * as axiosOriginal from "axios"
import { response } from "./response";
const axios = axiosOriginal.default

const CANNOT_FETCH_RESPONSE = new response(true, "cannot get lyric for song with this isrc", {isrc : ""})

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
	"LYRICS" = 'track.lyrics.get',
    "SUBTITLES" = 'track.subtitles.get',
	"RICHSYNC" = 'track.richsync.get'
}

type MusixmatchLyricType = MusixmatchLyricTypes[keyof MusixmatchLyricTypes];

class MusixMatch {
    //LYRIC_TYPES: MusixmatchLyricTypes;
    protected tokens: string[] = [];
    private get api_base() {
        return "https://curators.musixmatch.com/ws/1.1/";
    };
    private get token(){
        return this.tokens[Math.floor(Math.random() * this.tokens.length)];
    };
    addToken(...token: string[]): void {
        this.tokens.push(...token);
    };
    constructor(){
        let concatstr = process.env.key_concat_string;
        let num = Number(process.env.key_length);

        let i = 0;
        while(i < concatstr.length){
            let substr = concatstr.slice(i, i + num);
            this.addToken(substr);
            i += num;
        }
    };
    private getLyrics(isrc: string): Promise<MusixmatchLyrics>{
        //just lyrics, no time signature, no nothing
        return new Promise(async (res, rej) => {
            this.requestLyrics(isrc, MusixmatchLyricTypes.LYRICS).then((req) => {
              const lyric = req.message.body.lyrics;
              lyric.lyrics_body = this.processLyrics(lyric.lyrics_body.toString());
              res(lyric);
            }).catch((e) => {
              rej(e);
            });
          });
    };
    private getSubtitleLyrics(isrc: string): Promise<MusixmatchLyrics>{
        //time signatured lyrics to the sentences level
        return new Promise((res, rej) => {
            this.requestLyrics(isrc, MusixmatchLyricTypes.SUBTITLES).then((req) => {
              const lyric = req.message.body.subtitle_list[0].subtitle;
              lyric.subtitle_body = this.processSubtitles(lyric.subtitle_body.toString());
              res(lyric);
            }).catch((e) => {
              rej(e);
            });
          });
    };
    private getRichsyncLyrics(isrc: string): Promise<MusixmatchLyrics>{
        //time signatured lyrics to the word level
        return new Promise((res, rej) => {
            this.requestLyrics(isrc, MusixmatchLyricTypes.RICHSYNC).then((req) => {
              const lyric = req.message.body.richsync;
              lyric.richsync_body = this.processRichsync(lyric.richsync_body.toString());
              res(lyric);
            }).catch((e) => {
              rej(e);
            });
          });
    };
    protected buildSearchParams(isrc: string): URLSearchParams{
        const params = {
            format: "json",
            track_isrc: isrc,
            tags: "nowplaying",
            user_language: "en",
            subtitle_format: "mxm",
            app_id: "web-desktop-app-v1.0",
            usertoken: this.token
          };
          return new URLSearchParams(params);
    };

    private async requestLyricsAuto(isrc : string) : Promise<MusixmatchLyrics>{
        //auto in this priority:
        //richsync -> subtitle -> lyric

        return new Promise((res, rej) => {
            let arr = [this.getRichsyncLyrics(isrc), this.getSubtitleLyrics(isrc), this.getLyrics(isrc)]
            Promise.allSettled(arr).then(result => {
                if(result[0] && result[0].status == 'fulfilled') return res(result[0].value);
                if(result[1] && result[1].status == 'fulfilled') return res(result[1].value);
                if(result[2] && result[2].status == 'fulfilled') return res(result[2].value);            
            })

            let a = CANNOT_FETCH_RESPONSE;
            a.data.isrc = isrc;
            rej(a);
        })
    }

    private requestLyrics(isrc: string, type?: MusixmatchLyricType): Promise<MusixmatchLyricResponse>{
        //ping musixmatch
        //rewritten by me to use axios instead

        return new Promise((res, rej) => {
            const URL = `${this.api_base}/${type}?${this.buildSearchParams(isrc).toString()}`;
            const config = {
                headers :  {
                    'Cookie': "x-mxm-user-id="
                }
            }
            axios.get(URL, config).then(axiosRes => {
                if(axiosRes.status != 200){
                    let a = CANNOT_FETCH_RESPONSE;
                    a.data.isrc = isrc;
                    rej(a);  
                }
                const data = axiosRes.data as MusixmatchLyricResponse
                if(data.message.header.status_code != 200){
                    let a = CANNOT_FETCH_RESPONSE;
                    a.data.isrc = isrc;
                    rej(a);
                }
                res(data)
            })
            .catch(err => {
                let a = CANNOT_FETCH_RESPONSE;
                a.data.isrc = isrc;
                a.fixAndAppendData(util.format(err));
                rej(a);
            })
        })
    };
    protected processLyrics(lyrics_body: string): MusixmatchLyric[] {
        const body = lyrics_body.split("\n");
        return body.map((item) => ({
        text: item
        }));
    };
    protected processSubtitles(subtitle_body: string): MusixmatchSubtitle[]{
        return [{
            text : subtitle_body,
            time : {
                total : -1,
                minutes: -1,
                seconds : -1,
                hundredths : -1
            }
        }]
        //return JSON.parse(subtitle_body);
    };
    protected processRichsync(richsync_body: string): MusixmatchRichsync[]{
        const body = JSON.parse(richsync_body);
        return body.map((item) => ({
            start: item.ts * 1000, //ms
            end: item.te * 1000, //ms
            body: item.l.map((item2) => ({
                text: item2.c,
                offset: item2.o
            })),
            text: item.x
        }));
    };

    main(isrc: string, type? : string){
        if(type == "RICHSYNC"){
            return this.getRichsyncLyrics(isrc);
        } else if(type == "SUBTITLES"){
            return this.getSubtitleLyrics(isrc);
        } else if(type == "LYRICS") {
            return this.getLyrics(isrc);
        } else return this.requestLyricsAuto(isrc);
    }
}

export { MusixMatch }