const axios = require("axios");
module.exports = {
  handleData: function(msg) {
    msgType = msg.__type__;
    dispatcher[msgType](msg);
  }
};

const labelBaseUri = "http://vps408293.ovh.net:8080";

let currentMap, mapToGo, npcIdToFind;
let sizeStepList;

//TODO should be use for phorreur only ?
let handleMapInfo = async msg => {
  console.log("handle map info !");
  console.log(`handling ${msg.__type__}`);
  console.log(`mapId: ${msg.mapId}`);

  if (false) {
    //TODO if looking for npc
    msg.actors
      .filter(info => info.__type__ == "GameRolePlayTreasureHintInformations")
      .forEach(hintInfo => {
        if (hintInfo.npcId === npcIdToFind) {
          console.log("Phorreur trouvé !");
        }
      });
  }
};

let updateCurrentMap = async msg => {
  console.log("update current map");
  currentMap = await getCoordinates(msg.mapId); //TODO might need to avoid global vars and use getters and setters
  console.log(currentMap);
  if (!currentMap || !mapToGo) return;
  if (isMapToGo(currentMap)) console.log("Indice trouvé !");
  //TODO display remaining distance
};

let handleTreasureHuntMessage = async msg => {
  const {
    availableRetryCount,
    checkPointCurrent,
    checkPointTotal,
    flags,
    knownStepsList,
    questType,
    startMapId,
    totalStepCount
  } = msg;
};

let dispatcher = {
  MapComplementaryInformationsDataMessage: handleMapInfo,
  MapInformationsRequestMessage: updateCurrentMap,
  TreasureHuntMessage: handleTreasureHuntMessage
};

let getPoiSolution = async (startMap, poiId, directionId) => {
  console.log(`Looking for ${getPoiLabel(poiId)}`);
  const response = await axios.get(
    `https://dofus-map.com/huntTool/getData.php?x=${startMap.posX}&y=${
      startMap.posY
    }&direction=${getDirection(directionId)}&world=0&language=fr`
  );
  const { hints } = response.data;
  return hints.find(poiInfo => poiInfo.n === poiId);
};

function isMapToGo(map) {
  return map.posX == mapToGo.posX && map.posY == mapToGo.posY;
}

let getCoordinates = async mapId => {
  try {
    const response = await axios.get(`${labelBaseUri}/mapposition/${mapId}`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
  return "";
};

let getPoiLabel = async poiId => {
  try {
    const response = await axios.get(`${labelBaseUri}/poi/${poiId}`);
    return response.data.label;
  } catch (err) {
    console.log(err);
  }
  return "";
};

let getNpcLabel = async npcId => {
  try {
    const response = await axios.get(`${labelBaseUri}/npc/${npcId}`);
    return response.data.label;
  } catch (err) {
    console.log(err);
  }
  return "";
};

let getDirection = directionId => {
  let directions = {
    "0": "right",
    "2": "bottom",
    "4": "left",
    "6": "top"
  };
  return directions[directionId];
};
