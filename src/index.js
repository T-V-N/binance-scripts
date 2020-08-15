import getTradeHistory from "./tradeHistory";
import getWalletHistory from "./walletHistory";
import getDistributionHistory from "./distributionHistory";

if (!process.env.API_KEY || !process.env.API_SECRET)
  throw new Error("Please specify API keys");

const run = async () => {
  await getWalletHistory();
  await getTradeHistory();
  await getDistributionHistory();
};

run();
