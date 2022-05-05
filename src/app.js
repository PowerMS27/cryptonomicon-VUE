/* eslint-disable prettier/prettier */

import { setInterval } from "core-js";
import { loadTickers } from "./api";

export default {
  name: "App",
  data() {
    return {
      ticker: "",
      tickers: [],
      selectedTicker: null,
      graph: [],
      added: null,
      page: 1,
      filter: '',
      barWidth: 4
    };
  },
  created: async function () {
    //localStorage
    const tickersData = localStorage.getItem('cryptonomicon-list');

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
    }


    setInterval(this.updateTickers, 5000);

    //URL
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries());
    if (windowData.filter) {
      this.filter = windowData.filter
    }
    if (windowData.page) {
      this.page = +windowData.page
    }
  },
  computed: {
    beginIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    filteredCoins() {
      return this.tickers.filter(ticker => 
        ticker.name.includes(this.filter.toUpperCase())
      )
    },
    hasNextPage() {
      return this.filteredCoins.length > this.endIndex;
    },
    paginatedCoins() {
      return this.filteredCoins.slice(this.beginIndex, this.endIndex);
    },

    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);
      if (maxValue == minValue) {
        return this.graph.map(() => 50)
      }
      // if (this.graph.length === 25) {
      //   this.graph = this.graph.map( val => 10 + ((val - minValue) * 90) / (maxValue - minValue));
      //   return this.graph.filter(val => 
      //     val.name.includes(this.filter.toUpperCase());
      // }
      return this.graph.map(
        val => 10 + ((val - minValue) * 90) / (maxValue - minValue) 
      ); 
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      }
    },
    calcBarWidth() {
      return 100 / this.barWidth + 1
    }
  },
  methods: {
    add() {
      const currentTicker = {
        name: this.ticker,
        price: "-",
      };
      if (this.tickers.find(t => t.name === currentTicker.name)) {
        this.added = 1;
        return null;
      }
      this.tickers = [...this.tickers, currentTicker]; 
      this.ticker = "";
      
      // this.filterCoins(this.tickers);
    },
    formatePrice(price) {
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },
    async updateTickers() {
      const exchangeData = await loadTickers(this.tickers.map(ticker => ticker.name));
      // console.log(loadTickers(this.tickers.map(ticker => ticker.name)));

      if (!this.tickers.length) {
        return
      };

      this.tickers.forEach(ticker => {
        const price = this.formatePrice(exchangeData[ticker.name]);
        ticker.price = price;
        if (this.selectedTicker?.name === ticker.name) {
          this.graph.push(ticker.price);
          if (this.graph.length === this.calcBarWidth) {
            this.graph.shift()
          }
        }
        
      });


        // this.tickers.find(t => t.name === tickerName).value = exchangeData.USD > 1 ? exchangeData.USD.toFixed(2) : exchangeData.USD.toPrecision(2);

  

    },
    
    select(ticker) {
      this.selectedTicker = ticker;
      console.log(ticker);
    },

    handleRemove(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t != tickerToRemove);
      this.selectedTicker === tickerToRemove ? this.selectedTicker = null : false;
      // localStorage.removeItem('cryptonomicon-list');
    },

  },
  watch: {
    tickers() {
      localStorage.setItem('cryptonomicon-list', JSON.stringify(this.tickers));
    },
    selectedTicker() {
      this.graph = [];
    },
    paginatedCoins() {
      if (this.paginatedCoins.length <= 0 && this.page > 0) {
        this.page -= 1;
      }
    },
    filter() {
      this.page = 1;
    },
    pageStateOptions(v) {
      window.history.pushState(
        null, 
        document.title, 
        `${window.location.pathname}?filter=${v.filter}&page=${v.page}`
      );
    },
    
  }
};

// [x] 6. Наличие в состоянии ЗАВИСИМЫХ ДАННЫХ | Критичность: 5+
// [] 4. Запросы напрямую внутри компонента (???) | Критичность: 5
// [] 2. При удалении остается подписка на загрузку тикера | Критичность: 5
// [] 5. Обработка ошибок API | Критичность: 5
// [] 3. Количество запросов | Критичность: 4
// [x] 8. При удалении тикера не изменяется localStorage | Критичность: 4
// [x] 1. Одинаковый код в watch | Критичность: 3
// [] 9. localStorage и анонимные вкладки | Критичность: 3
// [] 7. График ужасно выглядит если будет много цен | Критичность: 2
// [] 10. Магические строки и числа (URL, 5000 миллисекунд задержки, ключ локал стораджа, количество на странице) |  Критичность: 1

// Параллельно
// [x] График сломан если везде одинаковые значения
// [x] При удалении тикера остается выбор
