"use strict";
var path = require('path');
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const puppeteerFirefox = require("puppeteer-firefox");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var os = require('os');

const csvWriter = createCsvWriter({
    path: 'file.csv',
    header: [
        {id: 'main', title: 'Main Category'},
        {id: 'sub', title: 'Sub Category'},
        {id: 'title', title: 'Title'},
        {id: 'ingredients', title: 'Ingredients'},
        {id: 'directions', title: 'Directions'},
        {id: 'nutritions', title: 'Nutritions'},
        {id: 'ready_time', title: "Ready Time"},
        {id: 'serving', title: "Serving"},
        {id: 'image', title: "Image"}
    ],
    append:true
});


var getApiToken = () => {
	// check balance first
	
}
module.exports.doScrape = function(con) {
	async function run() {
		let browser;
		let page;
		browser = await puppeteer.launch({ headless: false });

		page = await browser.newPage();

		let $pageLength ;

		await page.goto("https://www.allrecipes.com/recipes/?internalSource=recipe%20breadcrumb&referringId=246841&referringContentType=Recipe&referringPosition=1&clickId=recipe%20breadcrumb%202", { waitUntil: "networkidle0", timeout: 0 });
		
		var html = await page.content();
		let $ = cheerio.load(html);

		var allCategories = $(".all-categories-col section");
		let main_category;
		let sub_category;
		let subDom;
		let url;
		let receip_cards;
		let receip_title;
		let receip_url;
		let records = [];
		for(var i = 0; i < 1; i++){
			main_category = $(allCategories[i]).find(".heading__h3").text();
			subDom = $(allCategories[i]).find("ul li");
			console.log(subDom.length);

			for(var j = 0; j < 1; j++){
				sub_category = $(subDom[j]).find("a").text();
				url = $(subDom[j]).find("a").attr("href");
				
				const receip = await browser.newPage();
				await receip.goto(url, { waitUntil: "networkidle2", timeout: 0 });
				
				var receipe_content = await receip.content();
				let jquery = cheerio.load(receipe_content);
				receip_cards = jquery(".fixed-recipe-card");
				for(var k = 8; k < 10; k++){
					receip_url = $(receip_cards[k]).find("h3.fixed-recipe-card__h3 a").attr("href");
					receip_title = $(receip_cards[k]).find("span.fixed-recipe-card__title-link").text();
					
					const detail = await browser.newPage();
					await detail.goto(receip_url, { waitUntil: "networkidle2", timeout: 0 });

					var detail_content = await detail.content();
					let query = cheerio.load(detail_content);

					// ingredients
					var ingredients = query(".checkList__line");
					var ingre_content = "";
					for(var kk = 0; kk < ingredients.length - 1; kk++){
						var temp = query(ingredients[kk]).find("label span").text();
						
						ingre_content += temp.trim() + ", ";
					}

					// directions
					var directions = query(".recipe-directions__list--item");
					var direction_content = "";
					for(var kk = 0; kk < directions.length; kk++){
						var temp = query(directions[kk]).text();
						
						direction_content += temp.trim() + ", ";
					}
					// nutrition facts
					var nutritions = query(".nutrition-summary-facts > span");
					
					var nutrition_content = "";
					for(var kk = 0; kk < nutritions.length; kk++){
						var temp = query(nutritions[kk]).text();
						nutrition_content += temp.trim() + ", ";
					}

					// ready_time
					var ready_time = query(".ready-in-time");
					ready_time = query(ready_time[0]).text();
					// serving
					var servings = query(".servings-count > span");
					var serving_content = "";
					for(var kk = 0; kk < servings.length; kk++){
						var temp = query(servings[kk]).text();
						serving_content += temp.trim() + " ";
					}

					// image url
					var images = query(".photo-strip__items li");
					var image_content = "";
					for(var kk = 0; kk < images.length; kk++){
						var temp = query(images[kk]).find("img").attr("src");
						image_content += temp.trim() + ", ";
					}

					console.log(image_content);
					detail.close();
					let item = {main:main_category, sub:sub_category, title:receip_title.trim(), ingredients: ingre_content, directions: direction_content, ready_time: ready_time, serving: serving_content, image: image_content};
					records.push(item);
				}
				await receip.close();
				// await page.waitForNavigation();
				// console.log("------" + sub_category);
				// console.log("------" + url);
			}
		}
		csvWriter.writeRecords(records)       // returns a promise
	    .then(() => {
	        console.log('...Done');
	    });
		// let pageLength = $(allCategories[allCategories.length-1]).text();
		// var currentPage = $(".pg ul li span.current").text();
		//var nextPage = $($(".pg ul li a").text();)
		/*await page.evaluate(() => {
		    document.querySelector('.pg ul li:eq(2) a').click();
		});*/
		// await page.click(".pg ul li:nth-child("+(parseInt(currentPage)+1)+") a");
		// await page.waitForNavigation();
		// html = await page.content();
		// $ = cheerio.load(html);
		// currentPage = $(".pg ul li span.current").text();
		// console.log(currentPage);
		//console.log($(pageDom[parseInt(currentPage)]).find("a"));
		/*browser.close();*/
		
		/*for (var index = 1; index <= pageLength; index++){
			var url = "https://www.manomano.fr/marchand-152398?page=" + index;
			await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });

			//let nicknames = await page.evaluate(() => {document.querySelector('.comment-product__nickname')});
			var html = await page.content();
			let $ = cheerio.load(html);

			var nicknames = $(".comment-product__nickname");
			var dates = $(".comment-product__header-date");
			var reviews = $(".comment-product__description .comment-product__text-review");
			var stars = $(".ratings-stars");

			var length = nicknames.length;

			for(var i = 0; i < length; i++){
				console.log("name -> " + $(nicknames[i]).text().trim());
				console.log("dates -> " + $(dates[i]).text().split(" ")[1]);
				console.log("reviews -> " + $(reviews[i]).text().trim());
				console.log("stars -> " + $(stars[i]).attr("content"));
				console.log(" ------------- ");

				var name = $(nicknames[i]).text().trim();
				var date = $(dates[i]).text().split(" ")[1];
				date = date.split("/")[2] + "-" + date.split("/")[1] + "-" + date.split("/")[0];
				var review = $(reviews[i]).text().trim();
				review = review.replace(/"/g, "");
				var star = $(stars[i]).attr("content");

				var sql = 'INSERT INTO merchants VALUES("", "Alice’s Garden", "'+name+'", "'+date+'", "'+review+'", "'+star+'")';
			  	
			  	console.log(sql);
			  	con.query(sql, function (err, info) {
			    	if (err) throw err;
			  	});
				
			}
		}*/
		
		
		
	}
	run();
};
