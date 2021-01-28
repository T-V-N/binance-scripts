import getTradeHistory from "./tradeHistory";
import getFuturesWalletHistory from "./getFuturesWalletHistory";
import getPositions from "./getPositions";

if (!process.env.API_KEY || !process.env.API_SECRET)
  throw new Error("Please specify API keys");

const run = async () => {
  await getTradeHistory();
  await getPositions();
  await getFuturesWalletHistory();
};

run();
