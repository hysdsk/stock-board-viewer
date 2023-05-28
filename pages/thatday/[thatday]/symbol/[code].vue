<template>
  <div style="display: inline-block; width: 20%; text-align: center;">
    <h1>{{ data.symbolName }}</h1>
  </div>
  <div style="display: inline-block; width: 70%;">
    <table class="info" style="margin-left: 0%; width: 45%">
      <thead>
        <tr>
          <td>時間</td>
          <td>売り板</td>
          <td>買い板</td>
          <td>出来高</td>
          <td>約定</td>
          <td>前日比</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td nowrap>{{ tick.recievedTime }}</td>
          <td v-if="tick.sellAmount > tick.buyAmount"><b class="bid">{{ tick.sellAmount }}（{{ tick.sellSpread }}）</b></td>
          <td v-else>{{ tick.sellAmount }}（{{ tick.sellSpread }}）</td>
          <td v-if="tick.sellAmount < tick.buyAmount"><b class="ask">{{ tick.buyAmount }}（{{ tick.buySpread}}）</b></td>
          <td v-else>{{ tick.buyAmount }}（{{ tick.buySpread}}）</td>
          <td nowrap>{{ tick.tradingVolume }}</td>
          <td v-if="volumeDiff > 0" nowrap>+{{ volumeDiff }}</td>
          <td v-else></td>
          <td v-if="tick.changePreviousClosePer > 0"><b class="ask">{{ tick.changePreviousClosePer }}%</b></td>
          <td v-else-if="tick.changePreviousClosePer < 0"><b class="bid">{{ tick.changePreviousClosePer }}%</b></td>
          <td v-else><b class="ask">{{ tick.changePreviousClosePer }}%</b></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div style="display: inline-block; width: 10%;">
    <ul>
      <li><a :href="`${route.path}?span=1`">呼び値： 1円</a></li>
      <li><a :href="`${route.path}?span=5`">呼び値： 5円</a></li>
      <li><a :href="`${route.path}?span=10`">呼び値：10円</a></li>
      <!-- <li><NuxtLink :to="{path: `/thatday/${thatday}/symbol/${code}`, query: {span:  5}}">呼び値： 5円</NuxtLink></li> -->
    </ul>
  </div>
  <div>
    <div style="display: inline-block; width: 15%;">
      <table class="board">
        <thead>
          <tr>
            <td><b class="bid">売</b></td>
            <td>値</td>
            <td><b class="ask">買</b></td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ tick.marketOrderSellQty }}</td>
            <td class="price">成行</td>
            <td>{{ tick.marketOrderBuyQty }}</td>
          </tr>
          <tr>
            <td>{{ tick.overSellQty }}</td>
            <td class="price">Over</td>
            <td></td>
          </tr>
          <tr v-for="b in tick.boards">
            <td>{{ b.sell }}</td>
            <td v-if="tick.currentPrice == b.price && tick.currentPriceStatus == '0058'" class="price"><b class="bid">{{ b.price }}</b></td>
            <td v-else-if="tick.currentPrice == b.price && tick.currentPriceStatus == '0057'" class="price"><b class="ask">{{ b.price }}</b></td>
            <td v-else-if="tick.currentPrice == b.price" class="price"><b>{{ b.price }}</b></td>
            <td v-else class="price">{{ b.price }}</td>
            <td>{{ b.buy }}</td>
          </tr>
          <tr>
            <td></td>
            <td class="price">Under</td>
            <td>{{ tick.underBuyQty }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="display: inline-block; width: 84%;">
      <canvas id="priceChart"></canvas>
      <input type="range" min="1" :max="data.ticks.length-1" v-model="progressTime" style="width: 100%;">
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from '#imports';
  import Chart from 'chart.js/auto';

  const route = useRoute();
  const { thatday, code } = route.params;
  const queryParams = route.query;
  const span = queryParams.span == undefined ? 1 : queryParams.span;
  
  const { data } = await useFetch("/api/symbol", {
    params: { symbol: code, thatday, span }
  })

  const progressTime = ref(1);
  const tick = computed(() => {
    return data._value.ticks[progressTime.value]
  });

  const volumeDiff = computed(() => {
    return data._value.ticks[progressTime.value].tradingVolume - data._value.ticks[progressTime.value-1].tradingVolume
  })

  onMounted(() => {
    new Chart(document.getElementById("priceChart"), {
      data: {
        labels: data._value.chart.times,
        datasets: [{
          type: "line",
          label: "価格",
          data: data._value.chart.prices,
          borderWidth: 0.5,
          pointRadius: data._value.chart.tValues
        }, {
          type: "line",
          label: "VWAP",
          data: data._value.chart.vwaps,
          borderWidth: 0.5,
          pointRadius: 0
        }]
    }});
  })
</script>
