export const redirectResponse = (location: string | URL) =>
  new Response(null, {
    status: 307,
    headers: { Location: location.toString() }
  })
