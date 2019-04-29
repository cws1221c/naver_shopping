const express = require('express');
const http = require('http');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const bodyParser = require('body-parser'); //여기
const qs = require('querystring');
const iconv = require('iconv-lite');  //인코딩 변환도구
const charset = require('charset');  //캐릭터셋 체크 도구

let app = express();

app.set('port', 12000);

app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json()); //미들웨어로 바디파서를 사용함. //여기
app.use(bodyParser.urlencoded({ extended: true })); //여기

app.get('/', function(req, res) {
    res.render('main', { msg: 'Welcome To Express4' });
});

app.get('/top20', function(req, res) {

    request("https://www.naver.com", function(err, response, body) {
        let list = [];
        $ = cheerio.load(body);

        let top20 = $(".ah_roll_area > .ah_l > li > a > .ah_k");

        for (let i = 0; i < top20.length; i++) {
            let msg = $(top20[i]).text();
            list.push(msg);
        }

        res.render('top', { msg: '네이버 실시간 급상승 검색어', list: list });
    });
});


app.get('/search', function(req, res) {
    res.render('search', {});
});

app.post('/search', function(req, res) {
    let word = req.body.word;
    word = qs.escape(word);
    let url = "https://search.shopping.naver.com/search/all.nhn?query=" + word + "&cat_id=&frm=NVSHATC";
    request(url, function(err, response, body) {
    
        $ = cheerio.load(body);
        
        let product_list = $(".goods_list > li");
        let list = [];
        for(let i = 0; i < product_list.length; i++){
            let title = $(product_list[i]).find(".info > .tit").text();
            let price = $(product_list[i]).find(".info > .price > em").text();
            let category = $(product_list[i]).find(".info > .depth").text();
            let detail = $(product_list[i]).find(".info > .detail.max").text();
            let review = $(product_list[i]).find(".info > .etc > a:first-child").text();

            let link = $(product_list[i]).find(".info > a").attr("href");
            
            list.push({title: title, price: price, category:category, detail : detail, review :review, link:link});
        }

        res.render('search' , {msg:'검색 결과', list:list});
        
        
    });
});

let server = http.createServer(app);
server.listen(app.get('port'), function() {
    console.log(`Express 엔진이 ${app.get('port')}에서 실행중`);
});