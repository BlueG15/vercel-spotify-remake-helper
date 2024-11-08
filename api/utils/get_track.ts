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

export default getTrack