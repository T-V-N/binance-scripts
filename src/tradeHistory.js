import * as csv from "@fast-csv/format";
import _ from "lodash";
import fs from "fs";
import { publicRequest, privateRequest } from "./binanceApi";
import ConsoleProgressBar from "console-progress-bar";

const historyStream = csv.format({
  delimiter: ";",
  headers: [
    "symbol",
    "id",
    "orderId",
    "side",
    "price",
    "qty",
    "realizedPnl",
    "marginAsset",
    "quoteQty",
    "commission",
    "commissionAsset",
    "time",
    "positionSide",
    "maker",
    "buyer",
    "ISOTime",
  ],
});

export default async () => {
  // const symbolsResponse = await publicRequest(
  //   {},
  //   "/api/v3/exchangeInfo",
  //   "GET"
  // );
  // const symbols = symbolsResponse.data.symbols.map((s) => s.symbol); для спота
  const symbols = process.env.MARKETS.split(", ");
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
      // "/api/v3/myTrades", для спота
      "/fapi/v1/userTrades",
      "GET"
    );

    const response = tradesResponse.data;
    const trades = _.sortBy(response, "time").map((trade) => ({
      ...trade,
      price: trade.price.replace(".", ","),
      qty: trade.qty.replace(".", ","),
    }));
    for (const trade of trades) {
      historyStream.write([
        ...Object.values(trade),
        new Date(trade.time).toISOString(),
      ]);
    }
    bar.addValue(1);
  }

  historyStream.end();
};
