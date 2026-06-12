const webUrl = process.env.WEB_URL ?? "http://localhost:3000/play";
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function read(url, asJson = false) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return asJson ? response.json() : response.text();
}

const [html, state] = await Promise.all([
  read(webUrl),
  read(`${apiUrl}/api/state`, true),
]);

if (!html.includes("Prooflayer") || !html.includes("/_next/")) {
  throw new Error(`${webUrl} did not look like a Next app shell`);
}

if (!state.character?.id || !Array.isArray(state.character.skills)) {
  throw new Error(`${apiUrl}/api/state did not return character state`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      webUrl,
      apiUrl,
      character: state.character.name,
      totalLevel: state.character.totalLevel,
    },
    null,
    2
  )
);
