'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('9a32c3981d994ca8adb2464cc06a9ba4');
const server = express();

server.use(bodyParser.urlencoded({
    extended: true
}));
server.use(bodyParser.json());

server.get('/news', function (req, res) {
    const query = req.query.query;
    newsapi.v2.topHeadlines({
        q: query || 'chatbots',
        sources: 'abc-news, al-jazeera-english, bbc-news, bbc-sport, bloomberg, business-insider, business-insider-uk, buzzfeed, cbs-news, cnbc, cnn, crypto-coins-news, daily-mail, el-mundo, engadget, entertainment-weekly, espn, espn-cric-info, financial-times, fortune, fox-news, fox-sports, hacker-news, independent, info-money, liberation, mashable, mirror, mtv-news, mtv-news-uk, national-geographic, nbc-news, news24, newsweek, new-york-magazine, reuters, techcrunch, techradar, the-economist, the-globe-and-mail, the-guardian-au, the-guardian-uk, the-hindu, the-huffington-post, the-lad-bible, the-new-york-times, the-next-web, the-telegraph, the-times-of-india, the-verge, the-wall-street-journal, the-washington-post, time, usa-today, wired',
    }).then(response => {
        let responseToSend;
        if (response.status === 'ok' && response.articles.length > 0) {
            const articles = response.articles.map(article => {
                return {
                    "title": article.title,
                    "image_url": article.urlToImage,
                    "subtitle": article.description,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": article.url,
                            "title": "Read Full Article"
                        }
                    ]
                }
            })
            responseToSend = {
                "messages": [
                    {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "image_aspect_ratio": "square",
                                "elements": articles.slice(0, 10)
                            }
                        }
                    }
                ]
            };
            return res.json(responseToSend);
        } else {
            responseToSend = {
                "messages": [
                    { "text": `Opps! Looks like I don't have any articles on ${query} as of now.` },
                    { "text": "Please feel free to check back later or try searching for another topic." }
                ]
            }
            return res.json(responseToSend);
        }
    }, (error) => {
        responseToSend = {
            "messages": [
                { "text": `Opps! Something went wrong while searching for articles on ${query}.` },
                { "text": `Got this error: ${error}` }
            ]
        }
        return res.json(error);
    });
});

server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});
