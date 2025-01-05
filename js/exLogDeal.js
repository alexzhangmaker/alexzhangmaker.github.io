
//buy[sell] 0388.HK price amount account
function _parseDeal(strDeal){
    let keys = strDeal.split(' ') ;
    console.log(keys) ;
    let jsonDeal={
        action:keys[0],
        ticker:keys[1],
        price:keys[2],
        amount:keys[3],
        account:keys[4],
        currency:'USD',
        exchange:'US'
    };
    let ticker = jsonDeal.ticker ;
    if(ticker.indexOf('.HK')!=-1){
        jsonDeal.currency = 'HKD' ;
        jsonDeal.exchange = 'HK' ;
    }else if(ticker.indexOf('.SS')!=-1){
        jsonDeal.currency = 'CNY' ;
        jsonDeal.exchange = 'CN' ;
    }else if(ticker.indexOf('.SZ')!=-1){
        jsonDeal.currency = 'CNY' ;
        jsonDeal.exchange = 'CN' ;
    }else if(ticker.indexOf('.L')!=-1){
        jsonDeal.currency = 'GBP' ;
        jsonDeal.exchange = 'LSE' ;
    }else if(ticker.indexOf('.TO')!=-1){
        jsonDeal.currency = 'CAD' ;
        jsonDeal.exchange = 'TSE' ;
    }else if(ticker.indexOf('.SI')!=-1){
        jsonDeal.currency = 'SGD' ;
        jsonDeal.exchange = 'SGX' ;
    }
    console.log(jsonDeal) ;
    return jsonDeal ;

}

async function _logDealFunc(event){
    if(event.keyCode === 13){
        event.preventDefault(); // Ensure it is only this code that runs
        let tagInput = event.target ;
        console.log(tagInput.value) ;
        let jsonDeal = _parseDeal(tagInput.value) ;
        //alert(`Enter was pressed was presses: ${tagInput.value}`);
        let urlDeal = `http://192.168.1.119:8000/logDeal/{action,ticker,price,amount,account,currency,exchange}?action=${jsonDeal.action}&ticker=${jsonDeal.ticker}&price=${jsonDeal.price}&amount=${jsonDeal.amount}&account=${jsonDeal.account}&currency=${jsonDeal.currency}&exchange=${jsonDeal.exchange}` ;
        
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonDeal)
        };
        let response = await fetch(urlDeal, requestOptions) ;
        //let response = await fetch(urlDeal); 
        let jsonResult = await response.json() ;
        console.log(jsonResult) ;
    }
}