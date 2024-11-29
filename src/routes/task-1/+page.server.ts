import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const db = locals.db;

  const query = `
SELECT 
    a.id AS artist_id, 
    a.name AS artist_name, 
    sum(v.end_time - v.start_time) AS total_visit_duration,
    count(distinct v.session_id) AS unique_session_count,
    count(distinct s.user_id) as unique_session_count
FROM 
    artists a
JOIN 
    visits v ON a.id = v.artist_id
JOIN
    sessions s ON v.session_id = s.id
GROUP BY 
    a.id
`;

  const data = await db.prepare(query).all();

  return {
    data,
  };
};
