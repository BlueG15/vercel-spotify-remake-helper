# vercel-spotify-remake-helper
Extra functionalities made possible through scraping spotify, used for music apps that aim to replace spotify

Programed on ts, hosted on Vercel by Blu, 20/Oct/2024

**API Link**: *https://vercel-spotify-remake-helper.vercel.app/api/*

**Endpoints**: 


  **/getLyric**: 
   
   Utilizes a musixmatch backdoor to get time stamped lyrics of songs using their isrc
   
   Type explanation:
     
     RICHSYNC : timestamped to the word level
     
     SUBTITLES : timestamped to the sentences level
     
     LYRICS : no timestamped
  
   
   Input: 

   
   These can be query params or included in request body
   
   ```ts
   {
       isrc : string,
       type? : "RICHSYNC" | "SUBTILES" | "LYRICS"
       //no type or type isnt those 3 mean auto mode
       //auto mode fetches all 3 and return the first in this priority that actuallyy correctly fetched
   }

   ```
     
   Output:
   ```ts
    interface MusixmatchLyrics {
     type : string; //RICHSYNC, SUBTITLES, or LYRICS
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

    interface response {
      timeStamp: string
      status : number
      fail : boolean
      note : string
      data : MusixmatchLyrics
    }
   ```



  **/getArtist**: 
  
   Get artist object from spotify
   Please note that this is different from the official api
   Imitates an annonimous account for fetching
  
   Input:
   ```ts
    {
      artistID : string
      //ID is the part after /artists in the artist profile on spotify
      //ex : https://open.spotify.com/artist/0K05TDnN7xPwIHDOwD2YYs
      //artistID = 0K05TDnN7xPwIHDOwD2YYs
    }
   ```

    
   Output:
    <Its a response but I am too lazy to map out the data type, figure it out yourself pls>

   **/getTrack**: 
  
   Get track object from spotify
   Please note that this is different from the official api
   Imitates an annonimous account for fetching
  
   Input:
   ```ts
    {
      trackID : string
    }
   ```

    
   Output:
    <Its a response but I am too lazy to map out the data type, figure it out yourself pls>

   **/getPlaylist**: 
  
   Get playlist object from spotify
   Please note that this is different from the official api
   Imitates an annonimous account for fetching
  
   Input:
   ```ts
    {
      playlistID : string,
      offset : number, //optional, default = 0
      limit : number  //optional, default = 15
    }
   ```

    
   Output:
    <Its a response but I am too lazy to map out the data type, figure it out yourself pls>
