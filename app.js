/*eslint-env node, express*/

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require("express");
var request = require("request");
var crypto = require("crypto");
var jiraOps = require("./jiraOps.js");

var APP_ID = process.env.APP_ID;
var APP_SECRET = process.env.APP_SECRET;
var WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
var WEBHOOK_VERIFICATION_TOKEN_HEADER = "X-OUTBOUND-TOKEN".toLowerCase();
var WWS_OAUTH_URL = "https://api.watsonwork.ibm.com/oauth/token";

const jiraKeyword = "@jb";


// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + "/public"));

function rawBody(req, res, next) {
    var buffers = [];
    req.on("data", function (chunk) {
        buffers.push(chunk);
    });
    req.on("end", function () {
        req.rawBody = Buffer.concat(buffers);
        next();
    });
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500);
    res.render("error", {
        error: err
    });
}

app.use(rawBody);
app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
    console.log("INFO: app is listening on port: " + (process.env.PORT || 3000));
});

app.post("/webhook_callback", function (req, res) {
	console.log("processing webhook_callback");
	if (!APP_ID || !APP_SECRET || !WEBHOOK_SECRET) {
	  	console.log("ERROR: Missing variables APP_ID, APP_SECRET or WEBHOOK_SECRET from environment");
	  	return;
	  }
    if (!verifySender(req.headers, req.rawBody)) {
        console.log("ERROR: Cannot verify caller! -------------");
        console.log(req.rawBody.toString());
        res.status(200).end();
        return;
    }

    var body = JSON.parse(req.rawBody.toString());
    var eventType = body.type;
    const spaceId = body.spaceId;
    if (eventType === "verification") {
        handleVerificationRequest(res, body.challenge);
        console.log("INFO: Verification request processed");
        return;
    }

    // Acknowledge we received and processed notification to avoid getting sent the same event again
    res.status(200).end();
//
    if (eventType === "message-created") {
        //returning if @jirabot is not found in start of message
        if (body.content.indexOf(jiraKeyword) != 0) {
            return;
        }
        
//        @jb list bugs created last 2 days 
//        @jb list issues created last 2 days 
//        @jb bug count last 2 days
//        @jb issue count last 2 days
//        @jb issue detail <id>

        var listBugsCreatedInDays = "list bugs created last";
        var listIssuesCreatedInDays = "list issues created last";
        var bugCountDays = "bug count";
        var issueCountDays = "issue count";
        var issueDetail = "issue detail";
        var getComments = "get comments";
        var assignIssue = "assign issue";
        var addComment = "add comment";
        var getComments = "get comments";
        
        console.log("body.content : "+body.content);

        if (body.content.indexOf(listBugsCreatedInDays) != -1) {
            var numOfDays = body.content.split(" ")[5];
            jiraOps.listBugs(numOfDays, spaceId);
        } else if (body.content.indexOf(listIssuesCreatedInDays) != -1) {
            var numOfDays = body.content.split(" ")[5];
            jiraOps.listIssues(numOfDays, spaceId);
        } else if (body.content.indexOf(bugCountDays) != -1) {
            var numOfDays = body.content.split(" ")[4];
            jiraOps.getBugsCount(numOfDays, spaceId);
        } else if (body.content.indexOf(issueCountDays) != -1) {
            var numOfDays = body.content.split(" ")[4];
            jiraOps.getIssuesCount(numOfDays, spaceId);
        } else if (body.content.indexOf(issueDetail) != -1) {
        	var issid = body.content.split(" ")[3];
            jiraOps.getIssueDetail(issid, spaceId);
        } else if (body.content.indexOf(assignIssue) != -1) {
        	var issuid = body.content.split(" ")[3];
        	var assigName = body.content.split(" ")[5];
            jiraOps.assignIssue(issuid, assigName, spaceId);
        } else if (body.content.indexOf(addComment) != -1) {
        	console.log("commentToPost : "+commentToPost);
        	var cont = body.content;
        	var isid = cont.split(" ")[3];
        	console.log("issueid : "+isid);
        	var commentToPost = cont.substring(cont.indexOf('"')+1,cont.lastIndexOf('"'));
        	console.log("commentToPost : "+commentToPost);
            jiraOps.addComment(isid, commentToPost, spaceId);
        } else if (body.content.indexOf(getComments) != -1) {
        	var iid = body.content.split(" ")[3];
            jiraOps.getComments(iid, spaceId);
        }
    }
});



function verifySender(headers, rawbody) {
    var headerToken = headers[WEBHOOK_VERIFICATION_TOKEN_HEADER];
    var endpointSecret = WEBHOOK_SECRET;
    var expectedToken = crypto
        .createHmac("sha256", endpointSecret)
        .update(rawbody)
        .digest("hex");

    if (expectedToken === headerToken) {
        return Boolean(true);
    } else {
        return Boolean(false);
    }
}

function handleVerificationRequest(response, challenge) {
    var responseBodyObject = {
        "response": challenge
    };
    var responseBodyString = JSON.stringify(responseBodyObject);
    var endpointSecret = WEBHOOK_SECRET;

    var responseToken = crypto
        .createHmac("sha256", endpointSecret)
        .update(responseBodyString)
        .digest("hex");

    response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "X-OUTBOUND-TOKEN": responseToken
    });

    response.end(responseBodyString);
}
