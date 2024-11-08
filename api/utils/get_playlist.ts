import * as axiosOriginal from "axios"
const axios = axiosOriginal.default

const getPlaylist = (token : string, playlistID : string, offset: number, limit: number) => new Promise((resolve, reject) => {
    const options = {
    method: 'GET',
    url: 'https://api-partner.spotify.com/pathfinder/v1/query',
    params: {
        operationName: 'fetchPlaylist',
        variables: `{"uri":"spotify:playlist:${playlistID}","offset":${offset},"limit":${limit}}`,
        extensions: process.env.extensionStr3
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

export default getPlaylist