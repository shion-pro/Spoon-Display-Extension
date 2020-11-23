// "use strict";

socket = io.connect("http://localhost:5569", {"transports": ["websocket", "polling"]});

console.log("Running Spoon-Display-Extension");

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    return;
})

lastMessageData = {type:"none", author:"none", content:"none", present_type:"none"};

commentCheckLoop();

function commentCheckLoop() {
    // check new comment
    message = $(".chat-list-item:last");
    message_classes = message.attr("class");
    messageData = {type:"none", author:"none", content:"none", present_type:"none"};
    try {
        if (message_classes.includes("guide")) {
            // spoon guide
            // pass
        } else if (message_classes.includes("enter")) {
            // enter
            author = message.find("p").text().replace("さんが入室したよ", "");
            content = "さんが入室したよ!";
            messageData = {type:"enter", author:author, content:content, present_type:"none"};
        } else if (message_classes.includes("message")) {
            // comment
            author = message.find(".name").text();
            content = message.find("pre").text();
            messageData = {type:"message", author:author, content:content, present_type:"none"};
        } else if (message_classes.includes("combo")) {
            // combo comment
            author = lastMessageData.author;
            content = message.find("pre").text();
            messageData = {type:"combo", author:author, content:content, present_type:"none"};
        } else if (message_classes.includes("like")) {
            // heart
            author = message.find("p").text().replace("さんがハートを押したよ！", "");
            content = "さんがハートを押したよ!";
            messageData = {type:"like", author:author, content:content, present_type:"none"};
        } else if (message_classes.includes("present")) {
            // present
            author = message.find(".name").text();
            console.log("preそのまま", message.find("pre").text());
            content = message.find("pre").text().replace("\"", "").replace(/[\"]/g,""); // dq escape いったんこれでやってみる
            console.log("dqエスケープver", content);
            present_type_src = message.find(".sticker-thumbnail img").attr("src").split("/");
            // get present_src
            present_type = present_type_src[present_type_src.length-3] + "\\" + present_type_src[present_type_src.length-1];
            console.log("present_type", present_type);
            messageData = {type:"present", author:author, content:content, present_type:present_type};
            console.log("messageData", messageData);
        } else if (message_classes.includes("play")) {
            // voting
            author = "none";
            content = message.find("p").text();
            messageData = {type:"play", author:author, content:content, present_type:"none"};
        } else if (message_classes.includes("follow")) {
            // follow
        } else {
            // pass
        }
        if (messageData.type != lastMessageData.type || messageData.author != lastMessageData.author || messageData.content != lastMessageData.content) {
            console.log(messageData);
            lastMessageData = messageData;
            socket.emit("chat", messageData);
        }
    } catch {
        // pass
    }
    setTimeout("commentCheckLoop()", 100);
}