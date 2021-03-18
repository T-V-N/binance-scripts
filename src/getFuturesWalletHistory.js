import * as csv from "@fast-csv/format";
import fs from "fs";
import { publicRequest, privateRequest } from "./binanceApi";
import ConsoleProgressBar from "console-progress-bar";

const historyStream = csv.format({
  delimiter: ";",
  headers: [
    "symbol",
    "incomeType",
    "income",
    "asset",
    "time",
    "info",
    "tranId",
    "tradeId",
    "ISOTime",
  ],
});

export default async () => {
  const months = 20;
  const bar = new ConsoleProgressBar({ maxValue: months });
  bar.startChars = "Fetching wallet history:";

  const outputFile = fs.createWriteStream("./output/walletHistory.csv");
  historyStream.pipe(outputFile);

  const now = Date.now();
  for (let i = months - 1; i >= 0; i--) {
    const data = {
      timestamp: Date.now(),
      startTime: now - (7776000000 / 3) * (i + 1),
      endTime: now - (7776000000 / 3) * i,
      limit: 1000,
    };
    try {
      const walletEntries = (
        await privateRequest(data, "/fapi/v1/income", "GET")
      ).data;
      for (const walletEntry of walletEntries) {
        walletEntry.income = walletEntry.income.replace(".", ",");
        historyStream.write([
          ...Object.values(walletEntry),
          new Date(walletEntry.time).toISOString(),
        ]);
      }

      bar.addValue(1);
    } catch (e) {
      console.log(e);
    }
  }

  historyStream.end();
};
