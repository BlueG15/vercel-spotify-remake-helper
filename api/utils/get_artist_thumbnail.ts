import * as axiosOriginal from "axios"
const axios = axiosOriginal.default

const getArtistThumbnail = (token : string, artistID : string) => new Promise((resolve, reject) => {
    const options = {
    method: 'GET',
    url: 'https://api-partner.spotify.com/pathfinder/v1/query',
    params: {
        operationName: 'queryArtistOverview',
        variables: `{"uri":"spotify:artist:${artistID}","locale":"","includePrerelease":true}`,
        extensions: process.env.extensionStr
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

export default getArtistThumbnail