export function formatTrack(track: any) {
  const {
    albumOfTrack: album,
    name,
    trackNumber,
    duration,
    firstArtist,
    otherArtists,
    playcount,
    id,

    ...others
  } = track;

  const mainArtist = firstArtist.items[0];

  return {
    id,
    name,
    type: "track",
    playcount: Number.parseInt(playcount),
    duration_ms: duration.totalMilliseconds,

    artists: [...firstArtist.items, ...otherArtists.items].map((artist) => {
      const { profile, visuals, id, discography } = artist;

      return {
        type: "artist",
        name: profile.name,
        id: id,
        images: visuals.avatarImage.sources || [],

        popularAlbums: discography.popularReleasesAlbums.items.map((a) => {
          const { name, date, coverArt, uri, albumType } = a;
          const [, , id] = uri.split(":");

          return {
            type: "album",
            name: name,
            id: id,
            date: date.isoString,
            images: coverArt.sources,
            color: coverArt.extractedColors.colorRaw.hex,
          };
        }),
      };
    }),

    trackNumber,

    mainArtistTopTrack: mainArtist.discography.topTracks.items.map((a) => {
      const { name, albumOfTrack, duration, playcount } = a.track;

      return {
        name,
        album: {
          type: "album",
          name: albumOfTrack.name,
          id: albumOfTrack.uri.split(":").slice(-1)[0],
          images: albumOfTrack.coverArt.sources,
        },
        duration_ms: duration.totalMilliseconds,
        playcount: Number.parseInt(playcount),
      };
    }),

    album: {
      type: "album",
      albumType: album.type.toLowerCase(),

      id: album.id,
      name: album.name,
      images: album.coverArt.sources || [],

      color: album.coverArt.extractedColors.colorRaw,

      tracks: {
        items: album.tracks.items.map((a) => {
          return a.track.uri;
        }),

        total: album.tracks.totalCount,
      },

      date: album.date.isoString,
    },

    others,
  };
}

export function tryToExtractObject(album: any) {
  try {
    return album.moreAlbumsByArtist.items[0].discography.popularReleasesAlbums
      .items;
  } catch {
    return [];
  }
}

export function formatAlbum(album: any) {
  const {
    name,
    uri,
    artists,
    discs,
    tracksV2,
    coverArt,
    copyright,
    type: albumType,
    label,
    date,
  } = album;

  const miniArtists = artists.items.map((a) => {
    const { profile, visuals, uri } = a;
    const [_, type, id] = uri.split(":");

    return {
      type,
      id,
      name: profile.name,

      images: visuals.avatarImage.sources,
    };
  });

  const [_, type, id] = uri.split(":");
  return {
    name,
    id,
    type,
    albumType: albumType.toLowerCase(),

    artists: miniArtists,

    discs: discs.items,
    tracks: tracksV2.items.map(({ track }) => {
      const { playcount, discNumber, duration, name, artists, uri } = track;

      const [_, type, id] = uri.split(":");

      return {
        type,
        id,
        name,
        discNumber,
        playcount: Number.parseInt(playcount),
        durationMs: duration.totalMilliseconds,
        artists: artists.items.map((a) => {
          const { profile, uri } = a;
          const [_, type, id] = uri.split(":");

          return {
            name: profile.name,
            id,
            type: "artist",
          };
        }),
      };
    }),

    images: coverArt.sources,
    color: coverArt.extractedColors.colorRaw,

    copyright: copyright.items,
    label: label,

    date: date.isoString,

    artistDiscography: {
      artist: miniArtists[0],
      items: tryToExtractObject(album).map((a) => ({
        images: a.coverArt.sources,
        date: a.date.year.toString(),

        name: a.name,
        type: a.type.toLowerCase(),
        id: a.id,
      })),
    },
  };
}

type AlbumTracks = {
  __typename: string;
  playability: {
    playable: boolean;
  };
  tracksV2: {
    items: Array<{
      track: {
        artists: {
          items: Array<{
            profile: {
              name: string;
            };
            uri: string;
          }>;
        };
        associationsV2: {
          totalCount: number;
        };
        contentRating: {
          label: string;
        };
        discNumber: number;
        duration: {
          totalMilliseconds: number;
        };
        name: string;
        playability: {
          playable: boolean;
        };
        playcount: string;
        relinkingInformation: any;
        saved: boolean;
        trackNumber: number;
        uri: string;
      };
      uid: string;
    }>;
    totalCount: number;
  };
};

export function formatAlbumTracks(albumTracks: AlbumTracks) {
  const { items } = albumTracks.tracksV2;

  return {
    items: items.map((item) => {
      const { artists, name, trackNumber, playcount, uri, duration } =
        item.track;

      const [, , id] = uri.split(":");

      return {
        type: "track",

        id,
        name,
        artists: artists.items.map((artist) => {
          const [, , id] = artist.uri.split(":");

          return {
            type: "artist",
            id,
            name: artist.profile.name,
          };
        }),

        durationMs: duration.totalMilliseconds,
        trackNumber,
        playcount: Number.parseInt(playcount),
      };
    }),
  };
}

type ArtistType = {
  artistUnion: {
    __typename: string;
    discography: {
      albums: {
        items: Array<{
          releases: {
            items: Array<{
              copyright: {
                items: Array<{
                  text: string;
                  type: string;
                }>;
              };
              coverArt: {
                sources: Array<{
                  height: number;
                  url: string;
                  width: number;
                }>;
              };
              date: {
                day: number;
                month: number;
                precision: string;
                year: number;
              };
              id: string;
              label: string;
              name: string;
              playability: {
                playable: boolean;
                reason: string;
              };
              sharingInfo: {
                shareId: string;
                shareUrl: string;
              };
              tracks: {
                totalCount: number;
              };
              type: string;
              uri: string;
            }>;
          };
        }>;
        totalCount: number;
      };
      compilations: {
        items: Array<any>;
        totalCount: number;
      };
      latest: {
        copyright: {
          items: Array<{
            text: string;
            type: string;
          }>;
        };
        coverArt: {
          sources: Array<{
            height: number;
            url: string;
            width: number;
          }>;
        };
        date: {
          day: number;
          month: number;
          precision: string;
          year: number;
        };
        id: string;
        label: string;
        name: string;
        playability: {
          playable: boolean;
          reason: string;
        };
        sharingInfo: {
          shareId: string;
          shareUrl: string;
        };
        tracks: {
          totalCount: number;
        };
        type: string;
        uri: string;
      };
      popularReleasesAlbums: {
        items: Array<{
          copyright: {
            items: Array<{
              text: string;
              type: string;
            }>;
          };
          coverArt: {
            sources: Array<{
              height: number;
              url: string;
              width: number;
            }>;
          };
          date: {
            day: number;
            month: number;
            precision: string;
            year: number;
          };
          id: string;
          label: string;
          name: string;
          playability: {
            playable: boolean;
            reason: string;
          };
          sharingInfo: {
            shareId: string;
            shareUrl: string;
          };
          tracks: {
            totalCount: number;
          };
          type: string;
          uri: string;
        }>;
        totalCount: number;
      };
      singles: {
        items: Array<{
          releases: {
            items: Array<{
              copyright: {
                items: Array<{
                  text: string;
                  type: string;
                }>;
              };
              coverArt: {
                sources: Array<{
                  height: number;
                  url: string;
                  width: number;
                }>;
              };
              date: {
                day: number;
                month: number;
                precision: string;
                year: number;
              };
              id: string;
              label: string;
              name: string;
              playability: {
                playable: boolean;
                reason: string;
              };
              sharingInfo: {
                shareId: string;
                shareUrl: string;
              };
              tracks: {
                totalCount: number;
              };
              type: string;
              uri: string;
            }>;
          };
        }>;
        totalCount: number;
      };
      topTracks: {
        items: Array<{
          track: {
            albumOfTrack: {
              coverArt: {
                sources: Array<{
                  url: string;
                }>;
              };
              uri: string;
            };
            artists: {
              items: Array<{
                profile: {
                  name: string;
                };
                uri: string;
              }>;
            };
            associations: {
              associatedVideos: {
                totalCount: number;
              };
            };
            contentRating: {
              label: string;
            };
            discNumber: number;
            duration: {
              totalMilliseconds: number;
            };
            id: string;
            name: string;
            playability: {
              playable: boolean;
              reason: string;
            };
            playcount: string;
            uri: string;
          };
          uid: string;
        }>;
      };
    };
    goods: {
      events: {
        concerts: {
          items: Array<any>;
          pagingInfo: {
            limit: number;
          };
          totalCount: number;
        };
        userLocation: {
          name: string;
        };
      };
      merch: {
        items: Array<any>;
      };
    };
    id: string;
    preRelease: any;
    profile: {
      biography: {
        text: string;
        type: string;
      };
      externalLinks: {
        items: Array<{
          name: string;
          url: string;
        }>;
      };
      name: string;
      pinnedItem: {
        backgroundImageV2: any;
        comment: string;
        itemV2: {
          __typename: string;
          data: {
            __typename: string;
            coverArt: {
              sources: Array<{
                height: number;
                url: string;
                width: number;
              }>;
            };
            name: string;
            type: string;
            uri: string;
          };
        };
        subtitle: string;
        thumbnailImage: {
          data: {
            sources: Array<{
              url: string;
            }>;
          };
        };
        title: string;
        type: string;
        uri: string;
      };
      playlistsV2: {
        items: Array<{
          data: {
            __typename: string;
            description: string;
            images: {
              items: Array<{
                sources: Array<{
                  height?: number;
                  url: string;
                  width?: number;
                }>;
              }>;
            };
            name: string;
            ownerV2: {
              data: {
                __typename: string;
                name: string;
              };
            };
            uri: string;
          };
        }>;
        totalCount: number;
      };
      verified: boolean;
    };
    relatedContent: {
      appearsOn: {
        items: Array<{
          releases: {
            items: Array<{
              artists: {
                items: Array<{
                  profile: {
                    name: string;
                  };
                  uri: string;
                }>;
              };
              coverArt: {
                sources: Array<{
                  height: number;
                  url: string;
                  width: number;
                }>;
              };
              date: {
                year: number;
              };
              id: string;
              name: string;
              sharingInfo: {
                shareId: string;
                shareUrl: string;
              };
              type: string;
              uri: string;
            }>;
            totalCount: number;
          };
        }>;
        totalCount: number;
      };
      discoveredOnV2: {
        items: Array<{
          data: {
            __typename: string;
            description?: string;
            id?: string;
            images?: {
              items: Array<{
                sources: Array<{
                  height?: number;
                  url: string;
                  width?: number;
                }>;
              }>;
              totalCount: number;
            };
            name?: string;
            ownerV2?: {
              data: {
                __typename: string;
                name: string;
              };
            };
            uri?: string;
          };
        }>;
        totalCount: number;
      };
      featuringV2: {
        items: Array<{
          data: {
            __typename: string;
            description: string;
            id: string;
            images: {
              items: Array<{
                sources: Array<{
                  height: any;
                  url: string;
                  width: any;
                }>;
              }>;
              totalCount: number;
            };
            name: string;
            ownerV2: {
              data: {
                __typename: string;
                name: string;
              };
            };
            uri: string;
          };
        }>;
        totalCount: number;
      };
      relatedArtists: {
        items: Array<{
          id: string;
          profile: {
            name: string;
          };
          uri: string;
          visuals: {
            avatarImage: {
              sources: Array<{
                height: number;
                url: string;
                width: number;
              }>;
            };
          };
        }>;
        totalCount: number;
      };
    };
    relatedVideos: {
      __typename: string;
      items: Array<any>;
      totalCount: number;
    };
    saved: boolean;
    sharingInfo: {
      shareId: string;
      shareUrl: string;
    };
    stats: {
      followers: number;
      monthlyListeners: number;
      topCities: {
        items: Array<{
          city: string;
          country: string;
          numberOfListeners: number;
          region: string;
        }>;
      };
      worldRank: number;
    };
    uri: string;
    visuals: {
      avatarImage: {
        extractedColors: {
          colorRaw: {
            hex: string;
          };
        };
        sources: Array<{
          height: number;
          url: string;
          width: number;
        }>;
      };
      gallery: {
        items: Array<{
          sources: Array<{
            height: number;
            url: string;
            width: number;
          }>;
        }>;
      };
      headerImage: {
        extractedColors: {
          colorRaw: {
            hex: string;
          };
        };
        sources: Array<{
          height: number;
          url: string;
          width: number;
        }>;
      };
    };
    watchFeedEntrypoint: any;
  };
};

export function formatArtist(artist: ArtistType) {
  const { profile, discography } = artist.artistUnion;

  const { latest, ...discographyWithItems } = discography;

  const discographyKeys = Object.keys(discographyWithItems);
  const formattedDiscography = {};

  for (const key of discographyKeys) {
    const disco = discographyWithItems[key];
    if (!disco.items) {
      continue;
    }

    const items = disco.items.map((item) => {
      switch (key) {
        case "singles":
        case "albums": {
          return item.releases.items[0];
        }

        case "topTracks": {
          return item.track;
        }

        default: {
          return item;
        }
      }
    });
    formattedDiscography[key] = items;
  }

  return {
    profile: {
      name: profile.name,
      playlists: profile.playlistsV2?.items,
      pinnedItems: profile.pinnedItem?.itemV2?.data || null,
    },

    discography: formattedDiscography,
  };
}
