/*
**  Name : redhome notice checker
**
**  Author : gb_2312
**
**  Date : 2013-10-30
*/


var pollInterval = 1;  // Timer interval //1 minutes

function getFeedURL(){
    return 'http://bbs.redhome.cc/api/mobile/index.php?mobile=no&version=2&module=mymsgcheck';
}
function getNoticURL(){
    return 'http://bbs.redhome.cc/home.php?mod=space&do=notice';
}
function isNoticeURL(url){
    return url === getNoticURL();
}

function updateIcon(str){
    var result = JSON.parse(str);
    if ( !result.Variables.auth ){
        chrome.browserAction.setTitle({title: '好像没登陆哟'});
        chrome.browserAction.setIcon({path: 'redhome-offline.png'});
        chrome.browserAction.setBadgeBackgroundColor({color: [190, 190, 190, 230]});
        chrome.browserAction.setBadgeText({text: '?'});
    } else {
        var tips = result.Variables.list.newNotice;
            chrome.browserAction.setTitle({title: '有'+tips+'条未读提醒'})
            chrome.browserAction.setIcon({path: 'redhome-online.png'});        
        if (tips > 0) {
            chrome.browserAction.setBadgeBackgroundColor({color: [208, 0, 24, 255]});
            chrome.browserAction.setBadgeText({text: tips});
        } else {
            chrome.browserAction.setBadgeText({text: ''});
        }
    }
}

function getJSON(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){
            updateIcon(xhr.responseText);
        }
    };
    xhr.open('GET', getFeedURL(), true);
    xhr.send();
}

function goToInbox(){
    chrome.tabs.query({url: getNoticURL()}, function(tabs){
        
        // tab catch OR create
        if ( tabs.length === 0 ) {
            chrome.tabs.create({url: getNoticURL()});
            return ;
        }
        var jumpID = tabs[0].id;
        chrome.tabs.update(jumpID, {active: true}, function(tabs){
            chrome.tabs.reload(jumpID);
        })
    });
}

function update(){
    getJSON();
}

function onAlarm(alarm){
    if (alarm && alarm.name === 'update'){
        update();
    }
}

function onInit(){
    update(); //first time run
    // Timer
    chrome.alarms.create('update', {periodInMinutes: pollInterval});
    chrome.alarms.onAlarm.addListener(onAlarm);
    chrome.webNavigation.onCompleted.addListener(update,{url: [{urlEquals: getNoticURL()}]});
    chrome.browserAction.onClicked.addListener(goToInbox);
}

onInit();
