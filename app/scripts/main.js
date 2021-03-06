/*  
    SAVER BOT
    November 9, 2013
    By Tom Giratikanon and Sisi Wei

    ===================================== */

_.mixin({
  sum: function(list, property) {
    return _.reduce(list,function(memo, item){ 
        if (property) return memo + +item[property]
        return memo + +item; 
    }, 0);
  }
})

var SaverBot = {

    stores: [
        {
            store_key: "freshdirect",
            store_name: "FreshDirect",
            discounts: {
                "50off125": function(types) {
                    
                }
            }
        },
        {
            store_key: "costco",
            store_name: "Costco"
        },
        {
            store_key: "undefined",
            store_name: "No store"
        },
        {
            store_key: "target",
            store_name: "Target"
        },
        {
            store_key: "amazon",
            store_name: "Amazon"
        }
    ],

    templates: {},

    init: function(options) {

        _.extend(this, options);
        _.bindAll(this, "onPriceData", "typeByType", "compileTemplates");
        this.compileTemplates();

        Tabletop.init({ 
            key: '0AvBAc331YyX7dEctY3JrQ3BEcjVYUUw3NEROZHJPaHc',
            callback: this.onPriceData,
            simpleSheet: true 
        });

    },

    onPriceData: function(data, tabletop) { 

        // Create a product for each row
        var products = _.map(data, function(item) {
            return new SaverBotProduct(item, this.stores);
        }, this)

        // Include only products that have at least one price
        this.items = _.filter(products, function(item) {
            return item.hasPrices();   
        }, this);

        // Group by product types
        var productTypes = _.groupBy(_.filter(this.items, function(item) { return item.producttype }), "producttype")

        // Create a product type for each group
        this.productTypes = _.map(productTypes, function(products, name) {
            return new SaverBotProductType(name, products);
        }) 

        this.productTypes = _.sortBy(this.productTypes, "name");

        // FRESH DIRECT STRATEGY



        // TYPE BY TYPE STRATEGY

        var results = this.typeByType();

        var items = _.flatten(_.pluck(results, "items"));

        var sum = _.sum(items, "lowestUnitPriceNumeric");

        var data = {
          summary: {
            totalCost: numeral(sum).format('$0,0.00')
          },
          results: results
        } 

        $(".results-display").html( this.templates.storeList.render(data) );

    },

    compileTemplates: function() {
        var templates = this.templates;
        $(".template").each(function() {
            var id = $(this).attr("id").split("-")[1];
            var html = $(this).html();
            templates[id] = Hogan.compile(html);
        });
    },

    optimize: function() {

    },

    freshdirectSave50: function(productTypes) {



    },

    // Simplest strategy: Find the cheapest place to get each type of item

    typeByType: function(productTypes) {

        if (!productTypes) productTypes = this.productTypes;

        var groups = _.groupBy(productTypes, function(productType) {
            var store = productType.getLowestUnitPrice();
            productType.lowestUnitPrice = store;
            console.log(store);
            productType.lowestUnitPriceDisplay = store.lowestUnitPriceDisplay;
            productType.lowestUnitPriceNumeric = store.lowestUnitPrice().unitPrice;
            return store.lowestUnitPrice().store_key;
        })

        return _.map(groups, function(group, store_key) {
            return {
                store: _.findWhere(this.stores, { store_key: store_key }),
                items: group
            }
        }, this);

    }

    // Simple algorithm: Find the cheapest place to get each item

    // itemByItem: function(items) {

    //     if (!items) items = this.items;

    //     var groups = _.groupBy(items, function(item) {
    //         var store = item.lowestUnitPrice();
    //         item.lowestUnitPrice = store.unitPrice;
    //         item.lowestUnitPriceDisplay = store.unitPriceDisplay;
    //         return store.store_key;
    //     })

    //     delete groups["undefined"];

    //     return _.map(groups, function(group, store_key) {
    //         return {
    //             store: _.findWhere(this.stores, { store_key: store_key }),
    //             items: group
    //         }
    //     }, this);

    // }

}

var SaverBotProductType = function(name, products) {

    this.name = name;
    this.products = [];

    this.init = function() {
        _.bindAll(this, "addProduct");
        this.addProducts(products);
    }

    this.addProduct = function(product) {
        this.products.push(product);
    }

    this.addProducts = function(products) {
        _.each(products, this.addProduct)
    }

    this.getLowestUnitPrice = function() {
        var product = _.min(this.products, function(product) {
            return product.lowestUnitPrice().unitPrice;
        });
        return product;
    }

    this.init();

}

var SaverBotProduct = function(item, stores) {

    this.debug = false;

    this.init = function() {
        _.extend(this, item);
        this.stores = _.filter(stores, function(store) {
            return this.price(store.store_key);
        }, this);
    }

    this.hasPrices = function() {
        return this.stores.length;
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
        this.lowestUnitPriceDisplay = numeral(this.unitPrice(store.store_key)).format('$0,0.00'); 
        return _.extend({ 
            unitPrice: this.unitPrice(store.store_key),
            unitPriceDisplay: numeral(this.unitPrice(store.store_key)).format('$0,0.00')
        }, store);
    }

    this.init();

}

SaverBot.init();
