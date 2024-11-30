import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const db = locals.db;

  const query = `
    SELECT 
      ue.artist_id as artist_id,
      ue.event_type as event_type,
      ue.created_at as created_at,
      u.timezone as timezone
    FROM
      user_events ue
    JOIN
      users u ON ue.user_id = u.id
    WHERE
      ue.event_type = 'like_track' OR
      ue.event_type = 'play_track' OR
      ue.event_type = 'add_track_to_playlist' OR
      ue.event_type = 'share_track' OR
      ue.event_type = 'follow_artist' OR
      ue.event_type = 'share_artist' OR
      ue.event_type = 'hover_artist_name'
    GROUP BY
      ue.id
    ORDER BY
      ue.artist_id
  `;

  const data = await db.prepare(query).all();

  return {
    data,
  };
};
