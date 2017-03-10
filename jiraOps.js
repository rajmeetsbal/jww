var workSpace = require("./workSpace.js");
var request = require("request");

var JIRA_AUTH_STRING = process.env.JIRA_AUTH_STRING;

const jiraURL = process.env.JIRA_URL;
const jiraSearch = "/rest/api/2/search";
const jiraIssueURL = "/rest/api/2/issue/";



const listBugs = (numOfDays, spaceId) => {
    console.log("request for listBugs");
    var jiraOptions = {
		    "method": "GET",
		    "url": `${jiraURL}${jiraSearch}?jql=createdDate%20%3E%20-`+numOfDays+`d%20AND%20issuetype%20=%20Bug%20`,
		    "headers": {
		        'Authorization': `Basic `+JIRA_AUTH_STRING
		      }, 
		      "rejectUnauthorized": false
		  };
    console.log("firing "+jiraOptions.url +" from listBugs");


    request(jiraOptions, function (err, response, jiraSearchBody) {
        if (err) {
            console.log("error has occured while calling jira listBugs API" + err);
        }
        else {
        	if(response.statusCode == 200){
	            var searchBody = JSON.parse(jiraSearchBody);
	            console.log("sending bug list");
				  var issues = searchBody.issues;
				  var listMsg = "";
				  if(issues.length == 0){
					  listMsg = "No bugs were opened in last " + numOfDays + "days";
				  }else{
					  for(var i=0;i<issues.length;i++){
						  listMsg = listMsg + issues[i].id + " : " + issues[i].fields.summary + "\n";
					  }
				  }
	            workSpace.postMessage(listMsg, spaceId);
        	}else{
        		workSpace.postMessage("could not get list. response code : "+response.statusCode, spaceId);
        	}
        }
    });//jira bug list request ends 

};

const listIssues = (numOfDays, spaceId) => {
    console.log("request for listIssuess");
    var jiraOptions = {
		    "method": "GET",
		    "url": `${jiraURL}${jiraSearch}?jql=createdDate%20%3E%20-`+numOfDays+`d%20`,
		    "headers": {
		        'Authorization': `Basic `+JIRA_AUTH_STRING
		      }, 
		      "rejectUnauthorized": false
		  };
    console.log("firing "+jiraOptions.url +" from listIssues");


    request(jiraOptions, function (err, response, jiraSearchBody) {
        if (err) {
            console.log("error has occured while calling jira listBugs API" + err);
        }
        else {
        	if(response.statusCode == 200){
	            var searchBody = JSON.parse(jiraSearchBody);
	            console.log("sending issue list");
				  var issues = searchBody.issues;
				  var listMsg = "";
				  var listMsg = "";
				  if(issues.length == 0){
					  listMsg = "No bugs were opened in last " + numOfDays + "days";
				  }else{
					  for(var i=0;i<issues.length;i++){
						  listMsg = listMsg + issues[i].id + " : " + issues[i].fields.summary + "\n";
					  }
				  }
	            workSpace.postMessage(listMsg, spaceId);
        	}else{
        		workSpace.postMessage("could not get list. response code : "+response.statusCode, spaceId);
        	}
        }
    });//jira bug list request ends 

};

const getBugsCount = (numOfDays, spaceId) => {
    console.log("request for listIssuess");
    var jiraOptions = {
		    "method": "GET",
		    "url": `${jiraURL}${jiraSearch}?jql=createdDate%20%3E%20-`+numOfDays+`d%20AND%20issuetype%20=%20Bug%20`,
		    "headers": {
		        'Authorization': `Basic `+JIRA_AUTH_STRING
		      }, 
		      "rejectUnauthorized": false
		  };

    console.log("firing "+jiraOptions.url +" from getBugsCount");
    request(jiraOptions, function (err, response, jiraSearchBody) {
        if (err) {
            console.log("error has occured while calling jira getBugsCount API" + err);
        }
        else {
        	if(response.statusCode == 200){
        		var searchBody = JSON.parse(jiraSearchBody);
                console.log("response from getBugsCount "+searchBody.total);
                console.log("sending bugs count");
    			  var totalIssues = searchBody.total;
                workSpace.postMessage("'"+totalIssues+"'", spaceId);
        	}else{
        		workSpace.postMessage("could not get count. response code : "+response.statusCode, spaceId);
        	}
            
        }
    });//jira bug list request ends 

};

const getIssuesCount = (numOfDays, spaceId) => {
    console.log("request for listIssuess");
    var jiraOptions = {
		    "method": "GET",
		    "url": `${jiraURL}${jiraSearch}?jql=createdDate%20%3E%20-`+numOfDays+`d%20`,
		    "headers": {
		        'Authorization': `Basic `+JIRA_AUTH_STRING
		      }, 
		      "rejectUnauthorized": false
		  };
    console.log("firing "+jiraOptions.url +" from getIssuesCount");
    request(jiraOptions, function (err, response, jiraSearchBody) {
        if (err) {
            console.log("error has occured while calling jira getIssuesCount API" + err);
        }
        else {
        	if(response.statusCode == 200){
	            var searchBody = JSON.parse(jiraSearchBody);
	            console.log("sending bugs count");
				var totalIssues = searchBody.total;
	            workSpace.postMessage("'"+totalIssues+"'", spaceId);
        	}else{
        		workSpace.postMessage("could not get count. response code : "+response.statusCode, spaceId);
        	}
        }
    });//jira bug list request ends 

};

const getIssueDetail = (id, spaceId) => {
    console.log("request for listIssuess");
    var jiraOptions = {
		    "method": "GET",
		    "url": `${jiraURL}${jiraIssueURL}`+id,
		    "headers": {
		        'Authorization': `Basic `+JIRA_AUTH_STRING
		      }, 
		      "rejectUnauthorized": false
		  };
    console.log("firing "+jiraOptions.url +" from getIssueDetail");


    request(jiraOptions, function (err, response, jiraSearchBody) {
        if (err) {
            console.log("error has occured while calling jira getIssueDetail API" + err);
        }
        else {
        	if(response.statusCode == 200){
        		try{
	            var searchBody = JSON.parse(jiraSearchBody);
	            console.log("sending issue detail");
				  var summary = searchBody.fields.summary;
				  var creator = searchBody.fields.creator.displayName;
				  var descr = searchBody.fields.issuetype.description;
				  var type = searchBody.fields.issuetype.name;
				  var project = "";
				  var projectId = "";
				  if(searchBody.fields.project.projectCategory){
					  project = searchBody.fields.project.projectCategory.name;
					  projectId = searchBody.fields.project.projectCategory.id;
				  } else{
					  project = searchBody.fields.project.name;
					  projectId = searchBody.fields.project.id;
				  }
				  var assignee = searchBody.fields.assignee;
				  var assigneeName = "Unassigned";
				  if(assignee != null){
					  assigneeName = assignee.displayName;
				  }
				  var priority = searchBody.fields.priority.name;
				var msToSend = "Summary : "+ summary +"\n" + "Priority : "+ priority +"\n" + "Assignee : "+ assigneeName +"\n" + "Creator : "+ creator +"\n" + "Description : "+ descr +"\n" + "Type : "+ type +"\n" + "Project : "+ project +"\n" + "Project id : "+ projectId +"\n";
				  
	            workSpace.postMessage(msToSend, spaceId);
        		}catch(erro){
        			console.log("err caught : "+erro.message);
        			workSpace.postMessage("Some problem occured : "+erro.message);
        		}
        	}else{
        		workSpace.postMessage("could not get detail. response code : "+response.statusCode + " Message : "+response.statusMessage , spaceId);
        	}
        }
    });//jira bug list request ends 

    //getComments
    //https://jira.atlassian.com/rest/api/2/issue/BAM-2345/comment
};

const assignIssue = (issueID, assignName, spaceId) => {
    console.log("request for assignIssue");
    var jiraOptions = {
		    "method": "PUT",
		    "url": `${jiraURL}${jiraIssueURL}`+issueID+`/assignee`,
		    "headers": {
		        'Authorization': `Basic `+JIRA_AUTH_STRING
		      }, 
		      "rejectUnauthorized": false,
		      "json" : {
		    	    "name": assignName
		      }
		      
		  };
    console.log("firing "+jiraOptions.url +" from getIssueDetail");


    request(jiraOptions, function (err, response, jiraSearchBody) {
        if (err) {
            console.log("error has occured while calling jira assignIssue API" + err);
        }
        else {
        	if(response.statusCode == 204){
        		workSpace.postMessage("Assignment successful", spaceId);
        	}else{
        		workSpace.postMessage("Could not do the assignment. response code : "+response.statusCode + "Message : "+ response.statusMessage, spaceId);
        	}
        }
    });//jira bug list request ends 

    //getComments
    //https://jira.atlassian.com/rest/api/2/issue/BAM-2345/comment
};

const getComments = (iId, spaceId) => {
    console.log("request for getComments");
    var jiraOptions = {
		    "method": "GET",
		    "url": `${jiraURL}${jiraIssueURL}`+iId+`/comment`,
		    "headers": {
		        'Authorization': `Basic `+JIRA_AUTH_STRING
		      }, 
		      "rejectUnauthorized": false
		  };
    console.log("firing "+jiraOptions.url +" from getComments");


    request(jiraOptions, function (err, response, jiraSearchBody) {
        if (err) {
            console.log("error has occured while calling jira listBugs API" + err);
        }
        else {
        	if(response.statusCode == 200){
	            var searchBody = JSON.parse(jiraSearchBody);
	            console.log("getting comments");
				  var comments = searchBody.comments;
				  var cmtMsg = "";
				  if(comments.length == 0){
					  cmtMsg = "No comments were found for " + iId;
				  }else{
					  var count = 1;
					  for(var i=0;i<comments.length;i++){
						  cmtMsg = cmtMsg + " " + count + ". " +comments[i].author.displayName + " : " + comments[i].body + "\n";
						  count++;
					  }
				  }
	            workSpace.postMessage(cmtMsg, spaceId);
        	}else{
        		workSpace.postMessage("could not get comments. response code : "+response.statusCode, spaceId);
        	}
        }
    });//jira bgetComments request ends 

};

const addComment = (issID, commentString, spaceId) => {
    console.log("request for add comment");
    var jiraOptions = {
		    "method": "POST",
		    "url": `${jiraURL}${jiraIssueURL}`+issID+`/comment`,
		    "headers": {
		        'Authorization': `Basic `+JIRA_AUTH_STRING
		      }, 
		      "rejectUnauthorized": false,
		      "json" : {
		    	    "body": commentString
		      }
		      
		  };
    console.log("firing "+jiraOptions.url +" from addComment");


    request(jiraOptions, function (err, response, jiraSearchBody) {
        if (err) {
            console.log("error has occured while calling jira addComment API" + err);
        }
        else {
        	if(response.statusCode == 201){
        		workSpace.postMessage("Comment added", spaceId);
        	}else{
        		workSpace.postMessage("Could not add comment. response code : "+response.statusCode + "Message : "+ response.statusMessage, spaceId);
        	}
        }
    });//jira bug list request ends 

    //getComments
    //https://jira.atlassian.com/rest/api/2/issue/BAM-2345/comment
};
//https://ameetbharti.atlassian.net/rest/api/2/issue/10103/comment


module.exports = {
    listBugs: listBugs,
    listIssues: listIssues,
    getBugsCount : getBugsCount,
    getIssuesCount : getIssuesCount,
    getIssueDetail : getIssueDetail,
    assignIssue : assignIssue,
    addComment : addComment,
    getComments : getComments
};
