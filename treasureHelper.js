const axios = require("axios");
const indicesLoader = require("./indicesLoader");
const colors = require('colors');

module.exports = {
  handleData: function(msg) {
    msgType = msg.__type__;
    console.log(msgType);
    dispatcher[msgType](msg);
  }
};

const labelBaseUri = "http://vps408293.ovh.net:8080";

let currentMap, mapToGo, npcIdToFind;

//TODO should be use for phorreur only ?
let handleMapInfo = async msg => {
  if (npcIdToFind) {
    //TODO if looking for npc
    console.log("Looking map : looking for a phorreur");
    msg.actors
      .filter(info => info.__type__ == "GameRolePlayTreasureHintInformations")
      .forEach(hintInfo => {
        if (hintInfo.npcId === npcIdToFind) {
          console.log("Phorreur found !".green);
          npcIdToFind = null;
          
        }
      });
  }
};

let updateCurrentMap = async msg => {
  console.log("update current map");
  currentMap = await getCoordinates(msg.mapId); //TODO might need to avoid global vars and use getters and setters
  console.log(currentMap);
  if (!currentMap || !mapToGo) return;
  if (isMapToGo(currentMap)) {
    console.log("Indice trouvé !".green);
  }
  //TODO display remaining distance
};

let handleTreasureHuntMessage = async msg => {
  console.log("Handling treasure hunt message");
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
  //TODO promise.all
  let startMap;
  if(flags.length == 0 && checkPointCurrent == 0){
    startMap = await getCoordinates(startMapId);
  }else{
    startMap = currentMap;
  }
  lastPoi = knownStepsList[knownStepsList.length -1];
  if(lastPoi.__type__ === "TreasureHuntStepFollowDirectionToPOI"){
    console.log("We're looking for a point of interest");
    if(flags.length == totalStepCount) {
      console.log("Step finished");
      return;
    }
    let poiSolution = await getPoiSolution(startMap, lastPoi.poiLabelId, lastPoi.direction);
    mapToGo = {
      poiId : poiSolution.n,
      posX : poiSolution.x,
      posY : poiSolution.y,
      distance : poiSolution.d,
      direction : getDirection(lastPoi.direction)
    }
    console.log(mapToGo);
    npcIdToFind = null;
  } else if (lastPoi.__type__ === "TreasureHuntStepFollowDirectionToHint"){
    console.log("We're looking for a phorreur");
    npcIdToFind = lastPoi.npcId;
    mapToGo = null;
  }
};

let dispatcher = {
  MapComplementaryInformationsDataMessage: handleMapInfo,
  MapInformationsRequestMessage: updateCurrentMap,
  TreasureHuntMessage: handleTreasureHuntMessage,
  TreasureHuntFlagRequestMessage : function(){console.log("Requesting new indice")},
  TreasureHuntFlagRequestAnswerMessage : function(){console.log("Requesting new indice ok")},
  TreasureHuntDigRequestAnswerMessage : function(){console.log("Requesting dig")},
  TreasureHuntDigRequestMessage : function(){console.log("Requesting dig ok")},
  TreasureHuntFinishedMessage : function(){currentMap, mapToGo, npcIdToFind = null; console.log("Treasure hunt finished")},
  TreasureHuntFlagRemoveRequestMessage : function(){console.log("Treasure flag removed")},
  TreasureHuntRequestAnswerMessage : function(){console.log("New treasure hunt started")} //todo handle phorreur at start
};

let getPoiSolution = async (startMap, poiId, directionId) => {
  let poiLabel = await getPoiLabel(poiId);
  console.log("Looking for" + poiLabel);
  console.log(startMap);
  console.log(poiId);
  console.log(directionId);
  const response = await axios.get(
    `https://dofus-map.com/huntTool/getData.php?x=${startMap.posX}&y=${
      startMap.posY
    }&direction=${getDirection(directionId)}&world=0&language=fr`
  );
  const { hints } = response.data;
  //workaround because ids dont match entirely
  dofusHuntPoiId = indicesLoader.getInvertedIndices()[poiLabel];
  console.log(`dofusHuntPoiId: ${dofusHuntPoiId}`);
  console.log(...hints);
  return hints.find(poiInfo => poiInfo.n == dofusHuntPoiId);
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
