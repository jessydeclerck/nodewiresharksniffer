const axios = require("axios");
module.exports = {
  handleData: function(msg) {
    msgType = msg.__type__;
    dispatcher[msgType](msg);
  }
};

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
  // currentMap = await getCoordinates(msg.mapId); //TODO might need to avoid global vars and use getters and setters
  // console.log(currentMap);
  // if (!currentMap || !mapToGo) return;
  // if (isMapToGo(currentMap)) console.log("Indice trouvé !");
};

let updateCurrentMap = async msg => {
  console.log("update current map");
  currentMap = await getCoordinates(msg.mapId); //TODO might need to avoid global vars and use getters and setters
  console.log(currentMap);
  if (!currentMap || !mapToGo) return;
  if (isMapToGo(currentMap)) console.log("Indice trouvé !");
};

let handleTreasureHuntMessage = async msg => {
  const {
    availableRetryCount,
    checkPointCurrent,
    checkPointTotal,
    flags,
    knowStepsList,
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

function isMapToGo(map) {
  return map.posX == mapToGo.posX && map.posY == mapToGo.posY;
}

async function getCoordinates(mapId) {
  try {
    const response = await axios.get(
      `http://vps408293.ovh.net:8080/mapposition/${mapId}`
    );
    return response.data;
  } catch (err) {
    console.log(err);
  }
  return "";
}
