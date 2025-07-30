import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient('https://graphql.anilist.co');

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
    const data = await client.request(animesQuery, { page, perPage });
    return data.Page.media.reverse();
  } catch (error) {
    console.error("Animes çekilirken hata oluştu:", error);
    return []; // Hata durumunda boş bir dizi döndür
  }
}

export async function fetchRecentEpisodes(perPage = 100) {
  try {
    const now = Math.floor(Date.now() / 1000);

    const recentAnimes = await fetchRecentAnimes();
    const animeIds = new Set(recentAnimes.map(a => a.id));

    const data = await client.request(episodesQuery, { perPage, now });

    return data.Page.airingSchedules.filter(
      ep => animeIds.has(ep.media.id)
    ).reverse();
  } catch (error) {
    console.error("Bölümler çekilirken hata oluştu:", error);
    return []; // Hata durumunda boş bir dizi döndür
  }
}
