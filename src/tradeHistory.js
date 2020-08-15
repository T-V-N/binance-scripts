import * as csv from "@fast-csv/format";
import fs from "fs";
import { publicRequest, privateRequest } from "./binanceApi";
import ConsoleProgressBar from "console-progress-bar";

const historyStream = csv.format({
  delimiter: "\t",
  headers: [
    "symbol",
    "id",
    "orderId",
    "orderListId",
    "price",
    "qty",
    "quoteQty",
    "commission",
    "commissionAsset",
    "time",
    "isBuyer",
    "isMaker",
    "isBestMatch",
  ],
});

export default async () => {
  const symbolsResponse = await publicRequest(
    {},
    "/api/v3/exchangeInfo",
    "GET"
  );

  const symbols = symbolsResponse.data.symbols.map((s) => s.symbol);
  console.log(`${symbols.length} markets detected`);

  const bar = new ConsoleProgressBar({ maxValue: symbols.length });
  bar.startChars = "Fetching trade history:";

  const outputFile = fs.createWriteStream("./output/tradeHistory.csv");
  historyStream.pipe(outputFile);

  for (const symbol of symbols) {
    const data = {
      timestamp: Date.now(),
      symbol,
    };

    const tradesResponse = await privateRequest(
      data,
      "/api/v3/myTrades",
      "GET"
    );
    const trades = tradesResponse.data;
    for (const trade of trades) {
      historyStream.write([...Object.values(trade)]);
    }
    bar.addValue(1);
  }

  historyStream.end();
};
