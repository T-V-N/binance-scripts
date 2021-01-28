import * as csv from "@fast-csv/format";
import _ from "lodash";
import fs from "fs";
import { publicRequest, privateRequest } from "./binanceApi";

const historyStream = csv.format({
  delimiter: ",",
  headers: [
    "symbol",
    "initialMargin",
    "maintMargin",
    "unrealizedProfit",
    "positionInitialMargin",
    "openOrderInitialMargin",
    "leverage",
    "isolated",
    "entryPrice",
    "maxNotional",
    "positionSide",
    "positionAmt",
    "notional",
  ],
});

export default async () => {
  const data = {
    timestamp: Date.now(),
  };

  const outputFile = fs.createWriteStream("./output/positions.csv");
  historyStream.pipe(outputFile);

  const positions = await privateRequest(
    data,
    //"/fapi/v2/positionRisk",
    "/fapi/v2/account",
    "GET"
  );

  const openPositions = positions.data.positions.filter(
    ({ unrealizedProfit }) => unrealizedProfit != "0.00000000"
  );

  const trades = _.sortBy(openPositions, "time");
  for (const trade of trades) {
    historyStream.write([...Object.values(trade)]);
  }

  historyStream.end();
};
