import type { VercelRequest, VercelResponse } from '@vercel/node'
import getAccessToken from './utils/get_spotify_access_token';
import * as axiosOriginal from "axios"
const axios = axiosOriginal.default

const getTrack = (token : string, trackID : string) => new Promise((resolve, reject) => {
    const options = {
    method: 'GET',
    url: 'https://api-partner.spotify.com/pathfinder/v1/query',
    params: {
        operationName: 'getTrack',
        variables: `{"uri":"spotify:track:${trackID}"}`,
        extensions: process.env.extensionStr2
    },
    headers: {
        Authorization: `Bearer ${token}`
    }
    };

    axios.request(options).then(function (response : any) {
        resolve(response.data);
    }).catch(function (error : any) {
        resolve(undefined);
    });
}) as Promise<Object> | Promise<undefined>

function getPropertyNameFromReqObject(req : VercelRequest, propertyName : string, defaultValue? : any){
    let res : any = defaultValue
    if (req.body && req.body[propertyName]) {
        res = req.body[propertyName];
    } else if (req.query[propertyName]) {
        res = req.query[propertyName];
    } else if (req.cookies[propertyName]) {
        res = req.cookies[propertyName];
    }
    return res
}

//max 9 seconds
export default async function handler(req: VercelRequest, Vres: VercelResponse) {

    let trackID = getPropertyNameFromReqObject(req, "trackID");

    let bearerData = await getAccessToken();
    if(!bearerData) {
        Vres.status(500).send(new response(true, "fail to fetches bearerToken", {}));
        return;
    }
    let data = await getTrack(bearerData.accessToken, trackID);
    if(!data || data.errors){
        Vres.status(400).send(new response(true, "fail to fetches track data with this ID", {trackID : trackID}))
    }
    Vres.status(200).send(new response(false, "successfully fetches track data", data));
}

class response<T extends Object>  {
    timeStamp: string
    status : number
    fail : boolean
    note : string
    data : T
    constructor(fail : boolean, note : string, data? : T, _status? : number){
        let time = new Date().toISOString()
        switch(fail) {
        case false : {
                console.log(note)
                this.fail = false
                this.note = note
                this.timeStamp = time
                this.data = data ?? {} as T
                this.status = _status ? _status : 200;
                break
            } 
        default : {
                this.fail = true
                this.note = note
                this.timeStamp = time
                this.data = data ?? {} as T
                this.status = _status ? _status : 400;
            }  
        }
    }
    fixAndAppendData(note: string){
        this.note += " " + note;
    }
}
