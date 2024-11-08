import type { VercelRequest, VercelResponse } from '@vercel/node'
import util from "util"
import { response } from './utils/response';
import getPropertyNameFromReqObject from './utils/getPropertyFromReq';
import getAccessToken from './utils/get_spotify_access_token';
import getTrack from './utils/get_track';

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
        Vres.status(400).send(new response(true, "fail to fetches artist thumbnail with this ID", {artistID : artistID}))
    }
    Vres.status(200).send(new response(false, "successfully fetches artist thumbnail data", data));
}