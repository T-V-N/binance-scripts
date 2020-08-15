import * as csv from "@fast-csv/format";
import fs from "fs";
import { publicRequest, privateRequest } from "./binanceApi";
import ConsoleProgressBar from "console-progress-bar";

const historyStream = csv.format({
  delimiter: "\t",
  headers: [
    "type",
    "amount",
    "coin",
    "network",
    "status",
    "address",
    "addressTag",
    "txId",
    "insertTime",
  ],
});

export default async () => {
  const years = 5;
  const bar = new ConsoleProgressBar({ maxValue: years * 4 });
  bar.startChars = "Fetching wallet history:";

  const outputFile = fs.createWriteStream("./output/walletHistory.csv");
  historyStream.pipe(outputFile);

  const now = Date.now();
  for (let i = 0; i <= years * 4; i++) {
    const data = {
      timestamp: Date.now(),
      status: 1,
      startTime: now - 7776000000 * (i + 1),
      endTime: now - 7776000000 * i,
    };

    const deposits = (
      await privateRequest(data, "/sapi/v1/capital/deposit/hisrec", "GET")
    ).data;

    const withdrawals = (
      await privateRequest(data, "/sapi/v1/capital/withdraw/history", "GET")
    ).data;

    for (const deposit of deposits) {
      historyStream.write(["deposit", ...Object.values(deposit)]);
    }

    for (const withdrawal of withdrawals) {
      historyStream.write(["withdraw", ...Object.values(withdrawal)]);
    }
    bar.addValue(1);
  }

  historyStream.end();
};
