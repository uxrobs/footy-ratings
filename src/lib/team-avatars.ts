import type { StaticImageData } from "next/image";

import avatarAde from "../../images/Avatar-ADE.png";
import avatarBri from "../../images/Avatar-BRI.png";
import avatarCar from "../../images/Avatar-CAR.png";
import avatarCol from "../../images/Avatar-COL.png";
import avatarEss from "../../images/Avatar-ESS.png";
import avatarFre from "../../images/Avatar-FRE.png";
import avatarGcs from "../../images/Avatar-GCS.png";
import avatarGee from "../../images/Avatar-GEE.png";
import avatarGws from "../../images/Avatar-GWS.png";
import avatarHaw from "../../images/Avatar-HAW.png";
import avatarMel from "../../images/Avatar-MEL.png";
import avatarNor from "../../images/Avatar-NOR.png";
import avatarPor from "../../images/Avatar-POR.png";
import avatarRic from "../../images/Avatar-RIC.png";
import avatarStk from "../../images/Avatar-STK.png";
import avatarSyd from "../../images/Avatar-SYD.png";
import avatarWce from "../../images/Avatar-WCE.png";
import avatarWbd from "../../images/Avatar-WBD.png";

const TEAM_AVATAR_IMAGES: Record<string, StaticImageData> = {
  Adelaide: avatarAde,
  "Brisbane Lions": avatarBri,
  Carlton: avatarCar,
  Collingwood: avatarCol,
  Essendon: avatarEss,
  Fremantle: avatarFre,
  Geelong: avatarGee,
  "Gold Coast": avatarGcs,
  "Greater Western Sydney": avatarGws,
  Hawthorn: avatarHaw,
  Melbourne: avatarMel,
  "North Melbourne": avatarNor,
  "Port Adelaide": avatarPor,
  Richmond: avatarRic,
  "St Kilda": avatarStk,
  Sydney: avatarSyd,
  "West Coast": avatarWce,
  "Western Bulldogs": avatarWbd,
};

export function getTeamAvatarImage(team: string): StaticImageData {
  return TEAM_AVATAR_IMAGES[team] ?? avatarAde;
}
