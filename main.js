// "use strict";

socket = io.connect("http://localhost:5569", {"transports": ["websocket", "polling"]});

console.log("Running Spoon-Display-Extension");

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    return;
})

lastMessageData = {type:"none", author:"none", auth_img:"none", content:"none", present_type:"none"};

// not to lost connection
function connectingSocket() {
    socket.emit("chat", "connecting");
    setTimeout("connectingSocket()", 1000);
}

// send message
function sendMessage(send_message) {
    function setKeywordText(text) {
        var el = document.getElementsByClassName("input-wrap")[0].getElementsByTagName("textarea")[0];
        el.value = text;
        var evt = document.createEvent("Events");
        evt.initEvent("change", true, true);
        el.dispatchEvent(evt);
    }
    document.getElementsByClassName("input-wrap")[0].getElementsByTagName("textarea")[0].focus();
    setKeywordText(send_message);
    $('.input-wrap').find("button").trigger("click");
}

// return from server
socket.on("returnMessage", function(return_message){
    if (return_message == "connecting") {
        // console.log("connecting...");
    } else {
        console.log("return is:", return_message);
        sendMessage(return_message);
    }
});

function checkComment() {
    // check new comment
    message = $(".chat-list-item:last");
    message_classes = message.attr("class");
    messageData = {type:"none", author:"none", auth_img:"none", content:"none", present_type:"none"};
    try {
        if (message_classes.includes("guide")) {
            // spoon guide
            // pass
        } else if (message_classes.includes("enter")) {
            // enter
            author = message.find("p").text().replace("さんが入室したよ", "");
            content = "さんが入室したよ!";
            messageData = {type:"enter", author:author, auth_img:"none", content:content, present_type:"none"};
        } else if (message_classes.includes("message")) {
            // comment
            author = message.find(".name").text();
            auth_img = String(message.find(".thumbnail").find("button").find("div").attr("style")).split("\"")[1];
            content = message.find("pre").text();
            messageData = {type:"message", author:author, auth_img:auth_img, content:content, present_type:"none"};
            // for test
//             if (content == "sticker") {
//                 messageData = {type:"present", author:author, auth_img:"none", content:"1 Spoon X 4", present_type:"https://static.spooncast.net/jp/stickers/basic/sticker_jp_juice/sticker_jp_juice_web.png"};
//             } else if (content == "buster") {
//                 messageData = {type:"present", author:author, auth_img:"none", content:"10 buster X 4", present_type:"https://static.spooncast.net/jp/stickers/basic/sticker_jp_juice/sticker_jp_juice_web.png"};
//             } else if (content == "heart") {
//                 messageData = {type:"like", author:author, auth_img:"none", content:"さんがハートを押したよ！", present_type:"none"};
//             }
            // ==========
        } else if (message_classes.includes("combo")) {
            // combo comment
            author = lastMessageData.author;
            content = message.find("pre").text();
            messageData = {type:"combo", author:author, auth_img:lastMessageData.auth_img, content:content, present_type:"none"};
            // for test
//             if (content == "sticker") {
//                 messageData = {type:"present", author:author, auth_img:"none", content:"1 Spoon X 4", present_type:"https://static.spooncast.net/jp/stickers/basic/sticker_jp_juice/sticker_jp_juice_web.png"};
//             } else if (content == "buster") {
//                 messageData = {type:"present", author:author, auth_img:"none", content:"10 buster X 4", present_type:"https://static.spooncast.net/jp/stickers/basic/sticker_jp_juice/sticker_jp_juice_web.png"};
//             } else if (content == "heart") {
//                 messageData = {type:"like", author:author, auth_img:"none", content:"さんがハートを押したよ！", present_type:"none"};
//             }
            // ==========
        } else if (message_classes.includes("like")) {
            // heart
            author = message.find("p").text().replace("さんがハートを押したよ！", "");
            content = "さんがハートを押したよ!";
            messageData = {type:"like", author:author, auth_img:"none", content:content, present_type:"none"};
        } else if (message_classes.includes("present")) {
            // present
            author = message.find(".name").text();
            content = message.find("pre").text().replace("\"", "").replace(/[\"]/g,""); // dq escape いったんこれでやってみる
            present_type_src = message.find(".sticker-thumbnail img").attr("src");
            messageData = {type:"present", author:author, auth_img:"none", content:content, present_type:present_type_src};
        } else if (message_classes.includes("play")) {
            // voting
            author = "none";
            content = message.find("p").text();
            messageData = {type:"play", author:author, auth_img:"none", content:content, present_type:"none"};
        } else if (message_classes.includes("follow")) {
            // follow
        } else {
            // pass
        }
        if (messageData.type != lastMessageData.type || messageData.author != lastMessageData.author || messageData.auth_img != lastMessageData.auth_img || messageData.content != lastMessageData.content || messageData.present_type != lastMessageData.present_type) {
            console.log(messageData);
            lastMessageData = messageData;
            my_name = $(".nickname").find("button").html();
            if (messageData.author != my_name) {
                socket.emit("chat", messageData);
            }
        }
    } catch {
        // pass
    }
}

function startCheckComment() {
    observer = new MutationObserver(function(){
        checkComment();
    });
    comments_parent = document.getElementsByClassName("chat-list")[0];
    config = {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
    };
    observer.observe(comments_parent, config);
};

function readyChatList() {
    comments_parent = document.getElementsByClassName("chat-list")[0];
    if (comments_parent == undefined) {
        setTimeout("readyChatList()", 100);
    } else {
        startCheckComment();
    }
}

connectingSocket();

readyChatList();
