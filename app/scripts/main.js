/*  
    SAVER BOT
    November 9, 2013
    By Tom Giratikanon and Sisi Wei

    ===================================== */

var SaverBot = {

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
        console.log(data);
    }

}

SaverBot.init();
