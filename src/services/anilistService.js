import { GraphQLClient, gql } from 'graphql-request';

const endpoint = 'https://graphql.anilist.co';

const episodesQuery = gql`
  query GetRecentEpisodes($perPage: Int, $now: Int) {
    Page(perPage: $perPage) {
      airingSchedules(sort: TIME_DESC, airingAt_lesser: $now) {
        episode
        airingAt
        media {
          id
          title {
            romaji
            english
            native
          }
          siteUrl
          coverImage {
            medium
            large
          }
          isAdult
        }
      }
    }
  }
`;

const animesQuery = gql`
  query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(
      type: ANIME
      format_in: [TV, MOVIE]
      status: RELEASING
      sort: POPULARITY_DESC
    ) {
      id
      title {
        romaji
        english
      }
      format
      status
      episodes
      startDate {
        year
        month
        day
      }
      siteUrl
      coverImage {
        large
      }
      isAdult
    }
  }
}
`;


export async function fetchRecentAnimes(page = 1, perPage = 50) {
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request(animesQuery, { page, perPage });
    return data.Page.media.reverse();
  } catch (error) {
    console.log("Animes çekilirken hata oluştu:", error);
    return []; // Hata durumunda boş bir dizi döndür
  }
}

export async function fetchRecentEpisodes(perPage = 100) {
  try {
    const client = new GraphQLClient(endpoint);
    const now = Math.floor(Date.now() / 1000);

    const recentAnimes = await fetchRecentAnimes();
    const animeIds = new Set(recentAnimes.map(a => a.id));

    const data = await client.request(episodesQuery, { perPage, now });
    /*
    console.log("Recent episodes fetched:", data.Page.airingSchedules.map(ep => ({
      episode: ep.episode,
      title: ep.media.title.romaji,
      airingAt: new Date(ep.airingAt * 1000).toLocaleString(),
    })));*/

    return data.Page.airingSchedules.filter(
      ep => animeIds.has(ep.media.id)
    ).reverse();
  } catch (error) {
    console.log("Bölümler çekilirken hata oluştu:", error);
    return []; // Hata durumunda boş bir dizi döndür
  }
}
