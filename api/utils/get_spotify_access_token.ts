import * as axiosOriginal from "axios"
const axios = axiosOriginal.default

interface accessTokenObj {
    clientId : string,
    accessToken : string,
    accessTokenExpirationTimestampMs : number,
    isAnonymous: boolean
}

const getAccessToken = () => new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: 'https://open.spotify.com/get_access_token',
    };

    axios.request(options).then(function (response : any) {
      resolve(response.data as accessTokenObj);
    }).catch(function (error : any) {
      resolve(undefined);
    });
}) as Promise<accessTokenObj> | Promise<undefined>

export default getAccessToken