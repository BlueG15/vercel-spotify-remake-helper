# vercel-spotify-remake-helper
extra functionalities made possible throigh scrapaping spotify, used for music apps that aim to replace spotify

**API Link**: *https://vercel-spotify-remake-helper.vercel.app/api/*

**Endpoints**: 


  **/getLink**: 

  
    input:
      ```ts
      {
        isrc : string,
        type? : "RICHSYNC" | "SUBTILES" | "LYRICS" //auto mode fetches all 3 and return the first in this priority that actuallyy correctly fetches
      }```

      
    output:
    ```ts
    interface MusixmatchLyrics {
      type : string;
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



  **/getThumbnail**: 

  
    input:
    ```ts
    {
      artistID : string
    }```

    
    output:
    <Its a response but I am too lazy to map out the data type, figure it out yourself pls>
