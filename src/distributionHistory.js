import * as csv from "@fast-csv/format";
import fs from "fs";
import { privateRequest } from "./binanceApi";

const historyStream = csv.format({
  delimiter: "\t",
  headers: ["tranId", "asset", "amount", "divTime", "enInfo"],
});

export default async () => {
  console.log("Fetching token distributions");

  const outputFile = fs.createWriteStream("./output/distributionHistory.csv");
  historyStream.pipe(outputFile);

  const data = {
    timestamp: Date.now(),
  };

  const distributionResponse = await privateRequest(
    data,
    "/sapi/v1/asset/assetDividend",
    "GET"
  );
  const distributions = distributionResponse.data.rows;

  for (const distribution of distributions) {
    historyStream.write([...Object.values(distribution)]);
  }

  historyStream.end();
};
