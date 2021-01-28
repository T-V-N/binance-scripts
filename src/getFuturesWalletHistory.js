import * as csv from "@fast-csv/format";
import fs from "fs";
import { publicRequest, privateRequest } from "./binanceApi";
import ConsoleProgressBar from "console-progress-bar";

const historyStream = csv.format({
  delimiter: ",",
  headers: [
    "symbol",
    "incomeType",
    "income",
    "asset",
    "time",
    "info",
    "tranId",
    "tradeId",
  ],
});

export default async () => {
  const years = 10;
  const bar = new ConsoleProgressBar({ maxValue: years * 4 });
  bar.startChars = "Fetching wallet history:";

  const outputFile = fs.createWriteStream("./output/walletHistory.csv");
  historyStream.pipe(outputFile);

  const now = Date.now();
  for (let i = 0; i <= years * 4; i++) {
    const data = {
      timestamp: Date.now(),
      startTime: now - 7776000000 * (i + 1),
      endTime: now - 7776000000 * i,
      limit: 1000,
    };
    try {
      const walletEntries = (
        await privateRequest(data, "/fapi/v1/income", "GET")
      ).data;

      for (const walletEntry of walletEntries) {
        historyStream.write([...Object.values(walletEntry)]);
      }

      bar.addValue(1);
    } catch (e) {
      console.log(e);
    }
  }

  historyStream.end();
};
