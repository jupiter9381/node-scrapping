const Scrapper = require("./scrapper");

module.exports.prepareCron = function(con) {
	Scrapper.doScrape(con);
};
