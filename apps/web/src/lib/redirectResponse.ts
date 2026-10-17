// Response.redirect() returns immutable headers, which breaks Start appending the session's Set-Cookie headers.
export const redirectResponse = (location: string | URL) =>
  new Response(null, {
    status: 307,
    headers: { Location: location.toString() }
  })
