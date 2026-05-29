const TEAM_COLORS: Record<string, { primary: string; text: string }> = {
  Adelaide: { primary: "#002B5C", text: "#E21937" },
  "Brisbane Lions": { primary: "#A30046", text: "#FDDB00" },
  Carlton: { primary: "#0E1E2D", text: "#FFFFFF" },
  Collingwood: { primary: "#000000", text: "#FFFFFF" },
  Essendon: { primary: "#010101", text: "#CC2030" },
  Fremantle: { primary: "#2A0D54", text: "#FFFFFF" },
  Geelong: { primary: "#002B5C", text: "#FFFFFF" },
  "Gold Coast": { primary: "#E02112", text: "#FFDD00" },
  "Greater Western Sydney": { primary: "#F47920", text: "#FFFFFF" },
  Hawthorn: { primary: "#4D2004", text: "#FBBF15" },
  Melbourne: { primary: "#CC2030", text: "#0E1E2D" },
  "North Melbourne": { primary: "#003399", text: "#FFFFFF" },
  "Port Adelaide": { primary: "#008AAB", text: "#FFFFFF" },
  Richmond: { primary: "#FFD200", text: "#000000" },
  "St Kilda": { primary: "#ED1B2F", text: "#FFFFFF" },
  Sydney: { primary: "#ED171F", text: "#FFFFFF" },
  "West Coast": { primary: "#003087", text: "#F2A900" },
  "Western Bulldogs": { primary: "#014896", text: "#BD002B" },
};

export function getTeamColors(team: string) {
  return TEAM_COLORS[team] ?? { primary: "#1a1a1a", text: "#ffffff" };
}

export function getTeamAbbreviation(team: string): string {
  const abbreviations: Record<string, string> = {
    Adelaide: "ADE",
    "Brisbane Lions": "BRI",
    Carlton: "CAR",
    Collingwood: "COL",
    Essendon: "ESS",
    Fremantle: "FRE",
    Geelong: "GEE",
    "Gold Coast": "GCS",
    "Greater Western Sydney": "GWS",
    Hawthorn: "HAW",
    Melbourne: "MEL",
    "North Melbourne": "NMFC",
    "Port Adelaide": "PAFC",
    Richmond: "RIC",
    "St Kilda": "STK",
    Sydney: "SYD",
    "West Coast": "WCE",
    "Western Bulldogs": "WB",
  };
  return abbreviations[team] ?? team.slice(0, 3).toUpperCase();
}
