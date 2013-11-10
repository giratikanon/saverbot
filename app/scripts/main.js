/*  
    SAVER BOT
    November 9, 2013
    By Tom Giratikanon and Sisi Wei

    ===================================== */

var SaverBot = {

    stores: [
        {
            store_key: "freshdirect",
            store_name: "FreshDirect"
        },
        {
            store_key: "costco",
            store_name: "Costco"
        }
    ],

    init: function(options) {

        _.extend(this, options);
        _.bindAll(this, "onPriceData");

        Tabletop.init({ 
            key: '0AvBAc331YyX7dEctY3JrQ3BEcjVYUUw3NEROZHJPaHc',
            callback: this.onPriceData,
            simpleSheet: true 
        });
    },

    onPriceData: function(data, tabletop) { 
        this.items = _.map(data, function(item) {
            return new SaverBotItem(item, this.stores);
        }, this);
    },

    optimize: function() {

    },

    // Simple algorithm: Find the cheapest place to get each item

    itemByItem: function(items) {

    }

}

var SaverBotItem = function(item, stores) {

    this.debug = false;

    this.init = function() {
        _.extend(this, item);
        this.stores = _.filter(stores, function(store) {
            // console.log( item.name, store.key, this.price(store.key) );
            return this.price(store.store_key);
        }, this);
    }

    this.price = function(store) {
        var price = this[store + "price"];
        return price ? price.replace("$", "") : false; 
    }

    this.unitPrice = function(store) {
        var unitprice = this[store + "unitprice"];
        return unitprice ? unitprice.replace("$", "") : false; 
    }

    this.units = function(store) {
        return this[store + "units"];
    }

    this.lowestPrice = function() {
        if (this.stores.length == 0) return false;
        var store = _.min(this.stores, function(store) {
            return this.price(store.store_key);
        }, this);
        return _.extend({
            price: this.price(store.store_key)
        }, store);
    }

    this.lowestUnitPrice = function() {
        if (this.stores.length == 0) return false;
        var store = _.min(this.stores, function(store) {
            return this.unitPrice(store.store_key);
        }, this);
        return _.extend({ 
            unitPrice: this.unitPrice(store.store_key)
        }, store);
    }

    this.init();

}

SaverBot.init();
