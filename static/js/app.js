const alertSound = new Audio('static/calmAlert.wav')

class tokenData {
    constructor(tokenAddress, tokenName) {
        this.tokenAddress=tokenAddress;
        this.tokenName=tokenName;
    }
}

class AppManager {
    constructor(audio) {
        this.currentTokens=[];
        this.previousTokens=[];
        this.newTokens=[];

        this.tokenTabs=[];
        this.activeTabs=[];
        this.alertInterval=null;
        this.dexIntervals=[];
        this.audio=audio;

        this.alerting=false;

    }
    

    toggleAlerts() {
        const alertButton = document.getElementById('alert-toggle');
        const alertText = alertButton.children[0];

        if (this.alerting === true) {
            alertButton.classList.remove('alerting');
            alertText.textContent='OFF';
            this.alerting = false;
            clearInterval(this.interval);
            this.interval=null;
        }
        else {
            getTokenList();
            alertButton.classList.add('alerting');
            alertText.textContent='ON';
            this.alerting = true;
            this.interval = setInterval(getTokenList, 60000);
        }
    }
    
    triggerAlert() {
        
        if (this.newTokens.length>0 & this.alerting===true) {
            console.log("PLayed sound");
            this.audio.play().catch(error => console.error("Error playing sound:", error));
        }
    }

    handleDexIntervals(newInterval) {
        this.dexIntervals.forEach(interval => {
            clearInterval(interval);
            this.dexIntervals=[];
        })
        if (newInterval===null) {            
            return;
        }
        else {
            this.dexIntervals.push(newInterval);

        }

    }


}

const appManager = new AppManager(alertSound);


document.getElementById('alert-toggle').addEventListener('click', () => {
    appManager.toggleAlerts();

})

// Main listener
document.addEventListener("click", (e) => {
    const searchDropdown = document.getElementById("searchDropdown");
    const searchBox = document.getElementById("searchBox");
    if (!searchBox.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.classList.remove("active");
    }
});

function createElementAndAppend(parent, tagName, element_classes=null, element_id = null, elementText=null, href=null, src=null, alt=null) {
    const element = document.createElement(tagName);

    if (element_classes != null) {
        element.classList.add(...element_classes)
    }
    if (element_id != null) {
        element.id = element_id
    }
    if (elementText != null) {
        element.textContent=elementText;
    }
    if (href != null) {
        element.href=href;
        element.target='_blanks';
    }

    if (src != null) {
        element.src=src;
    }
    if (alt != null) {
        element.alt=alt;

    }

    parent.appendChild(element);

    return element;
}

function createLinkedImage (parent, link, imPath) {
    const linkElement=document.createElement('a');
    linkElement.href=link;
    linkElement.target='_blank';
    const smallImage=document.createElement('img');
    smallImage.src=imPath;
    smallImage.alt='small image';
    linkElement.appendChild(smallImage);
    parent.appendChild(linkElement);

}

document.getElementById('popup-close').addEventListener('click', () => {
    const popup=document.getElementById('popup');
    popup.style.display="none";
})

document.getElementById('about-button').addEventListener('click', () => {
    const popup=document.getElementById('popup');
    popup.style.display="flex";
    // updateInfoPopup('about')
})

// document.getElementById('topTokens-button').addEventListener('click', () => {
//     updateInfoPopup('topTokens')
// })

// document.getElementById('futurePlans-button').addEventListener('click', () => {
//     updateInfoPopup('futurePlans')
// })
// function updateInfoPopup(message) {
//     const popupDic = {about: {title: 'ABOUT', message: "The goal of this app is to share real-time alerts and data every time a pump.fun token bonds, to help you avoid scams and sift through the nonsense. It's still a work in progress but I've got a lot of cool ideas. So follow along and share your suggestions on X @ShiteCoinQUant"},
//     topTokens: {title: "TOP TOKENS", message: "Nothing here yet. But as this app develops and grows, I'd like to add cool things like analyses of the most successful tokens and see what we can learn from them! More to come."},
//     futurePlans: {title: "FUTURE PLANS", message: "I'm just getting started. The next step will be implementing alerts and real-time data so users can see new tokens right as they bond. After that, who knows. I'd like to incorporate more data from various API's to give people as much information as possible, maybe expand the data beyond pumpfun tokens, and much more. Stay tuned!"}}

//     const popup=document.getElementById('popup');
//     const popupTitle=document.getElementById('popup-title');
//     const popupMessage=document.getElementById('popup-text');
//     popupTitle.textContent=popupDic[message].title;
//     popupMessage.textContent=popupDic[message].message;
//     popup.style.display="flex";

// }


const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

const formatDollars = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
})

const formatNumbersSimple = new Intl.NumberFormat('en-US');

function switchBetweenPages(activeTab, activePage, mainDataContainer, selectRibbon) {

    // const mainDataContainer = document.getElementById('all-data-container');
    // const selectRibbon = document.getElementById('main-tabs');
    for (let i=0; i<selectRibbon.children.length; i++) {
        selectRibbon.children[i].classList.remove('active');
    }
    activeTab.classList.add('active');
    for (let i=0; i<mainDataContainer.children.length; i++) {
        mainDataContainer.children[i].style.display="none"
    }
    activePage.style.display = "block";
    window.scrollTo(0, 0);
}

function checkBeforeSwitching(activeTab) {
    const tab = document.getElementById(activeTab);

}


const tokenTab = document.getElementById('main-tab-tokens');
tokenTab.addEventListener('click', function(event) {
    appManager.handleDexIntervals(null);
    switchBetweenPages(event.currentTarget, document.getElementById('data-page-tokens'),document.getElementById('all-data-container'),document.getElementById('main-tabs'));

})

async function fetchTokenData(tokenAddress) {
    const url = `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${tokenAddress}`;
    
    const params = new URLSearchParams({
        include: 'top_pools'
    });

    try {
        const response = await fetch(`${url}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Error fetching token data:", error);
    }
}

async function fetchTokenDataMulti(tokenAddresses) {
    const baseUrl = "https://api.geckoterminal.com/api/v2/networks/solana/tokens/multi/";
    const url = baseUrl + encodeURIComponent(tokenAddresses.join(',')); // Join tokens with a comma

    const headers = {
        'Accept': 'application/json'
    };

    const params = new URLSearchParams({
        'include': 'top_pools'
    });

    try {
        const response = await fetch(`${url}?${params.toString()}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch token data: ${response.statusText}`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Error fetching token data:", error);
    }
}


function getTokenList1() {
    console.log(`Checked for tokens ${new Date()}`);
    fetch('/tokens')
        .then(response => response.json()) 
        .then(data => {

            appManager.previousTokens=appManager.currentTokens;
            appManager.currentTokens=[];
            appManager.newTokens=[];

            const tableBody = document.getElementById('table-body-token')
            tableBody.innerHTML = "";

            data.forEach((token) => {
                const tokenAddress = token.token_address;
                const row = document.createElement("tr");

                // Create table cells
                const nameCell = document.createElement("td");
                nameCell.textContent = token.name;
                row.appendChild(nameCell);

                const symbolCell = document.createElement("td");
                symbolCell.textContent = token.symbol;
                row.appendChild(symbolCell);

                const marketCapCell = document.createElement("td");
                marketCapCell.textContent = formatDollars.format(token.usd_market_cap);
                row.appendChild(marketCapCell);

                const createdCell = document.createElement("td");
                const createdDate=new Date(token.created_timestamp);
                createdCell.textContent = formatter.format(createdDate);
                row.appendChild(createdCell);
                
                const bondedCell = document.createElement("td");
                const bondedDate = new Date(token.last_trade_timestamp);
                bondedCell.textContent = formatter.format(bondedDate);
                row.appendChild(bondedCell);

                const addressCell = document.createElement("td");
                addressCell.textContent = tokenAddress;
                row.appendChild(addressCell);

                if (!appManager.previousTokens.includes(tokenAddress) & appManager.previousTokens.length>0) {
                    row.classList.add('new-token');
                    appManager.newTokens.push(tokenAddress);

                }
                appManager.currentTokens.push(tokenAddress);
                
                row.addEventListener('click', () => {
                    row.classList.remove('new-token');
                    const tokenAddress = token.token_address;
                    openTokenData(tokenAddress);
                })

                // Append the row to the table body
                tableBody.appendChild(row);
            });

            appManager.triggerAlert();
        })
        .catch(error => {
            console.error('Error fetching token data:', error);
        });
}

function addGeckoDataToTokenData(data, geckoData) {

    data.forEach(d => {
        const tokenAddress = d.token_address;

        d.geckoData=null;
        geckoData.data.forEach(gd => {
            if (gd.attributes.address===tokenAddress) {

                if (gd.relationships.top_pools.data.length>0) {
                    const poolId = gd.relationships.top_pools.data[0].id;
                    geckoData.included.forEach(poolData => {
                        if (poolData.id === poolId) {
                            d.geckoData= poolData;
                        }

                    })

                }
            }
        })
    })
    // return data
}


function formatVolume(num) {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
        return num.toString();
    }
}


function colorCodeElement(element, value, class1, class2) {
    if (value>0) {
        element.classList.add(class1);
    }
    if (value<0) {
        element.classList.add(class2);
    }
}

function getTokenList() {
    console.log(`Checked for tokens ${new Date()}`);
    fetch('/tokens')
        .then(response => response.json())  // Parse the JSON response
        .then(data => {

            const tokenAddresses = [];
            data.forEach(d =>{
                tokenAddresses.push(d.token_address);
            })
            fetchTokenDataMulti(tokenAddresses).then(response => {

                addGeckoDataToTokenData(data, response);

                appManager.previousTokens=appManager.currentTokens;
                appManager.currentTokens=[];
                appManager.newTokens=[];
    
                const tableBody = document.getElementById('table-body-token')
                tableBody.innerHTML = "";
    
                data.forEach((token) => {
                    const tokenAddress = token.token_address;
                    const row = document.createElement("tr");
    
                    // Create table cells
                    const nameCell = document.createElement("td");
                    nameCell.textContent = token.name;
                    row.appendChild(nameCell);
    
                    const symbolCell = document.createElement("td");
                    symbolCell.textContent = token.symbol;
                    row.appendChild(symbolCell);
    
                    const marketCapCell = document.createElement("td");
                    marketCapCell.textContent = formatDollars.format(token.usd_market_cap);
                    row.appendChild(marketCapCell);
    
                    const createdCell = document.createElement("td");
                    const createdDate=new Date(token.created_timestamp);
                    createdCell.textContent = formatter.format(createdDate);
                    row.appendChild(createdCell);
                    
                    const bondedCell = document.createElement("td");
                    const bondedDate = new Date(token.last_trade_timestamp);
                    bondedCell.textContent = formatter.format(bondedDate);
                    row.appendChild(bondedCell);
                    if (token.geckoData === null) {
                        for (let i = 0; i < 8; i++) {
                            const fillerCell = document.createElement('td');
                            fillerCell.textContent = "--";
                            row.append(fillerCell);

                        }

                    }
                    else {

                        const priceChanges = ['m5', 'h1', 'h6', 'h24']
                        priceChanges.forEach(p => {
                            const priceCell = document.createElement('td');
                            const priceChange=token.geckoData.attributes.price_change_percentage[p];
                            if (priceChange == 0) {
                                priceCell.textContent="--";
                            }
                            else {

                                priceCell.textContent=priceChange;
                                colorCodeElement(priceCell, priceChange, "positive-val", "negative-val");
                            }

                            row.append(priceCell);
                        })
                        const volumeChanges = ['m5', 'h1', 'h6', 'h24']
                        volumeChanges.forEach(v => {
                            const volCell = document.createElement('td');
                            const volAmt = token.geckoData.attributes.volume_usd[v];
                            row.append(volCell);
                            if (volAmt == 0) {
                                volCell.textContent="--"
                            }
                            else {
                                volCell.textContent=formatVolume(Math.round(volAmt));
                                // colorCodeElement(volCell, volAmt, "positive-val", "negative-val");
                                // row.append(volCell);
                            }
                            
                        })
                    }
        
                    // const addressCell = document.createElement("td");
                    // addressCell.textContent = tokenAddress;
                    // row.appendChild(addressCell);
    
                    if (!appManager.previousTokens.includes(tokenAddress) & appManager.previousTokens.length>0) {
                        row.classList.add('new-token');
                        appManager.newTokens.push(tokenAddress);
    
                    }
                    appManager.currentTokens.push(tokenAddress);
                    
                    row.addEventListener('click', () => {
                        row.classList.remove('new-token');
                        const tokenAddress = token.token_address;
                        openTokenData(tokenAddress);
                    })
    
                    // Append the row to the table body
                    tableBody.appendChild(row);
                });
                appManager.triggerAlert();
            })

            // appManager.triggerAlert();
        })
        .catch(error => {
            console.error('Error fetching token data:', error);
        });
}


getTokenList();


function fillRecentActivity(data, container) {
    container.innerHTML="";
    if (data===null) {

        return
    }

    const centerColTitle=createElementAndAppend(container, "h3", element_classes=["datapoint-name"], element_id = null, elementText="DEX DATA");
    const priceContainer=createElementAndAppend(container, "div", element_classes=["data-field-named"], element_id = null, elementText=null);
    const title=createElementAndAppend(priceContainer, "p", element_classes=["datapoint-name"], element_id = null, elementText='PRICE: ');
    const fieldValue=createElementAndAppend(priceContainer, "p", element_classes=null, element_id = null, elementText=` $${data.data.attributes.price_usd}`);

    const priceChanges = data.included[0].attributes.price_change_percentage;
    const volumeChanges = data.included[0].attributes.volume_usd;
    const priceVolTitle=createElementAndAppend(container, "p", element_classes=["datapoint-name"], element_id = null, elementText='PRICE/VOL CHG');
    const changeTable=createElementAndAppend(container, "table", element_classes=null, element_id = null, elementText=null);
    const changeTableHead=createElementAndAppend(changeTable, "thead", element_classes=null, element_id = null, elementText=null);
    const changeTableHeadRow=createElementAndAppend(changeTableHead, "tr", element_classes=null, element_id = null, elementText=null);
    const changeTitles = ['change', '5m', '1h', '6h', '24h'];
    changeTitles.forEach(title => {
        const titleField=createElementAndAppend(changeTableHeadRow, "th", element_classes=null, element_id = null, elementText=title);

    })
    const changeTableBody=createElementAndAppend(changeTable, "tbody", element_classes=null, element_id = null, elementText=null);
    const PriceChangeRow=createElementAndAppend(changeTableBody, "tr", element_classes=null, element_id = null, elementText=null);
    const priceChangeTitleVal=createElementAndAppend(PriceChangeRow, "td", element_classes=null, element_id = null, elementText='PRICE: ');
    const changeValues=['m5', 'h1', 'h6', 'h24'];

    changeValues.forEach(change => {
        const priceVal=createElementAndAppend(PriceChangeRow, "td", element_classes=null, element_id = null, elementText=priceChanges[change]);
        if (priceChanges[change]<0) {
            priceVal.classList.add('negative-val');
        }
        if (priceChanges[change]>0) {
            priceVal.classList.add('positive-val');
        }
    })

    const volumeChangeRow=createElementAndAppend(changeTableBody, "tr", element_classes=null, element_id = null, elementText=null);
    const volumeChangeTitleVal=createElementAndAppend(volumeChangeRow, "td", element_classes=null, element_id = null, elementText='VOL: ');

    changeValues.forEach(change => {
        const volValue=volumeChanges[change];
        const volValueFinal=Math.round((parseFloat(volValue)*100))/100
        const volValCell=createElementAndAppend(volumeChangeRow, "td", element_classes=null, element_id = null, elementText=volValueFinal);
        if (volValue == 0) {
            volValCell.textContent ="--";
        }
        else {
            volValCell.textContent=formatVolume(Math.round(volValue));
        }
    })
    const tranSecTitle=createElementAndAppend(container, "p", element_classes=["datapoint-name"], element_id = null, elementText='TRAN CHG');
    const tranData = data.included[0].attributes.transactions;
    const tranTable=createElementAndAppend(container, "table", element_classes=null, element_id = null, elementText=null);
    const tranTableHead=createElementAndAppend(tranTable, "thead", element_classes=null, element_id = null, elementText=null);
    const tranTableHeadRow=createElementAndAppend(tranTableHead, "tr", element_classes=null, element_id = null, elementText=null);
    const tranTitles = ['trade', '5m', '15m', '30m', '1h', '24h'];
    tranTitles.forEach(title => {
        const titleField=createElementAndAppend(tranTableHeadRow, "th", element_classes=null, element_id = null, elementText=title);

    })
    const tranChangeValues=['m5', 'm15', 'm30', 'h1', 'h24'];
    const tranFieldTypes = ['buys', 'sells', 'buyers', 'sellers'];
    const tranTableBody=createElementAndAppend(tranTable, "tbody", element_classes=null, element_id = null, elementText=null);
    tranFieldTypes.forEach(tranField => {
        const tranDataRow=createElementAndAppend(tranTableBody, "tr", element_classes=null, element_id = null, elementText=null);
        // const tranTitleVal=createElementAndAppend(tranDataRow, "td", element_classes=null, element_id = null, elementText=`${tranField.toUpperCase()}: `);
        const tranTitleVal=createElementAndAppend(tranDataRow, "td", element_classes=null, element_id = null, elementText=`${tranField.toUpperCase()}: `);
        tranChangeValues.forEach(tranVal => {
            const newField=createElementAndAppend(tranDataRow, "td", element_classes=null, element_id = null, elementText=tranData[tranVal][tranField]);

        })

    })

}

function populateDexData(tokenAddress, container) {
    console.log(`Getting dex data for ${tokenAddress}`);
    fetchTokenData(tokenAddress).then(data => {
        if (data) {
            // Process the data here

            try {
                fillRecentActivity(data, container);
            }
            catch(err) {
                console.log(err);
                const fieldValue=createElementAndAppend(container, "p", element_classes=null, element_id = null, elementText='Dex data not yet available');
            }
            
        }
    }).catch(error => {
        console.error("Error handling token data:", error);
    });
}

function createTokenDetailsTab(tokenAddress, data) {
    // still need to figure out how to reference and loop
    const mainDataContainer = document.getElementById('all-data-container');
    const selectRibbon = document.getElementById('main-tabs');
    for (let i=0; i<mainDataContainer.children.length; i++) {
        mainDataContainer.children[i].style.display="none"
    }
    // createElementAndAppend(parent, tagName, element_classes=null, element_id = null, elementText=null)
    const newTab=createElementAndAppend(selectRibbon, "div", element_classes=["select-tab"], element_id = `data-tab-${tokenAddress}`, elementText=data.token[0].name);
    const x_button=createElementAndAppend(newTab, "div", element_classes=["x_button"], element_id = `x_button-${tokenAddress}`, elementText="x");
    const newPage=createElementAndAppend(mainDataContainer, "div", element_classes=["content-container"], element_id = `data-page-${tokenAddress}`, elementText=null);
    x_button.addEventListener('click', function(event) {

        appManager.handleDexIntervals(null);
        event.stopPropagation();
        newTab.remove();
        newPage.remove();
        switchBetweenPages(document.getElementById('main-tab-tokens'), document.getElementById('data-page-tokens'),document.getElementById('all-data-container'),document.getElementById('main-tabs'));
        appManager.tokenTabs=appManager.tokenTabs.filter(item => item !== tokenAddress);

    })
    const detailsRibbon=createElementAndAppend(newPage, "div", element_classes=["select-ribbon"], element_id = `ribbon-details-${tokenAddress}`, elementText=null);
    const detailsPageContainer=createElementAndAppend(newPage, "div", element_classes=null, element_id = `ribbon-page-container-${tokenAddress}`, elementText=null);
    const detailedTabs = {overview:['Overview'], transactionSummary:['Transaction Summary'], transactionFull:['Transactions Full'], recentActivity:['recentActivity'], socialAnalytics:['Social Analytics']}

    for (const key in detailedTabs) {
        const detailedTab=createElementAndAppend(detailsRibbon, "div", element_classes=["select-tab"], element_id = `detailed-tab-${key}-${tokenAddress}`, elementText=detailedTabs[key][0]);
        const detailedPage=createElementAndAppend(detailsPageContainer, "div", element_classes=null, element_id = `detailed-page-${key}-${tokenAddress}`, elementText=null);
        // detailedTab.addEventListener
        detailedTab.addEventListener('click', () => {
            switchBetweenPages(detailedTab, detailedPage, detailsPageContainer, detailsRibbon);

            if (key === "overview") {
                populateDexData(tokenAddress, document.getElementById(`overview-middle-column-${tokenAddress}`));
                const dexInterval = setInterval(() => {
                    populateDexData(tokenAddress, document.getElementById(`overview-middle-column-${tokenAddress}`));
                }, 30000);
                appManager.handleDexIntervals(dexInterval);
            }


        })
    }

    

    
    // Overview data
    const overviewPage=document.getElementById(`detailed-page-overview-${tokenAddress}`);
    const topRow=createElementAndAppend(overviewPage, "div", element_classes=["top-row"], element_id = `overview-top-row-${tokenAddress}`, elementText=null);
    const leftColumn=createElementAndAppend(topRow, "div", element_classes=["left-column"], element_id = `overview-left-column-${tokenAddress}`, elementText=null);
    const tokenData = data.token[0];
    const leftColTitle=createElementAndAppend(leftColumn, "h3", element_classes=["datapoint-name"], element_id = null, elementText="PUMP.FUN DATA");
    
    const nameAndSymbolField=createElementAndAppend(leftColumn, "p", element_classes=["datapoint-name"], element_id = null, elementText=`${tokenData.name} - $${tokenData.symbol}`);
    const tokenAddressField=createElementAndAppend(leftColumn, "p", element_classes=["data-field-named"], element_id = null, elementText=tokenAddress);
    const description=createElementAndAppend(leftColumn, "p", element_classes=["data-field-named"], element_id = null, elementText=`${tokenData.description}`);
    // switchBetweenPages(newTab, newPage);
    
    const allDetailedData = {Created: formatter.format(new Date(tokenData.created_timestamp)), Bonded: formatter.format(new Date(tokenData.last_trade_timestamp)), MC: formatDollars.format(tokenData.usd_market_cap)}
    for (const key in allDetailedData) {
        const container=createElementAndAppend(leftColumn, "div", element_classes=["data-field-named"], element_id = null, elementText=null);
        const title=createElementAndAppend(container, "p", element_classes=["datapoint-name"], element_id = null, elementText=`${key}:  `);
        const fieldValue=createElementAndAppend(container, "p", element_classes=null, element_id = null, elementText=allDetailedData[key]);
        
    }

    const summaryData=data.summaryData;
    const devLink=`https://solscan.io/account/${summaryData.dev}`
    const devContainer=createElementAndAppend(leftColumn, "div", element_classes=["data-field-named"], element_id = null, elementText=null);
    const devTitle=createElementAndAppend(devContainer, "p", element_classes=["datapoint-name"], element_id = null, elementText='Dev:');
    const devFieldText=createElementAndAppend(devContainer, "p", element_classes=null, element_id = null, elementText=null, href=null);
    const devField=createElementAndAppend(devFieldText, "a", element_classes=["datapoint-name"], element_id = null, elementText=`${summaryData.dev.substring(0,7)}...`, href=devLink);

    const summaryDic={bondingTime:'Bond Time', transactions:'Transactions', holders:'Holders', heldByDev:'Held by Dev', heldByTop5:'Held by top 5', heldByTop10:'Held by top 10'}
    for (const key in summaryDic) {
        const container=createElementAndAppend(leftColumn, "div", element_classes=["data-field-named"], element_id = null, elementText=null);
        const title=createElementAndAppend(container, "p", element_classes=["datapoint-name"], element_id = null, elementText=`${summaryDic[key]}:`);
        const fieldValue=createElementAndAppend(container, "p", element_classes=null, element_id = null, elementText=summaryData[key]);
        
    }
    const twitterLink=data.token[0].twitter;
    const telegramLink=data.token[0].telegram;
    const siteLink=data.token[0].website;

    if (twitterLink !== null | telegramLink !== null | siteLink !== null) {
        const socialsContainer=createElementAndAppend(leftColumn, "div", element_classes=["small-images"], element_id = null, elementText=null);
        const socialsList = [[twitterLink, 'xlogo'], [telegramLink, 'telegramlogo'], [siteLink, 'websitelogo']]
        socialsList.forEach(soc => {
            if (soc[0] !== null) {
                createLinkedImage (socialsContainer, soc[0], `static/${soc[1]}.png`);
            }
        })

    }

    const pfNote=createElementAndAppend(leftColumn, "p", element_classes=null, element_id = null, elementText="*data as of bonding on pump.fun");
    pfNote.style.fontSize="12px";
    pfNote.style.fontStyle="italic";

    //Center column
    const middleColumn=createElementAndAppend(topRow, "div", element_classes=["center-column"], element_id = `overview-middle-column-${tokenAddress}`, elementText=null);
    // const centerColTitle=createElementAndAppend(middleColumn, "p", element_classes=["datapoint-name"], element_id = null, elementText="DEX DATA");
    
    // const testVal=createElementAndAppend(middleColumn, "p", element_classes=null, element_id = null, elementText='testestestests tes test set s et se t setset ');
    populateDexData(tokenAddress, middleColumn);
    const dexInterval = setInterval(() => {
        populateDexData(tokenAddress, middleColumn);
    }, 30000);
    appManager.handleDexIntervals(dexInterval);


    //right column
    const rightColumn=createElementAndAppend(topRow, "div", element_classes=["right-column"], element_id = `overview-right-column-${tokenAddress}`, elementText=null);
    const largeImage=document.createElement('img');
    largeImage.src=tokenData.image_url;
    largeImage.alt='Token Image'
    largeImage.classList.add('large-image');
    rightColumn.appendChild(largeImage);
    const smallImageContainer=createElementAndAppend(rightColumn, "div", element_classes=["small-images"], element_id =null, elementText=null,);
    const smallImgDic={pumpfun:['pflogo.png', `https://pump.fun/coin/${tokenData.token_address}`], dex:['dexlogo.png', `https://dexscreener.com/solana/${tokenData.raydium_pool}`], solscan:['solscanlogo.png', `https://solscan.io/token/${tokenData.token_address}`], bubblempas:['bubblemapslogo.png', `https://app.bubblemaps.io/sol/token/${tokenData.token_address}`]};
    for (const key in smallImgDic) {
        smallLink=document.createElement('a');
        smallLink.href=smallImgDic[key][1];
        smallLink.target='_blank';
        const smallImage=document.createElement('img');
        smallImage.src=`static/${smallImgDic[key][0]}`;
        smallImage.alt='small image'
        smallLink.appendChild(smallImage);
        smallImageContainer.appendChild(smallLink);
    }

    const bottomContainer=createElementAndAppend(overviewPage, "div", element_classes=["bottom-container"], element_id = `overview-bottom-row-${tokenAddress}`, elementText=null);
    const redFlagsTitle=createElementAndAppend(bottomContainer, "h3", element_classes=["datapoint-name"], element_id = null, elementText='RED FLAGS');
    data.summaryData.redFlags.forEach(flag => {
        const redFlag=createElementAndAppend(bottomContainer, "p", element_classes=["red-flag"], element_id = null, elementText=flag);
        redFlag.style.color='red';

    })

    const tranSummary=document.getElementById(`detailed-page-transactionSummary-${tokenAddress}`);
    const tranSummarySection=createElementAndAppend(tranSummary, "section", element_classes=["section"], element_id = `tranSummary-section-${tokenAddress}`, elementText=null);
    const tranSummaryHeader=createElementAndAppend(tranSummarySection, "h1", element_classes=null, element_id = null, elementText='Transaction Summary');
    const tranSummaryTable=createElementAndAppend(tranSummarySection, "table", element_classes=null, element_id = `tranSummary-table-${tokenAddress}`, elementText=null);
    const tranSummaryTableHead=createElementAndAppend(tranSummaryTable, "thead", element_classes=null, element_id = null, elementText=null);
    const tranSummaryTableRow1=createElementAndAppend(tranSummaryTableHead, "tr", element_classes=null, element_id = null, elementText=null);
    const tableTitles = ['owner', 'trades', 'netTokens', 'totalTokensTraded', 'netSol', 'totalSolVol', 'firstTrade', 'lastTrade', 'supply%']
    tableTitles.forEach(title => {
        const tableTitle=createElementAndAppend(tranSummaryTableRow1, "th", element_classes=null, element_id = null, elementText=title);

    })
    const tranSummaryTableBody=createElementAndAppend(tranSummaryTable, "tbody", element_classes=null, element_id = null, elementText=null);
    data.aggregation.forEach((owner) => {
        const tranSummaryRow=createElementAndAppend(tranSummaryTableBody, "tr", element_classes=null, element_id = null, elementText=null);
        const wallet=owner.owner
        const traderLink=`https://solscan.io/account/${wallet}`
        var traderWalletText=`${wallet.substring(0,7)}...`;
        if (owner.owner===data.summaryData.dev) {
            tranSummaryRow.classList.add('marked-row');
            traderWalletText+='DEV';
        }
        const traderField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=null, href=traderLink);
        const traderFieldHref=createElementAndAppend(traderField, "a", element_classes=null, element_id = null, elementText=traderWalletText, href=traderLink);
        // summaryData.dev
        const tradesField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=owner.trades);
        const netTokensField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatNumbersSimple.format(parseInt(owner.netTokens)));
        const totalTokensField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatNumbersSimple.format(parseInt(owner.totalTokensTraded)));
        const solField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=Math.round(owner.netSol*100)/100);
        const totalSolField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=Math.round(owner.totalSolVol*100)/100);
        const firstTradeField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatter.format(new Date(owner.firstTrade)));
        const lastTradeField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatter.format(new Date(owner.lastTrade)));
        const percentField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=Math.round(owner.supply_pct*1000)/10);


    })

    const tranFull=document.getElementById(`detailed-page-transactionFull-${tokenAddress}`);
    const tranFullSection=createElementAndAppend(tranFull, "section", element_classes=["section"], element_id = `tranSummary-section-${tokenAddress}`, elementText=null);
    const tranFullHeader=createElementAndAppend(tranFullSection, "h1", element_classes=null, element_id = null, elementText='All Transactions');
    const tranFullTable=createElementAndAppend(tranFullSection, "table", element_classes=null, element_id = `tranSummary-table-${tokenAddress}`, elementText=null);
    const tranFullTableHead=createElementAndAppend(tranFullTable, "thead", element_classes=null, element_id = null, elementText=null);
    const tranFullTableRow1=createElementAndAppend(tranFullTableHead, "tr", element_classes=null, element_id = null, elementText=null);
    const tableTitles2 = ['date', 'owner', 'tradeType', 'sol', 'tokenAmount', 'hash']
    tableTitles2.forEach(title => {
        const tableTitle=createElementAndAppend(tranFullTableRow1, "th", element_classes=null, element_id = null, elementText=title);

    })
    const tranFullTableBody=createElementAndAppend(tranFullTable, "tbody", element_classes=null, element_id = null, elementText=null);
    data.transactions.forEach((trade) => {
        const tranSummaryRow=createElementAndAppend(tranFullTableBody, "tr", element_classes=null, element_id = null, elementText=null);
        // const tradeDate=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatter.format(new Date(trade.date)));
        const tradeDate=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatter.format(new Date(trade.date)));
        const wallet=trade.owner
        const traderLink=`https://solscan.io/account/${wallet}`
        const traderField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=null, href=traderLink);
        const traderFieldHref=createElementAndAppend(traderField, "a", element_classes=null, element_id = null, elementText=`${wallet.substring(0,7)}...`, href=traderLink);
        // summaryData.dev
        const tradeTypeField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=trade.tradeType);
        const solField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=Math.round(trade.sol*100)/100);
        const tokenAmountField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatNumbersSimple.format(parseInt(trade.tokenAmount)));
        const tradeHash=trade.hash
        const hashLink=`https://solscan.io/tx/${tradeHash}`
        const hashField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=null, href=traderLink);
        const hashFieldHref=createElementAndAppend(hashField, "a", element_classes=null, element_id = null, elementText=`${tradeHash.substring(0,10)}...`, href=hashLink);
    


    })
    const recentActivityPage=document.getElementById(`detailed-page-recentActivity-${tokenAddress}`);
    const bottomContainerRecentActivity=createElementAndAppend(recentActivityPage, "div", element_classes=["bottom-container"], element_id = null, elementText=null);
    const largeTitle=createElementAndAppend(bottomContainerRecentActivity, "p", element_classes=["large-text"], element_id = null, elementText='IN PROGRESS...');
    const raWords = ["Things I'd like to add but am not able to scale/automate at the moment:", "-Include recent data from geckoterminal or dex's API, like price, volume and other metrics", 
        "-Pull recent data from Solscan's API"]
        raWords.forEach(phrase => {
            const line=createElementAndAppend(bottomContainerRecentActivity, "p", element_classes=["large-text2"], element_id = null, elementText=phrase);

        })

    const socialAnalyticsPage=document.getElementById(`detailed-page-socialAnalytics-${tokenAddress}`);
    const bottomContainerSocialAnalytics=createElementAndAppend(socialAnalyticsPage, "div", element_classes=["bottom-container"], element_id = null, elementText=null);
    const largeTitleSA=createElementAndAppend(bottomContainerSocialAnalytics, "p", element_classes=["large-text"], element_id = null, elementText='IN PROGRESS...');
    const saWords = ["Things I'd like to add, if I could justify the price of X's API:", "-Number of mentions/interactions on X", 
        "-Show what KOL's are shilling what tokens (especially the bad ones)", "Social media interactions over time", "-And much more..."]
        saWords.forEach(phrase => {
            const line=createElementAndAppend(bottomContainerSocialAnalytics, "p", element_classes=["large-text2"], element_id = null, elementText=phrase);

        })

    switchBetweenPages(newTab, newPage,document.getElementById('all-data-container'),document.getElementById('main-tabs'));
    // switchBetweenPages(`detailed-tab-overview-${tokenAddress}`, `detailed-page-overview-${tokenAddress}`, detailsPageContainer, detailsRibbon);
    newTab.addEventListener('click', () => {
        switchBetweenPages(newTab, newPage,document.getElementById('all-data-container'),document.getElementById('main-tabs'));
        populateDexData(tokenAddress, document.getElementById(`overview-middle-column-${tokenAddress}`));
        const dexInterval = setInterval(() => {
            populateDexData(tokenAddress, document.getElementById(`overview-middle-column-${tokenAddress}`));
        }, 30000);
        appManager.handleDexIntervals(dexInterval);

        
    })
    switchBetweenPages(document.getElementById(`detailed-tab-overview-${tokenAddress}`), document.getElementById(`detailed-page-overview-${tokenAddress}`), document.getElementById(`ribbon-page-container-${tokenAddress}`), document.getElementById(`ribbon-details-${tokenAddress}`));
    appManager.tokenTabs.push(tokenAddress);
}


function openTokenData(tokenAddress) {

    if (appManager.tokenTabs.includes(tokenAddress)) {
        switchBetweenPages(document.getElementById(`data-tab-${tokenAddress}`), document.getElementById(`data-page-${tokenAddress}`),document.getElementById('all-data-container'),document.getElementById('main-tabs'));
        switchBetweenPages(document.getElementById(`detailed-tab-overview-${tokenAddress}`), document.getElementById(`detailed-page-overview-${tokenAddress}`), document.getElementById(`ribbon-page-container-${tokenAddress}`), document.getElementById(`ribbon-details-${tokenAddress}`));
        
    }
    else {
        fetch(`/token_details/${tokenAddress}`)
        .then(response => response.json())  // Parse the JSON response
        .then(data => {
    
            createTokenDetailsTab(tokenAddress, data)
        
        })
        .catch(error => {
            console.error('Error fetching token data:', error);
        });
    


    }

    // fetch(`/token_details/${tokenAddress}`)
    // .then(response => response.json())  // Parse the JSON response
    // .then(data => {

    //     createTokenDetailsTab(tokenAddress, data)
    
    // })
    // .catch(error => {
    //     console.error('Error fetching token data:', error);
    // });

}


function populateSearchResults(data) {
    searchDropdown = document.getElementById("searchDropdown");
    if (data.length>0) {
        const searchTableBody=document.getElementById("table-body-searchResults");
        searchDropdown.classList.add("active");
        searchTableBody.innerHTML="";

        data.forEach(d => {
            const row=createElementAndAppend(searchTableBody, "tr", element_classes=null, element_id = null, elementText=null);
            const name=createElementAndAppend(row, "td", element_classes=null, element_id = null, elementText=d[0]);
            const symbol=createElementAndAppend(row, "td", element_classes=null, element_id = null, elementText=d[1]);
            const marketCap=createElementAndAppend(row, "td", element_classes=null, element_id = null, elementText=formatDollars.format(d[3]));
            row.addEventListener("click", () => {
                openTokenData(d[2]);
                searchDropdown.classList.remove("active");
            })
        })
        // searchDropdown.classList.remove("hidden");
        


    }
}

const searchBox = document.getElementById('searchBox');
const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', () => {
    const searchTerm = searchBox.value;
    searchBox.value = "";

    if (searchTerm.length>2) {


        fetch("/searchToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ searchTerm: searchTerm})
        })
        .then(response => response.json())
        .then(data => {

            populateSearchResults(data);
        })
    }
    else {
        console.log("too short");
    }

})
