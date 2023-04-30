import { readFileSync } from 'node:fs';
const config = useRuntimeConfig()

export default defineEventHandler(async (event: any) => {
    const query = getQuery(event);
    const filename = `${config.datasourcePath}/${query.thatday}/${query.symbol}.json`;
    const content = readFileSync(filename, "utf-8");
    const messages: any = []
    content.split(/\n/).forEach((line: string) => {
        try {
            messages.push(JSON.parse(line));
        } catch (e) {}
    })

    const symbolName = messages[0].SymbolName;

    const ticks: Tick[] = []
    const span = Number(query.span)
    messages.forEach((msg: any) => {
        const boards: Board[] = [];
        const high = msg.CalcPrice + (16 * span);
        const low = msg.CalcPrice - (16 * span);
        for (let i = high; i > low; i -= span) {
            boards.push(<Board>{
                price: Number(i)
            })
        }

        let sellAmount = 0;
        let buyAmount = 0;
        Array.from(Array(10), (v, k) => {
            for (const b of boards) {
                if (b.price == msg[`Sell${k+1}`].Price) {
                    b.sell = msg[`Sell${k+1}`].Qty;
                }
                if (b.price == msg[`Buy${k+1}`].Price) {
                    b.buy = msg[`Buy${k+1}`].Qty;
                }
            }
            sellAmount += msg[`Sell${k+1}`].Qty;
            buyAmount += msg[`Buy${k+1}`].Qty;
        })

        ticks.push(<Tick>{
            recievedTime: new Date(Date.parse(msg.RecievedTime)).toLocaleTimeString("it-IT"),
            currentPrice: msg.CurrentPrice,
            currentPriceStatus: msg.CurrentPriceChangeStatus,
            vwap: msg.VWAP,
            boards: boards,
            sellAmount: sellAmount,
            buyAmount: buyAmount,
            tradingVolume: msg.TradingVolume == null ? 0 : msg.TradingVolume,
            tradingValue: msg.TradingValue == null ? 0 : msg.TradingValue,
            overSellQty: msg.OverSellQty,
            underBuyQty: msg.UnderBuyQty
        })
    })

    const chart = {
        times: ticks.map(e => e.recievedTime),
        prices: ticks.map(e => e.currentPrice),
        vwaps: ticks.map(e => e.vwap),
        tValues: ticks.map((v, i) => {
            if (i == 0) {
                return adjust(v.tradingValue, ticks[ticks.length-1].tradingValue)
            } else {
                const c = v.tradingValue ? v.tradingValue : 0;
                const p = ticks[i-1].tradingValue ? ticks[i-1].tradingValue : 0;
                return adjust((c - p), ticks[ticks.length-1].tradingValue)
            }
        })
    }
    return { symbolName, ticks, chart };
});

interface Board {
    sell: number;
    price: number;
    buy: number;
}

interface Tick {
    recievedTime: string;
    currentPrice: number;
    currentPriceStatus: string;
    vwap: number;
    boards: Board[];
    sellAmount: number;
    buyAmount: number;
    tradingVolume: number;
    tradingValue: number;
    overSellQty: number;
    underBuyQty: number;
}

const adjust = (v: number, tradingValue: number) => {
    if (tradingValue > 10**11) {
        return v * 0.00000005;
    } else if (tradingValue > 10**10) {
        return v * 0.0000001;
    } else if (tradingValue > 10**9) {
        return v * 0.0000005;
    } else {
        return v * 0.000001;
    }
}
